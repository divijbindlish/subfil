# subfil

> Command-line app for downloading subtitles

## CLI

```sh
$ npm install -g subfil
```

```sh
$ subfil "spiderman.avi" --destination subtitles.srt --language pt
```

## Info

`subfil` uses the SubDB API to download subtitles. All API calls require a unique hash of the video for which subtitles are required. Refer to the
[API Documentation](http://thesubdb.com/api) to see how the hash is generated.

## API

```sh
$ npm install --save subfil
```

```js
subfil.getLanguages(filename, callback);
subfil.getLanguages(hash, callback);
```

List the languages available in SubDB for the given hash. The callback gets two arguments `(err, languages)` where `languages` is an array of the available languages.

```js
subfil.download(filename[, language[, destination]], callback);
subfil.download(hash[, language[, destination]], callback);
```

Download subtitles for the hash/filename provided. The callback gets two arguments `(err, destination)` where destination is the filename to which the subtitles are downloaded. `language` defaults to `en` and `destination` defaults to a file in `tmp` directory for hash and an `srt` file in the same folder for a filename.
