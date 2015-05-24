'use strict';
var assert = require('assert');
var subfil = require('./');

it('should throw an error for invalid video file', function (callback) {
  assert.throws(function() {
    subfil.download('./index.js', function (err, destination) {
      if (err) {
        throw err;
      }
    });
  }, Error);

  callback();
});
