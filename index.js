'use strict';
var fs = require('fs');
var http = require('http');
var path = require('path');
var os = require('os');

var videoExtensions = require('video-extensions');
var allLanguages = require('./languages');
var md5 = require('MD5');
var request = require('request');

var NOOP = function () {};

var USER_AGENT_STRING = 'SubDB/1.0 (subfil/0.1; '
  + 'https://github.com/divijbindlish/subfil)';

var generateHash = function (filename, callback) {
  callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    callback = NOOP;
  }

  var ext = path.extname(filename).slice(1);
  if (videoExtensions.indexOf(ext) === -1) {
    var err = new Error('Invalid video file');
    callback(err, undefined);
    return;
  }

  fs.open(filename, 'r', function (err, fd) {
    if (err) {
      callback(err, undefined);
      return;
    }

    fs.fstat(fd, function (err, stats) {
      if (err) {
        callback(err, undefined);
        return;
      }

      var readsize = 1 << 16;
      var buffer = new Buffer(readsize << 1);

      fs.read(fd, buffer, 0, readsize, 0, function (err) {
        if (err) {
          callback(err, undefined);
          return;
        }

        var position = stats['size'] - readsize;
        fs.read(fd, buffer, readsize, readsize, position, function(err) {
          if (err) {
            callback(err, undefined);
            return;
          }

          var hash = md5(buffer);
          callback(undefined, hash);
        });
      });
    });
  });
};

var getLanguagesForHash = function (hash, callback) {
  callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    callback = NOOP;
  }

  if (!hash.match(/^[a-f0-9]{32}$/)) {
    var err = new Error('Invalid MD5 hash');
    callback(err, undefined);
    return;
  }

  request({
    url: 'http://api.thesubdb.com',
    qs: {
      action: 'search',
      hash: hash,
    },
    method: 'GET',
    headers: {
      'User-Agent': USER_AGENT_STRING,
    }
  }, function (err, response, body) {
    if (err) {
      callback(err, undefined);
      return;
    }

    if (response.statusCode === 404) {
      err = new Error('No subtitles for hash');
      callback(err, undefined);
      return;
    }

    if (response.statusCode !== 200) {
      err = new Error('Invalid request');
      callback(err, undefined);
      return;
    }

    var languages = response.body.split(',');
    callback(undefined, languages);
  });
};

var downloadForHash = function (hash, language, destination, callback) {
  request({
    url: 'http://api.thesubdb.com',
    qs: {
      action: 'download',
      language: language,
      hash: hash,
    },
    method: 'GET',
    headers: {
      'User-Agent': USER_AGENT_STRING,
    }
  }, function(err, response, body) {
    if (err) {
      callback(err, undefined);
      return;
    }

    if (response.statusCode === 404) {
      err = new Error('No subtitles for hash');
      callback(err, undefined);
      return;
    }

    if (response.statusCode !== 200) {
      err = new Error('Invalid request');
      callback(err, undefined);
      return;
    }

    fs.open(destination, 'w', function (err, fd) {
      if (err) {
        callback(err, undefined);
        return;
      }

      fs.write(fd, body, function (err, bytesWritten, string) {
        if (err) {
          callback(err, undefined);
          return;
        }

        fs.close(fd, function (err) {
          if (err) {
            callback(err, undefined);
            return;
          }

          callback(undefined, destination);
        });
      });
    });
  });
};

var getLanguages = function (name, callback) {
  callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    callback = NOOP;
  }

  if (name.match(/^[a-f0-9]{32}$/)) {
    // Process for hash
    var hash = name;
    getLanguagesForHash(hash, callback);
  } else {
    // Process for file
    var filename = name;
    generateHash(filename, function (err, hash) {
      if (err) {
        callback(err, undefined);
        return;
      }

      getLanguagesForHash(hash, callback);
    });
  }
};

var download = function (name, language, destination, callback) {
  var separator = /^win/.test(process.platform) ? '\\' : '/';

  callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    callback = NOOP;
  }

  if (typeof language !== 'string') {
    language = 'en';
  } else {
    if (allLanguages.indexOf(language) === -1) {
      var err = new Error('Invalid language');
      callback(err, undefined);
      return;
    }
  }

  if (name.match(/^[a-f0-9]{32}$/)) {
    // Process for hash
    var hash = name;
    if (typeof destination !== 'string') {
      destination = os.tmpdir() + separator + hash + '.srt';
    }

    downloadForHash(hash, language, destination, callback);
  } else {
    // Process for file
    var filename = name;
    generateHash(filename, function (err, hash) {
      if (err) {
        callback(err, undefined);
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

module.exports = {
  getLanguages: getLanguages,
  download: download
};
