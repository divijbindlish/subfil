#!/usr/bin/env node
'use strict';
var program = require('commander');
var subfil = require('./');
var pkg = require('./package');
var allLanguages = require('./lib/data/languages');
var updateNotifier = require('update-notifier');
var chalk = require('chalk');
var path = require('path');

updateNotifier({pkg: pkg}).notify();

program
  .version(pkg.version)
  .usage('subfil <path> [<path> ...]')
  .option('-r, --recursive', 'download subtitles for files recursively')
  .option('-l, --language <language>', 'download subtitles in given language')
  .option('-d, --destination <destination>', 'download to custom destination')
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

console.log(chalk.blue('Downloading subtitle(s)'));

if (program.args.length === 1) {
  program.args = program.args[0];
}

subfil.download(program.args, program, function (err, status, dests, files) {
  if (err) {
    throw err;
  }

  if (typeof status === 'string') {
    if (status === 'OK') {
      console.log(chalk.green('Downloaded a total of 1 subtitle(s)'));
    } else {
      console.log(path.basename(program.args[0]) + ' : ' + chalk.red(status));
    }
    return;
  }

  var i, count = 0;
  status.forEach(function (stat) {
    if (stat === 'OK') {
      count += 1;
    }
  });

  var green = chalk.green;
  var red = chalk.red;

  if (count != 0) {
    console.log(green('Downloaded a total of ' + count + ' subtitle(s)'));
  }

  console.log('Couldn\'t download subtitles for the following files:');
  for (i in status) {
    if (status[i] !== 'OK') {
      console.log(path.basename(files[i]) + ' : ' + red(status[i]));
    }
  }
});
