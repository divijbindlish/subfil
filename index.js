'use strict';
var fs = require('fs');
var http = require('http');
var path = require('path');
var os = require('os');

var md5 = require('MD5');
var isVideo = require('is-video');

var noop = function () {};

var generateHash = function (filename, callback) {
	callback = arguments[arguments.length - 1];
	if (typeof callback !== 'function') {
		callback = noop;
	}

	if (!isVideo(filename)) {
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

module.exports = {
	generateHash: generateHash
};
