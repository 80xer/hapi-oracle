'use strict';

const routes = [
  {
    method: 'GET',
    path: '/partials/{path*}',
    config: {
      handler: {
        directory: { path: './server/views/partials' }
      },
      id: 'partials'
    }
  },
  {
    method: 'GET',
    path: '/images/{path*}',
    config: {
      handler: {
        directory: { path: './public/images' }
      },
      id: 'images'
    }
  },
  {
    method: 'GET',
    path: '/css/{path*}',
    config: {
      handler: {
        directory: { path: './public/css' }
      },
      id: 'css'
    }
  },
  {
    method: 'GET',
    path: '/js/{path*}',
    config: {
      handler: {
        directory: { path: './public/js' }
      },
      id: 'js'
    }
  },
  {
    method: 'GET',
    path: '/bower_components/{path*}',
    config: {
      handler: {
        directory: { path: './public/bower_components' }
      },
      id: 'bower'
    }
  }
];

exports.routes = (server) => server.route(routes);
