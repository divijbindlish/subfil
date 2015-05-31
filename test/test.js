'use strict';
var fs = require('fs');
var assert = require('assert');
var glob = require('glob');
var subfil = require('../');

afterEach(function (done) {
  glob('test/files/**/*.srt', function (err, files) {
    if (err) {
      throw err;
    }

    files.forEach(function (file) {
      fs.unlinkSync(file);
    });

    done();
  });
});

it('should give different status for invalid video file', function (done) {
  subfil.download('./index.js', function (err, status, destination) {
    if (err) {
      throw err;
    }

    assert.equal(status, 'INVALID_VIDEO_FILE');
    done();
  });
});

it('should list available languages', function (done) {
  this.timeout(20000);

  var file = 'test/files/file.mkv';

  subfil.getLanguages(file, function (err, languages) {
    assert.deepEqual(languages, ['en', 'pt']);

    done();
  });
});

it('should download subtitles for a single file', function (done) {
  this.timeout(20000);

  var file = 'test/files/dir1/file1.mkv';
  var subtitles = 'test/files/dir1/file1-en.srt';

  assert(!fs.existsSync(subtitles));

  subfil.download(file, function (err, status, destination) {
    if (err) {
      throw err;
    }

    assert(fs.existsSync(destination));
    assert.equal(destination, subtitles);

    done();
  });
});

it('should download subtitles for multiple files', function (done) {
  this.timeout(20000);

  var files = [
    'test/files/dir1/file1.mkv',
    'test/files/dir1/file2.mkv'
  ];

  var subtitles = [
    'test/files/dir1/file1-en.srt',
    'test/files/dir1/file2-en.srt'
  ];

  subtitles.forEach(function (file) {
    assert(!fs.existsSync(file));
  });

  subfil.download(files, function (err, status, destinations) {
    if (err) {
      throw err;
    }

    assert.equal(destinations.length, subtitles.length);
    for (var i in subtitles) {
      assert(fs.existsSync(destinations[i]));
      assert.equal(destinations[i], subtitles[i]);
    }

    done();
  });
});

it('should download subtitles for a single directory', function (done) {
  this.timeout(20000);

  var dir = 'test/files/dir1';

  var subtitles = [
    'test/files/dir1/file1-en.srt',
    'test/files/dir1/file2-en.srt'
  ];

  subtitles.forEach(function (file) {
    assert(!fs.existsSync(file));
  });

  subfil.download(dir, {recursive: true}, function (err, status, dests) {
    if (err) {
      throw err;
    }

    assert.equal(dests.length, subtitles.length);
    for (var i in subtitles) {
      assert(fs.existsSync(dests[i]));
      assert.equal(dests[i], subtitles[i]);
    }

    done();
  });
});

it('should download subtitles for multiple directories', function (done) {
  this.timeout(20000);

  var dirs = [
    'test/files/file.mkv',
    'test/files/dir1',
    'test/files/dir2'
  ];

  var subtitles = [
    'test/files/file-en.srt',
    'test/files/dir1/file1-en.srt',
    'test/files/dir1/file2-en.srt',
    'test/files/dir2/file1-en.srt',
    'test/files/dir2/file2-en.srt'
  ];

  subtitles.forEach(function (file) {
    assert(!fs.existsSync(file));
  });

  subfil.download(dirs, {recursive: true}, function (err, status, dests) {
    if (err) {
      throw err;
    }

    assert.equal(dests.length, subtitles.length);
    for (var i in subtitles) {
      assert(fs.existsSync(dests[i]));
      assert.equal(dests[i], subtitles[i]);
    }

    done();
  });
});

it('should download subtitles for other languages', function (done) {
  this.timeout(20000);

  var file = 'test/files/dir1/file1.mkv';
  var subtitles = 'test/files/dir1/file1-pt.srt';

  assert(!fs.existsSync(subtitles));

  subfil.download(file, {language: 'pt'}, function (err, status, destination) {
    if (err) {
      throw err;
    }

    assert(fs.existsSync(destination));
    assert.equal(destination, subtitles);

    done();
  });
});

it('should download subtitles in custom destinations', function (done) {
  this.timeout(20000);

  var file = 'test/files/dir1/file1.mkv';
  var subtitles = 'test/files/subtitles.srt';

  assert(!fs.existsSync(subtitles));

  subfil.download(file, {destination: subtitles}, function (err, stat, dest) {
    if (err) {
      throw err;
    }

    assert(fs.existsSync(dest));
    assert.equal(dest, subtitles);

    done();
  });
});

it('should continue downloading after getting errors', function (done) {
  this.timeout(20000);

  var files = [
    'test/files/dir1/file1.mkv',
    'test/files/dir1/file2.mkv',
    'test/files/dir2/',
    'test/files/file.mkv'
  ];

  var subtitles = [
    'test/files/dir1/file1-en.srt',
    'test/files/dir1/file2-en.srt',
    undefined,
    'test/files/file-en.srt'
  ];

  subtitles.forEach(function (file) {
    assert(!fs.existsSync(file));
  });

  subfil.download(files, function (err, status, destinations) {
    if (err) {
      throw err;
    }

    assert.equal(destinations.length, subtitles.length);
    for (var i in subtitles) {
      if (status[i] === 'OK') {
        assert(fs.existsSync(destinations[i]));
        assert.equal(destinations[i], subtitles[i]);
      }
    }

    done();
  });

});
