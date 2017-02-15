const Hapi = require('hapi');
const vision = require('vision');
const handlebars = require('handlebars');
const extend = require('handlebars-extend-block');
const inert = require('inert');
const path = require('path');
const environment = process.env.NODE_ENV || 'development';
const config    = require(path.join(__dirname, './config.js'))[environment];
const dbConfig = config.db;
const oracledb = require('oracledb');
const dbh = require('./server/helpers/dbhelper');
const server = new Hapi.Server();

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception ', err);

  shutdown();
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM');

  shutdown();
});

process.on('SIGINT', () => {
  console.log('Received SIGINT');

  shutdown();
});

// Paste project version after static file name.
handlebars.registerHelper('versionHelper', (property) => {
  var packageVersionNumber = require(path.join(process.cwd(), './package.json')).version;
  var versionCache = packageVersionNumber.replace(/[^0-9]/g, '');
  return '?v=' + versionCache;
});

server.connection({
  port: parseInt(process.env.PORT, 10) || 3000,
  host: '0.0.0.0'
}, (conn) => {
  console.log('conn', conn);
});

server.register(inert, () => {});
server.register(vision, (err) => {
  server.views({
    engines: {
      html: extend(handlebars)
    },
    path: './server/views',
    layoutPath: './server/views/layouts',
    layout: 'default',
    partialsPath: './server/views/partials'
  });
});

// plugins
server.register([
  {
    register: require('good'),
    options: {
      ops: {
        interval: 5000
      },
      reporters: {
        consoleReporters: [{
          module: 'good-console',
          args:[{ ops: '*', request: '*', log: '*', response: '*', 'error': '*' }]
        }]
      }
    }
  },
  {
    register: require('hapi-assets'),
    options: require('./assets.js')
  },
  {
    register: require('hapi-named-routes')
  },
  {
    register: require('./server/helpers/routehelper'),
    options: {dir: './server/routes'}
  }
], () => {
  dbh.createPool(dbConfig)
    .then(()=>{
      server.start(() => {
        console.log('Server started at: ' + server.info.uri);
      });
    })
    .catch(err => {
      console.error('Error occurred creating database connection pool', err);
      console.log('Exiting process');
      process.exit(0);
    });
});

let shutdown = () => {
  console.log('Shutting down');
  console.log('Closing web server');

  server.stop(() => {
    console.log('Web server closed');

    dbh.terminatePool()
      .then(() => {
        console.log('node-oracledb connection pool terminated');
        console.log('Exiting process');
        process.exit(0);
      })
      .catch((err) => {
        console.error('Error occurred while terminating node-oracledb connection pool', err);
        console.log('Exiting process');
        process.exit(0);
      });
  });
};

module.exports = server;
