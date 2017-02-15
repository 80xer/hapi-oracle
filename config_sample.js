module.exports = {
  'test': {
    'db': {
      'db1': {
        'user': process.env.NODE_ORACLEDB_USER || '<username>',
        'password': process.env.NODE_ORACLEDB_PASSWORD || '<password>',
        'connectString': process.env.NODE_ORACLEDB_CONNECTSTRING || '<host>:<port>/<servicename>',
        'externalAuth': process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
      },
      'db2': {
        'user': process.env.NODE_ORACLEDB_USER || '<username>',
        'password': process.env.NODE_ORACLEDB_PASSWORD || '<password>',
        'connectString': process.env.NODE_ORACLEDB_CONNECTSTRING || '<host>:<port>/<servicename>',
        'externalAuth': process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
      }
    }
  },
  'development': {
    'db': {
      'db1': {
        'user': process.env.NODE_ORACLEDB_USER || '<username>',
        'password': process.env.NODE_ORACLEDB_PASSWORD || '<password>',
        'connectString': process.env.NODE_ORACLEDB_CONNECTSTRING || '<host>:<port>/<servicename>',
        'externalAuth': process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
      },
      'db2': {
        'user': process.env.NODE_ORACLEDB_USER || '<username>',
        'password': process.env.NODE_ORACLEDB_PASSWORD || '<password>',
        'connectString': process.env.NODE_ORACLEDB_CONNECTSTRING || '<host>:<port>/<servicename>',
        'externalAuth': process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
      }
    }
  },
  'production': {
    'db': {
      'db1': {
        'user': process.env.NODE_ORACLEDB_USER || '<username>',
        'password': process.env.NODE_ORACLEDB_PASSWORD || '<password>',
        'connectString': process.env.NODE_ORACLEDB_CONNECTSTRING || '<host>:<port>/<servicename>',
        'externalAuth': process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
      },
      'db2': {
        'user': process.env.NODE_ORACLEDB_USER || '<username>',
        'password': process.env.NODE_ORACLEDB_PASSWORD || '<password>',
        'connectString': process.env.NODE_ORACLEDB_CONNECTSTRING || '<host>:<port>/<servicename>',
        'externalAuth': process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
      }
    }
  }
};
