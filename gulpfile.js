var gulp = require('gulp');
var mocha = require('gulp-mocha');
var plumber = require('gulp-plumber');
var istanbul = require('gulp-istanbul');

gulp.task('pre-test', function () {
  return gulp.src(['index.js', 'lib/**/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

// test
gulp.task('test', function() {
	return gulp.src('test/**/*.js', {read: false})
	.pipe(plumber())
	.pipe(mocha())
  // Creating the reports after tests ran
  .pipe(istanbul.writeReports())
  // Enforce a coverage of at least 90%
  .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
})

// watch files
gulp.task('watch', function(){
	gulp.watch(['index.js', 'lib/**/*.js', 'test/**/*.js'], ['test']);
});

gulp.task('default', ['watch', 'test']);
