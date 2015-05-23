#!/usr/bin/env node
'use strict';
var async = require('async');
var path = require('path');
var program = require('commander');
var subfil = require('./');
var pkg = require('./package');
var videoExtensions = require('video-extensions');
var allLanguages = require('./languages')

var NOOP = function () {};

var handleFile = function (file, language, destination, callback) {
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
					callback(undefined, false);
					break;

				case 'No subtitles for hash':
					console.log('No subtitles available for specified language')
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

var handleMultipleFiles = function(files, language, destination) {
	var tasks = [];
	files.forEach(function (file) {
		tasks.push(function (callback) {
			handleFile(file, language, destination, callback);
		});
	});

	async.series(tasks, function (err, results) {
		if (err) throw err;

		var total = 0;
		results.forEach(function (value) {
			total += value;
		});
		console.log('Downloaded a total of ' + total + ' subtitle(s)');
	});
};

program
	.version(pkg.version)
	.usage('subfil <path> [<path> ...]')
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

handleMultipleFiles(program.args, program.language, program.destination);
