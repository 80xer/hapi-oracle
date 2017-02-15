module.exports = {
  development: {
    js: {
      lib: [
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/fnlibjs/dist/fnlib.min.js'
      ],
      index: [
        'js/index1.js',
        'js/index2.js'
      ]
    },
    css: {
      style: ['css/test-one.css', 'css/test-two.css']
    }
  },
  production: {
    js: {
      lib: ['js/dist/lib.js'],
      index: ['js/dist/index.js']
    },
    css: {
      style: ['css/dist/style.css']
    }
  }
};
