#!/usr/bin/env node
'use strict';
var async = require('async');
var path = require('path');
var program = require('commander');
var subfil = require('./');
var fs = require('fs');
var glob = require('glob');
var pkg = require('./package');
var videoExtensions = require('video-extensions');
var allLanguages = require('./languages');
var updateNotifier = require('update-notifier');

updateNotifier({pkg: pkg}).notify();

var NOOP = function () {};

var handleFile = function (file, language, callback) {
  callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    callback = NOOP;
  }

  console.log('Downloading subtitles for ' + path.basename(file));
  subfil.download(file, language, function (err, dest) {
    if (err) {
      switch (err.message) {
        case 'Invalid video file':
          console.log('Please specify a valid video file');
          callback(undefined, false);
          break;

        case 'No subtitles for hash':
          console.log('No subtitles available in specified language')
          callback(undefined, false);
          break;

        default:
          callback(err, undefined);
      }
    } else {
      console.log('Subtitles downloaded successfully');
      callback(undefined, true);
    }
  });
};

var handleMultipleFiles = function (files, language, callback) {
  var tasks = [];
  files.forEach(function (file) {
    tasks.push(function (callback) {
      handleFile(file, language, callback);
    });
  });

  async.series(tasks, function (err, results) {
    if (err) {
      callback(err, undefined);
      return;
    }

    callback(undefined, results);
  });
};

var handleDirectory = function (directory, callback) {
  fs.lstat(directory, function (err, stats) {
    if (err) {
      callback(err, undefined);
      return;
    }

    if (stats.isDirectory()) {
      var extensionFilter = '{' + videoExtensions.join(',') + '}';
      glob(directory + '/**/*.' + extensionFilter, function (err, files) {
        if (err) {
          callback(err, undefined);
          return;
        }

        callback(undefined, files);
      });
    } else {
      callback(undefined, directory);
    }
  });
};

var handleMultipleDirectories = function (directories, callback) {
  var tasks = [];
  directories.forEach(function (directory) {
    tasks.push(function (callback) {
      handleDirectory(directory, callback);
    });
  });

  async.series(tasks, function (err, files) {
    if (err) {
      callback(err, undefined);
      return;
    }

    callback(undefined, files);
  });
};

program
  .version(pkg.version)
  .usage('subfil <path> [<path> ...]')
  .option('-r, --recursive', 'download subtitles for files recursively')
  .option('-l, --language <language>', 'download subtitles in given language')
  .parse(process.argv);

if (program.args.length === 0) {
  console.error('You need to specify at least one path');
  process.exit(1);
}

if (typeof program.language === 'string') {
  if (allLanguages.indexOf(program.language.toLowerCase()) === -1) {
    console.log('Invalid language provided');
    console.log('Please choose a language from the following:');
    console.log(allLanguages.join(', ').join('\n'));
    process.exit(1);
  }
}

var language = program.language;
var files = [];

var finalCallback = function (err, results) {
  if (err) {
    throw err;
  }

  var total = 0;
  results.forEach(function (value) {
    total += value;
  });
  console.log('Downloaded a total of ' + total + ' subtitle(s)');
};

if (program.recursive) {
  handleMultipleDirectories(program.args, function (err, results) {
    if (err) {
      finalCallback(err, undefined);
      return;
    }

    var files = [].concat.apply([], results);
    handleMultipleFiles(files, language, finalCallback);
  });
} else {
  files = program.args;
  handleMultipleFiles(files, language, finalCallback);
}
