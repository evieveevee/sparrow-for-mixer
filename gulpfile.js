'use strict';
// Welcome to the Gulp file.
// Gulp is a task runner which is used from the command line, so running a command like "gulp sass:watch" would start the task "sass:watch"

// First, call the plugins we need
var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var clean = require('gulp-clean');
var argv = require('yargs').argv;

// This sets an option which, if a task is run with --prod, is turned to true
// This allows the use of a sub task which is more suited to final code (production) rather than development.

// An example usage would be "gulp sass --prod"
var production = (argv.prod === undefined) ? false : true;

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

// This runs an automated version of the sass task above.
gulp.task('sass:watch', function () {
  gulp
    .series('sass')
    .watch(sassFiles, ['sass']);
});

gulp.task('sass:newversion', function () {
  gulp.series('css:clean','sourcemaps:clean','sass')
})


// This completely removes all the compiled CSS and prepares it to be overwritten. This reduces the chances of a conflict when compiling for production.
gulp.task('css:clean', gulp.series('sourcemaps:clean'), function () {
  return gulp
    .src(cssdirectory + '/**/*.css', {allowEmpty: true})
    .pipe(clean());
})

// This is the actual task. Running "gulp sass" in the command line runs this file.
// .series runs other tasks in order. In this case, we're cleaning out sourcemaps and then cleaning the sass files.
gulp.task('sass', gulp.series('sourcemaps:clean', 'css:clean'), function () {
  // If we're in production, run this task.
  if (production) {
    return gulp
      // .src tells Gulp where in the project it should begin working on the task.
      .src(sassFiles)
      // .pipe where we can "pipe" in commands and execute them.
      .pipe(sass({outputStyle:'compressed'}).on('error', sass.logError))
      // This finds sass files, and compiles them to normal CSS.
      // This runs autoprefixer. See the notes on line 19 for what that means.
      .pipe(autoprefixer(autoprefixer_options))
      // And this finishes the task and tells gulp where to put the completed files.
      .pipe(gulp.dest(cssdirectory));
  }
  // If we're not in production, run much the same task as production, except...
  else {
    return gulp
      .src(sassFiles)
      // We compile sourcemaps. These are files which can reference all the individual Sass files I use, and give me precise reference to where all the code is.
      .pipe(sourcemaps.init())
      .pipe(sass({outputStyle:'expanded'}).on('error', sass.logError))
      // these get written to the CSS directory in a folder called maps
      .pipe(sourcemaps.write('/maps'))
      .pipe(gulp.dest(cssdirectory))
  }
});