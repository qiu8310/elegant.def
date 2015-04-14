var gulp   = require('gulp');

var plugins = require('gulp-load-plugins')();

var testPath = ['test/**/test*.js'],
  srcPath = ['src/**/*.js'],
  otherPath = ['gulpfile.js'];
var paths = {
  lint: otherPath.concat(testPath, srcPath),
  watch: otherPath.concat(testPath, srcPath),
  tests: testPath,
  source: srcPath
};

var plumberConf = {};

if (process.env.CI) {
  plumberConf.errorHandler = function(err) {
    throw err;
  };
}

gulp.task('lint', function () {
  return gulp.src(paths.lint)
    .pipe(plugins.jshint('.jshintrc'))
    .pipe(plugins.plumber(plumberConf))
    .pipe(plugins.jscs())
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

gulp.task('istanbul', function (done) {
  gulp.src(paths.source)
    .pipe(plugins.istanbul()) // Covering files
    .pipe(plugins.istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      gulp.src(paths.tests)
        .pipe(plugins.plumber(plumberConf))
        .pipe(plugins.mocha())
        .pipe(plugins.istanbul.writeReports()) // Creating the reports after tests runned
        .on('finish', function() {
          process.chdir(__dirname);
          done();
        });
    });
});


gulp.task('watch', ['test'], function () {
  gulp.watch(paths.watch, function() {
    require('child_process').spawn('gulp', ['test'], {
      env: process.env,
      cwd: process.cwd(),
      stdio: [
        process.stdin,
        process.stdout,
        process.stderr
      ]
    });
  });
});

gulp.task('test', ['lint', 'istanbul']);

gulp.task('release', [/* 'test' */], function() {
  return gulp.src('src/full.js')
    .pipe(plugins.rename(function(path) {
      console.log([].slice.call(arguments));
      path.basename = 'def.' + path.basename
    }))
    .pipe(plugins.webpack({ /* webpack configuration */ }))
    .pipe(gulp.dest('./'));
});

gulp.task('default', ['watch']);
