var gulp = require('gulp'),
  util = require('gulp-util'),
  concat = require('gulp-concat'),
  minifycss = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  imagemin = require('gulp-imagemin'),
  _ = require('lodash');

var assets = require('./assets');

var gulpFileCwd = __dirname +'/public';
process.chdir(gulpFileCwd);
util.log('Working directory changed to', util.colors.magenta(gulpFileCwd));

gulp.task('default', function(){
  _.each(assets.development.css, function(files, name) {
    gulp.src(files)
      .pipe(concat(name + '.css'))
      .pipe(minifycss())
      .pipe(gulp.dest('./css/dist/'));
  });
  _.each(assets.development.js, function(files, name) {
    gulp.src(files)
      .pipe(concat(name + '.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./js/dist/'));
  });
  gulp.src('./images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('./images/'));
});
