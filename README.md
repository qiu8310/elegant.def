# elegant.def
[![NPM version](https://badge.fury.io/js/elegant.def.svg)](https://npmjs.org/package/elegant.def)
[![GitHub version][git-tag-image]][project-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-url]][daviddm-image]
[![Coverage Status][coveralls-image]][coveralls-url]

> Elegant define javascript function

## Usage
  
* Using `this`

  ```js
  def(function index() {
    /**
     * @rule (Array arr [, Int num]) -> *
     */
     return this.arr[this.num];
  });
  ```

* Using `self`

  ```js
  def(function index(self) {
    /**
     * @rule (Array arr [, Int num]) -> *
     */
     return self.arr[self.num];
  });
  ```

* Using arguments inject

  ```js
  def(function index(arr, other) {
    /**
     * @rule (Array arr [, Int num]) -> *
     */
     // Parameter `other` will always be `undefined`
     return arr[this.num];
  });
  ```
  
## Install

### Node

    npm install elegant.def --save
    
    var def = require('elegant.def');

### Browser
    
    bower install elegant.def --save
    
    // Then use elegant.def/browser/full.js or elegant.def/browser/simple.js



### Code Need Minimize？

When code minimized, comment will be removed, include the def's heredoc comment, so you must compile it before minimizing your code.

You can using below 5 methods to compile your code:

* CLI
  
  1. Global install `elegant.def`
  
  ```bash
  npm install -g elegant.def
  ```
  
  2. Compile your file
  
  ```bash
  def-compile path/to/source/file
  ```
  

* Node script

  ```js
  var compile = require('elegant.def/src/compile');
  var fs = require('fs');
  
  var inputContent = fs.readFileSync('path/to/source/file').toString();
  var outputContent = compile(inputContent, {defName: 'def'});
  
  // process the outputContent 
  // ...
  ```

* Online compile

  [http://qiu8310.github.io/elegant.def/](http://qiu8310.github.io/elegant.def/)

* gulp-def

  [http://github.com/qiu8310/gulp-def/](http://github.com/qiu8310/gulp-def/)

* grunt-def

  [http://github.com/qiu8310/grunt-def/](http://github.com/qiu8310/grunt-def/)

### Surprise

when your code is compiled, you can use a smaller elegant.def script.

* Small version in node: `var def = require('elegant.def/src/simple')`
* Small version in browser: `elegant.def/browser/simple.js`


## Config items in heredoc

 ITEM       |   DESCRIPTION
----------- | ---------------
`@name`     | `String`, Function name
`@alias`    | `String`, Function name alias
`@defaults` | `Object`, Function's arguments default values
`@rule`     | The main config item (Continue to see more detail)


### rule

_Format:_ `(type_1 name_1, [type_2 name_2 = defaultValue]) -> returnType`

_e.g:_

    // Basic
    (int min, int max) -> int
    (int length) -> int
    
    // Optional argument with a default value
    ([string pool='alpha'], int repeat) -> string

    // Rest argument
    (int ...numbers, string foo) -> int
    

## Note

* Values in heredoc (include @defaults and @rule's arguments value) is parsed by [jsonfy](https://github.com/qiu8310/jsonfy).
* If no rule defined, it will return the original function.
* For now, `returnType` was just used as understanding the rule's return type, no other use.

## API

### def.is(mix, type)

Judge if `mix` is `type`

_e.g:_ 

    def.is(true, 'boolean')  // true
    def.is('123', 'number')  // false

### def.type(key, fn)

Define a new type or overwrite an exists type.

`fn` is used to judge if a parameter is your defined type.


_e.g:_

    def.type('float', function(mix) {
      return def.is(mix, 'number') && !def.is(mix, 'int')
    });

### def.unType(key), def.untype(key)

Delete a defined type name.

_e.g:_

    def.unType('float');
    
    
### def.normalize(key)
    
Transform type alias name to it original name.

_e.g:_

    def.normalize('integer'); // => int

<!--
### def.option(key, value)

配置，这是全局的配置，在定义函数时，可以指定一些具体的配置来覆盖全局配置，但这些配置只在其所在的函数内才有效

如果只有一个参数 key，则返回 key 对应的值

_e.g:_

    def.config('applySelf', true);
    
    def(function(str) {
      /**
       * @rule (string str) -> *
       */
       return this.str === str;   // 注意使用的是 this
    });

目前支持的配置:

* applySelf: bool，默认为 `false`, 如果为 `true`，则在函数执行是可以直接使用 `this`，而不是其参数上的 `self`，另外它的参数也会变成和调用时使用的参数一致
-->

## Support types

__Case Insensitive__

 TYPE                   | DESCRIPTION
 ---------------------- | -----------
 int, integer, signed   | 整数
 unsigned, nature       | 大于等于0的整数（自然数）
 positive               | 大于0的整数
 negative               | 小于0的整数
 number                 | 所有数字（包括浮点数）
 string                 | 字符串
 object                 | 简单的 object (不包括 array, arguments 等）
 array                  | 数组
 function               | 函数
 arguments              | 函数的参数类型
 bool, boolean          | 布尔
 null                   | Null(其实这个没什么意义，这个变量的类型是 Null)
 *                      | 通配类型，可以匹配任何的类型（尽量少用，写这个程序的目的就是强化JS里的数据类型）
 

## TODO

* 支持 SourceMap
* 加上返回值的监控(5)
* rule 可以指定名称，然后在函数执行是可以知道当前是匹配了哪条 rule
* 整合我的 spa-bootstrap
* 支持新类型 enum: (string<enum> flag = ok|cancel, string foo)
* 根据 rule 自动化测试
* 自动测试
* silent def

  ```    
  // hack silent def
  var _def = def;
  def = function() {
    var binder = this;
    try {
      _def.apply(this, arguments);
    } catch (e) {};
  };
  ```


## HISTORY

* v1.0.0 之后更新日志移入到 [CHANGELOG.md](CHANGELOG.md)

* 2015-01-13  可以用 `def.type` 来重新定义系统上已经存在的 type，但 `def.unType` 只能删除重新定义的，不会删除系统已有的（尚末测试）
* 2015-01-12  在 self 中添加变量 `$defaults`，可以让函数体访问自己定义的默认值（尚末测试）
* 2015-01-12  rule 中设置参数的默认 int 值为 0 或 负数 时，会将它们当作字符串（已加测试，待发布）
  
  > 主要是 isNumerical 函数少判断了为 0 和 负数 的情况
 

[doc-url]: http://inch-ci.org/github/qiu8310/elegant.def
[doc-image]: http://inch-ci.org/github/qiu8310/elegant.def.svg?branch=master
[project-url]: https://github.com/qiu8310/elegant.def
[git-tag-image]: http://img.shields.io/github/tag/qiu8310/elegant.def.svg
[travis-url]: https://travis-ci.org/qiu8310/elegant.def
[travis-image]: https://travis-ci.org/qiu8310/elegant.def.svg?branch=master
[daviddm-url]: https://david-dm.org/qiu8310/elegant.def.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/qiu8310/elegant.def
[coveralls-url]: https://coveralls.io/r/qiu8310/elegant.def
[coveralls-image]: https://coveralls.io/repos/qiu8310/elegant.def/badge.png
