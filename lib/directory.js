'use strict';
var fs = require('fs');
var glob = require('glob');
var async = require('async');
var videoExtensions = require('video-extensions');

var getFilesFromDirectory = function (directory, callback) {
  callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    throw new Error('Invalid callback');
  }

  fs.lstat(directory, function (err, stats) {
    if (err) {
      callback(err);
      return;
    }

    if (stats.isDirectory()) {
      var extensionFilter = '{' + videoExtensions.join(',') + '}';
      glob(directory + '/**/*.' + extensionFilter, function (err, files) {
        if (err) {
          callback(err);
          return;
        }

        callback(null, files);
      });
    } else {
      callback(null, [directory]);
    }
  });
};

var getFilesFromMultipleDirectories = function (directories, callback) {
  callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    throw new Error('Invalid callback');
  }

  if (typeof directories === 'string') {
    getFilesFromDirectory(directories, callback);
    return;
  }

  var tasks = [];
  directories.forEach(function (directory) {
    tasks.push(function (callback) {
      getFilesFromDirectory(directory, callback);
    });
  });

  async.series(tasks, function (err, files) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, files);
  });
};

module.exports = getFilesFromMultipleDirectories;
