# jsonfy 
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-url]][daviddm-image] [![Coverage Status][coveralls-image]][coveralls-url]

Parse json like string to json object


## Install

```bash
$ npm install --save jsonfy
```


## Usage

```javascript
var jsonfy = require('jsonfy');
jsonfy('{str: abc, bool: true, number: 0.24, array: [1,2], emptyObj: {}}'); 

// return: 
//{
//  str: 'abc',
//  bool: true,
//  number: 0.24,
//  array: [1, 2],
//  emptyObj: {}
//}
```


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [gulp](http://gulpjs.com/).


## License

Copyright (c) 2015 Zhonglei Qiu. Licensed under the MIT license.



[npm-url]: https://npmjs.org/package/jsonfy
[npm-image]: https://badge.fury.io/js/jsonfy.svg
[travis-url]: https://travis-ci.org/qiu8310/jsonfy
[travis-image]: https://travis-ci.org/qiu8310/jsonfy.svg?branch=master
[daviddm-url]: https://david-dm.org/qiu8310/jsonfy.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/qiu8310/jsonfy
[coveralls-url]: https://coveralls.io/r/qiu8310/jsonfy
[coveralls-image]: https://coveralls.io/repos/qiu8310/jsonfy/badge.png
