'use strict';
var fs = require('fs');
var md5 = require('MD5');
var path = require('path');
var videoExtensions = require('video-extensions');

var hash = function (filename, callback) {
  callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    throw new Error('Invalid callback');
  }

  var ext = path.extname(filename).slice(1);
  if (videoExtensions.indexOf(ext) === -1) {
    var err = new Error('Invalid video file');
    callback(err);
    return;
  }

  fs.open(filename, 'r', function (err, fd) {
    if (err) {
      callback(err);
      return;
    }

    fs.fstat(fd, function (err, stats) {
      if (err) {
        callback(err);
        return;
      }

      var readsize = 1 << 16;
      var buffer = new Buffer(readsize << 1);

      fs.read(fd, buffer, 0, readsize, 0, function (err) {
        if (err) {
          callback(err);
          return;
        }

        var position = stats['size'] - readsize;
        fs.read(fd, buffer, readsize, readsize, position, function(err) {
          if (err) {
            callback(err);
            return;
          }

          var hash = md5(buffer);
          callback(null, hash);
        });
      });
    });
  });
};

module.exports = hash;
