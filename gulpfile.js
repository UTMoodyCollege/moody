"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var gulpStylelint = require("gulp-stylelint");
var csscombx = require("gulp-csscombx");

gulp.task("scss-lint", function lintCssTask() {
  return gulp
    .src("src/scss/**/*.scss")
    .pipe(gulpStylelint({
      reporters: [
        {formatter: "string", console: true}
      ],
      failAfterError: false
    }));
});

gulp.task("sass", function () {
  return gulp.src("src/scss/build/**/*.scss")
    .pipe(sass({outputStyle: "expanded"}).on("error", sass.logError))
    .pipe(autoprefixer({
      browsers: ["last 2 versions"],
      cascade: false
    }))
    .pipe(csscombx())
    .pipe(gulp.dest("css"));
});

gulp.task("css-lint", function lintCssTask() {
  return gulp
    .src("src/css/**/*.css")
    .pipe(gulpStylelint({
      reporters: [
        {formatter: "string", console: true}
      ],
      failAfterError: false
    }));
});

gulp.task('copy-js', function () {
  return gulp
    .src([
      './node_modules/bootstrap/js/dist/collapse.js',
      './node_modules/bootstrap/js/dist/modal.js',
      './node_modules/plyr/dist/plyr.min.js',
      './node_modules/@accessible360/accessible-slick/slick/slick.min.js',
    ])
    // .pipe(uglify())
    .pipe(gulp.dest('js'));
});

gulp.task('copy-css', function() {
  return gulp
    .src([
      './node_modules/plyr/dist/plyr.css',
      './node_modules/@accessible360/accessible-slick/slick/slick.min.css'
    ])
    .pipe(gulp.dest('css'));
});

gulp.task("default", gulp.series("scss-lint", "sass", "css-lint", 'copy-js', 'copy-css'));

