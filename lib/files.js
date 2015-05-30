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

    downloadForHash(hash, language, destination, callback);
  } else {
    var filename = name;
    generateHash(filename, function (err, hash) {
      if (err) {
        callback(err);
        return;
      }

      if (typeof destination !== 'string') {
        destination = path.dirname(filename) + separator
          + path.basename(filename, path.extname(filename))
          + '-' + language + '.srt';
      }

      downloadForHash(hash, language, destination, callback);
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

  async.series(tasks, function (err, results) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, results);
  });
};

module.exports = handleMultipleFiles;
