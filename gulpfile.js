'use strict';
// Welcome to the Gulp file.
// Gulp is a task runner which is used from the command line, so running a command like "gulp sass:watch" would start the task "sass:watch"

// First, call the plugins we need
var fs = require('fs');
var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var clean = require('gulp-clean');

// This sets up options for "autoprefixer", which increases compatibility with some older browsers on more experimental features.
var autoprefixer_options = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR'],
  cascade: false,
}

// Shortcut to the files.
// This first one essentially selects all files with the .scss extension
var sassFiles = './public/sass/**/*.scss';
// And this is just a shortcut to save typing.
var cssdirectory = './public/css';

// This removes the sourcemap folder.
gulp.task('sourcemaps:clean', function() {
  return gulp
    .src(cssdirectory + '/maps', {allowEmpty: true})
    .pipe(clean())
});

// This completely removes all the compiled CSS and prepares it to be overwritten. This reduces the chances of a conflict when compiling for production.
gulp.task('css:clean', function () {
  return gulp
    .src(cssdirectory + '/**/*.css', {allowEmpty: true})
    .pipe(clean());
})

// This is the actual task. Running "gulp sass" in the command line runs this file.
// .series runs other tasks in order. In this case, we're cleaning out sourcemaps and then cleaning the sass files.
gulp.task('sass', function () {
  // If we're not in production, run much the same task as production, except...
  return gulp.src(sassFiles)
    // We compile sourcemaps. These are files which can reference all the individual Sass files I use, and give me precise reference to where all the code is.
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    // these get written to the CSS directory in a folder called maps
    .pipe(sourcemaps.write('/maps'))
    .pipe(gulp.dest(cssdirectory))
});

function build() {
  return gulp.src(sassFiles)
  // .pipe where we can "pipe" in commands and execute them.
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    // This finds sass files, and compiles them to normal CSS.
    // This runs autoprefixer. See the notes on line 13 for what that means.
    .pipe(autoprefixer(autoprefixer_options))
    // And this finishes the task and tells gulp where to put the completed files.
    .pipe(gulp.dest(cssdirectory));
}

gulp.task('sass:production', gulp.series('css:clean', 'sourcemaps:clean', build));
    
function sassWatch() {
  gulp.watch(sassFiles, gulp.series('sass'));
}

// This runs an automated version of the sass task.
gulp.task('sass:watch', gulp.series('sass', sassWatch));

gulp.task('sass:newversion', function () {
  gulp.series('css:clean','sourcemaps:clean','sass')
})

function writeDB(cb) {
  fs.writeFile('./sqlite/mixer.db', '', cb);
}

gulp.task('install', gulp.series('css:clean', 'sass:production', writeDB));
