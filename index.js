'use strict';
var allLanguages = require('./lib/data/languages');
var getLanguages = require('./lib/language');
var expandDirectory = require('./lib/directory');
var downloadForFiles = require('./lib/files');

var download = function (name, options, callback) {
  callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    callback = function () {};
  }

  if (typeof options !== 'object') {
    options = {};
  }

  var language, destination;
  if (typeof options.language === 'string') {
    language = options.language;
    if (allLanguages.indexOf(language) === -1) {
      var err = new Error('Invalid language');
      callback(err);
      return;
    }
  } else {
    language = 'en';
  }

  destination = options.destination;

  if (options.recursive) {
    expandDirectory(name, function (err, files) {
      if (err) {
        callback(err);
        return;
      }

      downloadForFiles(files, language, callback);
    });
    return;
  }

  if (typeof name !== 'object') {
    downloadForFiles([name], language, [destination], callback);
    return;
  }

  downloadForFiles(name, language, callback);
};

module.exports = {
  getLanguages: getLanguages,
  download: download
};
