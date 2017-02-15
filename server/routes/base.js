'use strict';
const dbh = require('../helpers/dbhelper');
const oracledb = require('oracledb');
const routes = [
  {
    method: 'GET',
    path: '/about',
    config: {
      handler: (request, reply) => {
        reply.view('about', {
          title: 'About Page'
        });
      },
      id: 'about'
    }
  },
  {
    method: 'GET',
    path: '/',
    config: {
      handler: (request, reply) => {
        reply.view('index', {
          title: 'title',
          sideMenu: false
        });
      },
      id: 'index'
    }
  },
  {
    method: 'GET',
    path: '/{path*}',
    config: {
      handler: (request, reply) => {
        reply.view('404', {
          title: 'Not found 404'
        }).code(404);
      },
      id: '404'
    }
  }
];

exports.routes = server => server.route(routes);
