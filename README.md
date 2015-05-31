# subfil

> Command-line app for downloading subtitles

[![Build Status](https://travis-ci.org/divijbindlish/subfil.svg?branch=master)](https://travis-ci.org/divijbindlish/subfil)

## CLI

```sh
$ npm install -g subfil
```

```sh
$ subfil "spiderman.avi" --language pt --destination subtitles.srt
```

```sh
$ subfil -r ~/Videos
```

## Info

`subfil` uses the SubDB API to download subtitles. All API calls require a unique hash of the video for which subtitles are required. Refer to the
[API Documentation](http://thesubdb.com/api) to see how the hash is generated.

## API

```sh
$ npm install --save subfil
```

```js
// List available languages for hash
subfil.getLanguages(hash, callback);
```

A `filename` can also be provided instead of the `hash`. The callback gets two arguments `(err, languages)` where `languages` is an array of the available languages.

```js
// Download subtitles for hash
subfil.download(hash[, options], callback);
```

A `filename` or a `directory` can also be provided instead of the `hash`. Multiple hashes, filenames or directories can also be provided.

The `options` object contains the following properties:

* `language` - The language in which the subtitles must be downloaded. It defaults to `en`.
* `destination` - The destination to which the subtitles must be downloaded. It defaults to a file in `tmp` directory for hash and an `srt` file in the same folder for a filename.
* `recursive` - Whether to expand directories or not. It defaults to `false`. In case of a non-recursive download, directories give a status of `INVALID_VIDEO_FILE`.

_**Note:** The `destination` parameter currently only works for a single hash or filename._

The callback gets four arguments `(err, status, destination, file)` where `status` is the result from the SubDB API, `destination` is the filename to which the subtitles are downloaded and `file` is the filename or hash which was used to download a particular subtitle. An array is returned for the three if multiple subtitles are downloaded.

## License

MIT © [Divij Bindlish](http://divijbindlish.com)
