var gulp   = require('gulp');
var fs   = require('fs');

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
  var replacer = 'module.exports = def;',
    wrap = 'if (typeof window !== \'undefined\') { window.def = def; }';
  var make = function(file) {
    require('webmake')(
      file,
      {transform: function(filePath, content) {
        return content.replace(replacer, replacer + '\n' + wrap);
      }},
      function(err, result) {
        if (err) { throw err; }
        fs.writeFileSync(file.replace(/^.+?\/(\w+).js$/, 'dist/$1.js'), result);
      }
    );
  };
  make('src/full.js');
  make('src/simple.js');
});

gulp.task('default', ['watch']);
