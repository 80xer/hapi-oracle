const oracledb = require('oracledb');
const Promise = require('es6-promise').Promise;
const async = require('async');
const _ = require('lodash');
let pools = {};
let buildupScripts = [];
let teardownScripts = [];

const createPool = config => {
  let dbs = [];
  _.forEach(config, (v, k) => {
    dbs.push({
      'name': k,
      'info': v
    });
  });
  return new Promise((resolve, reject) => {
    async.eachSeries(
      dbs,
      (db, callback) => {
        oracledb.createPool(
          db.info,
          (err, p) => {
            if (err) {
              callback(err);
            }

            pools[db.name] = p;
            callback();
          }
        );
      },
      (err) => {
        if (err) {
          return reject(err);
        }
        resolve(pools);
      }
    );
  });
};

const terminatePool = () => {
  return new Promise((resolve, reject) => {
    if (pools) {
      async.eachSeries(
        pools,
        (p, callback) => {
          p.terminate((err) => {
            if (err) {
              callback(err);
            }
            callback();
          });
        },
        (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        }
      );

    } else {
      resolve();
    }
  });
};

const getPool = () => pools;

// Execution query before pool creation
const addBuildupSql = (statement) => {
  const stmt = {
    sql: statement.sql,
    binds: statement.binds || {},
    options: statement.options || {}
  };

  buildupScripts.push(stmt);
};

// Execution query before pool shutdown
const addTeardownSql = (statement) => {
  const stmt = {
    sql: statement.sql,
    binds: statement.binds || {},
    options: statement.options || {}
  };

  teardownScripts.push(stmt);
};

const getConnection = (db = 'market') => {
  let pool = pools[db];
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      async.eachSeries(
        buildupScripts,
        (statement, callback) => {
          connection.execute(statement.sql, statement.binds, statement.options, err => callback(err));
        },
        (err) => {
          if (err) {
            console.log(err);
            return reject(err);
          }
          resolve(connection);
        }
      );
    });
  });
};

const execute = (sql, bindParams, options, connection) => {
  return new Promise((resolve, reject) => {
    connection.execute(sql, bindParams, options, (err, results) => {
      if (err) {
        console.log(sql);
        console.log(bindParams);
        console.log(options);
        console.log(err);
        return reject(err);
      }

      resolve(results);
    });
  });
};

const releaseConnection = (connection) => {
  async.eachSeries(
    teardownScripts,
    (statement, callback) => {
      connection.execute(statement.sql, statement.binds, statement.options, err => callback(err));
    },
    (err) => {
      if (err) {
        console.error(err);
        return;
      }

      connection.release((err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  );
};

// Create array for resultSet to return json.
const getFetchRows = (resultSet, prefetchRows) => {
  let fetchRows = [];
  let rowsProcessed = 0;
  prefetchRows = prefetchRows || 1000;
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const processResultSet = () => {
      resultSet.getRows(prefetchRows, (err, rows) => {
        if (err) {
          console.log(err);
          return reject(err);
        }

        if (rows.length === 0) {
          // Fetch time output
          // console.log('Finish processing ' + rowsProcessed + ' rows');
          // console.log('Total time (in seconds):', ((Date.now() - startTime)/1000));
          // rowsProcessed += 1;
          resolve(fetchRows);
        }

        if (rows.length) {
          rows.forEach(row => fetchRows.push(row));
          processResultSet();
        }
      });
    };
    processResultSet();
  });
};

// Execute the query without using resultSet.
const exSql = (sql, db = 'market') => {
  let options = {};
  let bindParams = {};
  options.isAutoCommit = true;
  options.resultSet = true;
  options.prefetchRows = 1000;
  return new Promise((resolve, reject) => {
    getConnection(db)
      .then((connection) => {
        execute(sql, bindParams, options, connection)
          .then((results) => {
            getFetchRows(results.resultSet, options.prefetchRows)
              .then((fetchRows) => {
                process.nextTick(() => releaseConnection(connection));
                // Returns an array of value arrays
                resolve(fetchRows);
              })
              .catch((err) => {
                process.nextTick(() => releaseConnection(connection));
                reject(err);
              });

          })
          .catch((err) => {
            reject(err);
            process.nextTick(() => releaseConnection(connection));
          });
      })
      .catch(err => reject(err));
  });
};

// execute stored procedure with outbind cursors
const exSp = (sp, bindParams = {}, db = 'market') => {
  let options = {};
  options.isAutoCommit = true;
  options.outFormat = oracledb.OBJECT;
  return new Promise((resolve, reject) => {
    getConnection(db)
      .then((connection) => {
        execute(sp, bindParams, options, connection)
          .then((results) => {
            // 1. Outbind cursor name extraction.
            let cursorKeys = _.chain(bindParams)
              .keys(bindParams)
              .filter((key) => {
                let val = bindParams[key];
                return (val.dir && val.dir === 3003 && val.type === 2004);
              })
              .value();

            // 2. Outbind cursor extraction.
            // (import only the parameters of the name extracted from step 1 of the bound parameters.)
            let cursors = _.pickBy(results.outBinds, (o, k) => {
              return (_.indexOf(cursorKeys, k) >= 0);
            });

            // 3. Creates a cursor name in the outbind cursor.
            _.forEach(cursors, (o,k) => o.key = k);
            results.outBinds.fetchData = {};

            async.eachSeries(cursors,
              (cursor, callback) => {
                getFetchRows(cursor)
                  .then((fetchRows) => {
                    // 4. Assign fetchData to the cursor name created in step 3.
                    results.outBinds.fetchData[cursor.key] = fetchRows;
                    callback();
                  })
                  .catch((err) => {
                    console.log(err);
                    callback(err);
                  });
              }, (err) => {
                if (err) {
                  console.log(err);
                  process.nextTick(() => releaseConnection(connection));
                  return reject(err);
                }

                process.nextTick(() => releaseConnection(connection));
                resolve(results);
              });

          })
          .catch((err) => {
            reject(err);
            process.nextTick(() => releaseConnection(connection));
          });
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
};

const dbh = {
  OBJECT: oracledb.OBJECT,
  createPool: createPool,
  terminatePool: terminatePool,
  getPool: getPool,
  addBuildupSql: addBuildupSql,
  addTeardownSql: addTeardownSql,
  getConnection: getConnection,
  execute: execute,
  releaseConnection: releaseConnection,
  exSql: exSql,
  exSp: exSp
};

module.exports = dbh;
