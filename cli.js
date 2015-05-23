#!/usr/bin/env node
'use strict';
var path = require('path');
var program = require('commander');
var subfil = require('./');
var pkg = require('./package');
var videoExtensions = require('video-extensions');
var allLanguages = require('./languages')

var NOOP = function () {};

var handleFile = function (file, callback) {
	callback = arguments[arguments.length - 1];
	if (typeof callback !== 'function') {
		callback = NOOP;
	}

	console.log('Downloading subtitles for ' + path.basename(file));
	subfil.download(file, language, destination, function (err, dest) {
		if (err) {
			switch (err.message) {
				case 'Invalid video file':
					console.log('Please specify a valid video file');
					break;

				case 'No subtitles for hash in specified language':
					console.log('No subtitles available')
					break;

				default:
					callback(err);
					return;
			}
		} else {
			console.log('Subtitles downloaded successfully');
		}
	});
}

program
	.version(pkg.version)
	.usage('subfil <path>')
	.option('-r, --recursive', 'download subtitles for files recursively')
	.option('-l, --language <language>', 'download subtitles in given language')
	.option('-d, --destination <path>', 'download destination for subtitles')
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

var i, files = [];

if (program.recursive) {
	var extensionFilter = '{' + videoExtensions.join(',') + '}';
} else {
	files = program.args;
}

var language = program.language;
var destination = program.destination;

var file = files[0];

handleFile(file, language, destination, function (err) {
	if (err) {
		throw err;
	}
});
