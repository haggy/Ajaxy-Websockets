var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('browserify', function() {
    gulp.src('client/ajaxy-socket-client.js')
     .pipe(browserify())
     .pipe(concat('ajaxy-client.js'))
     .pipe(gulp.dest('.'));
});

gulp.task('compress', function(){
 gulp.src('client/ajaxy-socket-client.js')
    .pipe(browserify())
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('default',['browserify', 'compress']);

gulp.task('watch', function() {
    gulp.watch('lib/**/*.*', ['default']);
})
