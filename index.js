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

var generateHashSync = function (filename) {
	if (!isVideo(filename)) {
		throw new Error('Invalid video file');
	}

	var fd = fs.openSync(filename, 'r');
	var stats = fs.fstatSync(fd);
	var readsize = 1 << 16;
	var buffer = new Buffer(readsize << 1);

	var position = stats['size'] - readsize;

	fs.readSync(fd, buffer, 0, readsize, 0);
	fs.readSync(fd, buffer, readsize, readsize, position);

	return md5(buffer);
};

module.exports = {
	generateHash: generateHash,
	generateHashSync: generateHashSync
};
