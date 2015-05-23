#!/usr/bin/env node
'use strict';
var path = require('path');
var program = require('commander');
var subfil = require('./');
var pkg = require('./package');
var videoExtensions = require('video-extensions');

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

var i, files = [];

if (program.recursive) {
	var extensionFilter = '{' + videoExtensions.join(',') + '}';
} else {
	files = program.args;
}

var language = program.language;
var destination = program.destination;

var file = files[0];

console.log('Downloading subtitles for ' + file);
subfil.download(file, language, destination, function (err, dest) {
	if (err) {
		throw err;
	} else {
		console.log('Subtitles successfully downloaded in ' + dest);
	}
});
