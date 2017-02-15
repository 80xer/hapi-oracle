'use strict';
const dbh = require('../helpers/dbhelper');
const oracledb = require('oracledb');
const Boom = require('boom');
const routes = [
  {
    method: 'GET',
    path: '/api/sp/db1',
    config: {
      handler: (request, reply) => {
        const sp = 'BEGIN ' +
                '<DB1 Stored procedure(' +
                ':IN_PARAM_1, ' +
                ':OUT_ERR_NUM, ' +
                ':OUT_ERR_MSG, ' +
                ':OUT_CURSOR_1,' +
                ':OUT_CURSOR_2' +
                '); END;';
        const bindParams = {
          IN_PARAM_1:  { val: 'hello', type: oracledb.STRING, maxSize: 5 },
          OUT_ERR_NUM: {dir: oracledb.BIND_OUT},
          OUT_ERR_MSG: {dir: oracledb.BIND_OUT},
          OUT_CURSOR_1: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR},
          OUT_CURSOR_2: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
        };

        dbh.exSp(sp, bindParams)
        .then(results => reply(results.outBinds.fetchData).code(200))
        .catch(err => {
          return reply(Boom.badImplementation(err));
        });
      },
      id: '/api/sp/db1'
    }
  },
  {
    method: 'GET',
    path: '/api/sql/db1',
    config: {
      handler: (request, reply) => {
        dbh.exSql('select '\hello\' from dual')
        .then(results => reply(results).code(200))
        .catch(err => {
          return reply(Boom.badImplementation(err));
        });
      },
      id: '/api/sql/db1'
    }
  },
  {
    method: 'GET',
    path: '/api/sp/db2',
    config: {
      handler: (request, reply) => {
        const sp = 'BEGIN ' +
                'DB2 Stored procedure(' +
                ':IN_PARAM_1, ' +
                ':IN_PARAM_2, ' +
                ':IN_PARAM_3, ' +
                ':OUT_ERR_NUM, ' +
                ':OUT_ERR_MSG, ' +
                ':OUT_CURSOR' +
                '); END;';
        const bindParams = {
          IN_PARAM_1:  { val: 'a', type: oracledb.STRING, maxSize: 1 },
          IN_PARAM_2:  { val: 'b', type: oracledb.STRING, maxSize: 1 },
          IN_PARAM_3:  { val: 'c', type: oracledb.STRING, maxSize: 1 },
          OUT_ERR_NUM: {dir: oracledb.BIND_OUT},
          OUT_ERR_MSG: {dir: oracledb.BIND_OUT},
          OUT_CURSOR: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
        };

        dbh.exSp(sp, bindParams, 'db2')
        .then(results => reply(results.outBinds.fetchData).code(200))
        .catch(err => {
          return reply(Boom.badImplementation(err));
        });
      },
      id: '/api/sp/db2'
    }
  },
  {
    method: 'GET',
    path: '/api/sql/db2',
    config: {
      handler: (request, reply) => {
        dbh.exSql('select '\hello\' from dual', 'db2')
        .then(results => reply(results).code(200))
        .catch(err => {
          return reply(Boom.badImplementation(err));
        });
      },
      id: '/api/sql/db2'
    }
  }
];

exports.routes = server => server.route(routes);
