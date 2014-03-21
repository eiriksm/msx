var gulp = require('gulp')

var msx = require('./main')
var through = require('through2')

var plumber = require('gulp-plumber')
var rename = require('gulp-rename')
var gutil = require('gulp-util')

var testJSX = './test/jsx/*.jsx'

function msxTransform(name) {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      this.push(file)
      return cb()
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('msx', 'Streaming not supported'))
      return cb()
    }

    try {
      file.contents = new Buffer(msx.transform(file.contents.toString()))
      file.path = gutil.replaceExtension(file.path, '.js')
    }
    catch (err) {
      err.fileName = file.path
      this.emit('error', new gutil.PluginError('msx', err))
    }

    this.push(file)
    cb()
  })
}

gulp.task('msx', function() {
  return gulp.src(testJSX)
    .pipe(plumber())
    .pipe(msxTransform())
    .on('error', function(e) {
      console.error(e.message + '\n  in ' + e.fileName)
    })
    .pipe(rename({ext: '.js'}))
    .pipe(gulp.dest('./test/js/'))
})

gulp.task('watch', function() {
  gulp.watch([testJSX], ['msx'])
})

gulp.task('default', ['watch', 'msx'])