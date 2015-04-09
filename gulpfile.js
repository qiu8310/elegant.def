var gulp = require('gulp'),
  fs = require('fs');

var uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  babel = require('gulp-babel'),
  header = require('gulp-header'),
  footer = require('gulp-footer');

var sources = ['src/help.js', 'src/core.js'],
  target = 'def.js';


var data = require('./package.json');
data.date = (new Date()).toString();


gulp.task('default', function() {
  gulp.src(sources)
    .pipe(concat(target))
    .pipe(babel())
    .pipe(header(fs.readFileSync(__dirname + '/src/intro.tpl').toString(), data))
    .pipe(footer(fs.readFileSync(__dirname + '/src/outro.tpl').toString(), data))
    //.pipe(uglify({preserveComments: 'some'}))
    .pipe(gulp.dest('dist'))
});


// gulp.watch(sources, ['default']);