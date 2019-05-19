# README

> **fastqparser** is a Fastq stream parser

[![License](https://img.shields.io/github/license/MatthewRalston/fastqparser.svg?style=flat-square)](https://raw.githubusercontent.com/MatthewRalston/fastqparser/master/LICENSE)
[![NPM version](https://img.shields.io/npm/v/fastqparser.svg?style=flat-square)](https://www.npmjs.org/package/fastqparser)
[![Dependencies Status](https://img.shields.io/david/luizirber/fastqstream.svg?style=flat-square)](https://david-dm.org/MatthewRalston/fastqparser#info=dependencies)
[![NPM downloads per month](https://img.shields.io/npm/dm/fastqstream.svg?style=flat-square)](https://www.npmjs.org/package/fastqparser)
[![GitHub issues](https://img.shields.io/github/issues/MatthewRalston/fastqparser.svg?style=flat-square)](https://github.com/MatthewRalston/fastqparser/issues)

## Usage

Parse a fastq.gz filestream. Omit the zlib pipe if the file is uncompressed.
```js
var zlib = require('zlib');
var fs = require('fs');
var fastq = require('fastq'); // require('./index');

fs.createReadStream('path/to/example.fastq.gz')
	.pipe(zlib.createUnzip())
	.pipe(fastq.obj())
	.pipe(do_something())
	.on('finish', function(){
		console.log("Done");
	});

```

Parse a fastq.gz S3 object
```js
var s3 = require('aws-sdk/clients/s3');
s3.getObject({bucket: 'bucketname', path: 'path/to/file.fastq.gz'}).createReadStream()
	.pipe(zlib.createUnzip())
	.pipe(fastq.obj())
	.pipe(do_something())
	.on('finish', function(){
		console.log("Done");
	});

```

## Alternatives

I've been needing a streamable fastq file parser, and didn't like the development state of bionode-fastq, which implements a different file-only base API compared to the stellar bionode-fasta. My philosophy is similar to [fastqstream](https://www.npmjs.com/package/fastqstream).

- [fasta-tools](https://www.npmjs.com/package/fasta-tools)
- [fqreader](https://www.npmjs.com/package/fqreader)
- [bionode-fastq](https://www.npmjs.com/package/bionode-fastq)
- [streaming-sequence-extractor](https://www.npmjs.com/package/streaming-sequence-extractor)

## License

GPL-3.0
