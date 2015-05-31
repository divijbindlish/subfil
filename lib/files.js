'use strict';
var path = require('path');
var os = require('os');
var async = require('async');
var generateHash = require('./hash');
var downloadForHash = require('./download');

var handleSingleFile = function (name, language, destination, callback) {
  callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    throw new Error('Invalid callback');
  }

  var separator = /^win/.test(process.platform) ? '\\' : '/';

  if (name.match(/^[a-f0-9]{32}$/)) {
    var hash = name;
    if (typeof destination !== 'string') {
      destination = os.tmpdir() + separator + hash + '.srt';
    }

    downloadForHash(hash, language, destination, function (err, destination) {
      if (err) {
        callback(err);
        return;
      }

      callback(null, 'OK', destination);
    });
  } else {
    var filename = name;
    generateHash(filename, function (err, hash) {
      if (err) {
        if (err.message === 'Invalid video file') {
          callback(null, 'INVALID_VIDEO_FILE', undefined);
          return;
        }

        callback(err);
        return;
      }

      if (typeof destination !== 'string') {
        destination = path.dirname(filename) + separator
          + path.basename(filename, path.extname(filename))
          + '-' + language + '.srt';
      }

      downloadForHash(hash, language, destination, function (err, dest) {
        if (err) {
          if (err.message === 'No subtitles for hash') {
            callback(null, 'SUBTITLES_NOT_FOUND', undefined);
            return;
          }

          callback(err);
          return;
        }

        callback(null, 'OK', dest);
      });
    });
  }
};

var handleMultipleFiles = function (files, language, destinations, callback) {
  callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    throw new Error('Invalid callback');
  }

  var i, tasks = [];

  if (files.length === 1) {
    handleSingleFile(files[0], language, destinations[0], callback);
    return;
  }

  files.forEach(function (file) {
    tasks.push(function (callback) {
      handleSingleFile(file, language, callback);
    });
  });

  async.series(tasks, function (err, status) {
    if (err) {
      callback(err);
      return;
    }

    var temp = [], destinations = [];
    status.forEach(function (arr) {
      temp.push(arr[0]);
      destinations.push(arr[1]);
    });

    callback(null, temp, destinations);
  });
};

module.exports = handleMultipleFiles;
