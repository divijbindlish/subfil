'use strict';
var fs = require('fs');
var http = require('http');
var path = require('path');
var os = require('os');

var isVideo = require('is-video');
var allLanguages = require('./languages');
var md5 = require('MD5');
var request = require('request');

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

var availableLanguages = function (hash, callback) {
	callback = arguments[arguments.length - 1];
	if (typeof callback !== 'function') {
		callback = noop;
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
			'User-Agent': 'SubDB/1.0 (Pyrrot/0.1; http://github.com/jrhames/pyrrot-cli)',
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

var download = function (hash, language, destination, callback) {
	callback = arguments[arguments.length - 1];
	if (typeof callback !== 'function') {
		callback = noop;
	}

	if (!hash.match(/^[a-f0-9]{32}$/)) {
		var err = new Error('Invalid MD5 hash');
		callback(err, undefined);
		return;
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

	if (typeof destination !== 'string') {
		destination = os.tmpdir() + '/' + hash + '.srt';
	}

	request({
		url: 'http://api.thesubdb.com',
		qs: {
			action: 'download',
			hash: hash,
		},
		method: 'GET',
		headers: {
			'User-Agent': 'SubDB/1.0 (Pyrrot/0.1; http://github.com/jrhames/pyrrot-cli)',
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

module.exports = {
	generateHash: generateHash,
	availableLanguages: availableLanguages,
	download: download
};
