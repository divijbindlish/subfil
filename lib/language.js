'use strict';
var request = require('request');
var USER_AGENT_STRING = 'SubDB/1.0 (subfil/1.1; '
  + 'https://github.com/divijbindlish/subfil)';

var getLanguagesForHash = function (hash, callback) {
  callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    callback = noop;
  }

  if (!hash.match(/^[a-f0-9]{32}$/)) {
    var err = new Error('Invalid MD5 hash');
    callback(err);
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

    var languages = response.body.split(',');
    callback(null, languages);
  });
};

module.exports = getLanguagesForHash;
