'use strict';
var fs = require('fs');
var request = require('request');

var USER_AGENT_STRING = 'SubDB/1.0 (subfil/1.1; '
  + 'https://github.com/divijbindlish/subfil)';

var download = function (hash, language, destination, callback) {
  callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    throw new Error('Invalid callback');
  }

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
      callback(err);
      return;
    }

    if (response.statusCode === 404) {
      err = new Error('No subtitles for hash');
      callback(err);
      return;
    }

    if (response.statusCode !== 200) {
      err = new Error('Invalid request');
      callback(err);
      return;
    }

    fs.open(destination, 'w', function (err, fd) {
      if (err) {
        callback(err);
        return;
      }

      fs.write(fd, body, function (err, bytesWritten, string) {
        if (err) {
          callback(err);
          return;
        }

        fs.close(fd, function (err) {
          if (err) {
            callback(err);
            return;
          }

          callback(null, destination);
        });
      });
    });
  });
};

module.exports = download;
