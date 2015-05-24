# subfil

> Command-line app for downloading subtitles

## CLI

```sh
$ npm install -g subfil
```

```sh
$ subfil "spiderman.avi" --language pt
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

A `filename` can also be provided instead of the hash. The callback gets two arguments `(err, languages)` where `languages` is an array of the available languages.

```js
// Download subtitles for hash
subfil.download(hash[, language[, destination]], callback);
```

A `filename` can also be provided instead of the hash. The callback gets two arguments `(err, destination)` where destination is the filename to which the subtitles are downloaded. `language` defaults to `en` and `destination` defaults to a file in `tmp` directory for hash and an `srt` file in the same folder for a filename.

## License

MIT © [Divij Bindlish](http://divijbindlish.com)
