# sscan
[![NPM version](https://badge.fury.io/js/sscan.svg)](https://npmjs.org/package/sscan)
[![GitHub version][git-tag-image]][project-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-url]][daviddm-image]
[![Code Climate][climate-image]][climate-url]
[![Coverage Status][coveralls-image]][coveralls-url]


String scanner.


## Install


### Node.js

```bash
npm install --save sscan
```

### Browser

```bash
bower install --save sscan
```

## Usage

```javascript

var scan = require('sscan');
var scanner;

scanner = scan('a{www}bc'); // 或者用：scanner = new scan.Scanner('...');

scanner.bos();          // => true   // Begin of String
scanner.next();         // => '{'
scanner.takeObject();   // => '{www}'
scanner.takeWord();     // => 'bc'
scanner.eos();          // => true  // End of String


```

## API

> 前言
>
> __异常：__
> 
> * `SyntaxError`: 程序内部出错一般会抛出此类异常，err 实例对象附加了 str 和 pos 两个属性，用来标识出错的字符串及位置
> * `Error`: 一个常见的错误信息是 "EOS"，即如果 err.message === 'EOS' 表示已经解析完字符串了，但你没有捕获到
>
>
>__两个常见的参数：__
>
> * `charMatcher`: 单个字符匹配器，可以是一个字符串、正则表达式 或 一个函数：
>   
>    - 字符串：只要字符串中含有这个字符，就表示 true。 比如 `scanner.isChar('abc')` => 当前字符是否在 'abc' 之中
>    - 正则表达式：只要正则表达式能匹配这个字符，就表示 true。 比如 `scanner.isChar(/[\w0-9]/)` => 当前字符能否匹配 /[\w0-9]/
>    - 函数：只要函数在接受字符参数后返回 true，那么也表示 true。比如 `scanner.isChar(function(ch) {})` => 结果由函数返回值决定
>
> * `quoteMode`: 查找字符串的模式，有四种模式：`single`, `double`, `all`, `none`；分别表示只计算单引号、只计算双
>                引号，单引号双引号都计算，不计算任何引号.
>
>    出现这个字段的地方，它的默认值都是 `all`。
>           
>
>

### str

输入的字符串常量。

### pos

当前字符所在的位置。

### char()

返回当前字符。

### isChar(charMatcher)

当前字符是否能匹配 `charMatcher`  （ `charMatcher` 的含意已经在前言中解释了，下面出现了它的话意思也一样）。

### bos()

当前位置是否是字符串的开始， Begin of String。

### eos([charMatcher])

当前位置是否是字符串的结束，End of String。

另外它能接受一个 `charMatcher` 参数，如果设置了它，会判断从现在位置到结束位置中的所胡字符串是否都能匹配 `charMatcher`，
但不会改变当前的 `pos` 。

__e.g__

```javascript
var s = new Scanner('a lll');
s.next();

s.eos();        // => false
s.eos(/[\sl]/); // => true
s.eos('l');     // => false

```

### reset()

将当前的 `pos` 重置为 0

### white()

返回从当前位置开始的空字符串，如果没有一个，则返回 `""`。

_e.g_

```javascript
var s = new Scanner('a  b');

s.white();  // => ''
s.next();
s.white();  // => '  '

```

### peek([length])

向下预先查看指定长度的字符，length 默认值为 1 。

### peekRest()

返回剩下的所有字符串，不改变 `pos` 。

__e.g__

```javascript
var s = new Scanner('abc');
s.next();

s.peekRest(); // => 'bc'
s.pos;        // => 1

```

### till([acceptMatcher,] endMatcher [, eosFn])

从当前位置开始，匹配到 `endMatcher` 所在的位置为止，中间的所有字符需要匹配 `acceptMatcher`。

* 如果匹配到最后还没匹配到 `endMatcher`，则执行 `eosFn` 函数，函数的参数是中间匹配的所有字符组成的字符串。
* 如果没有匹配到最后就匹配到了 `endMatcher`，则直接将中间匹配到的内容返回。
* 如果中间有字符和 `acceptMatcher` 不匹配，则抛出异常

__e.g__

```javascript
var s = new Scanner('abab xyz');
s.till('ab ', 'x');         // => 'abab '
s.till('z');                // => 'xy'
s.till('u', function(rest){
  // `rest` should equal 'z'
})
```


### take(charMatcher)

返回从当前字符开始，所有接下来能匹配 `charMatcher` 的字符，直到字符串结束；它会改变 `pos` 属性。

__e.g__

```javascript
var s = new Scanner('abc def');

s.take(/\w/); // => 'abc'
s.peekRest(); // => ' def'

```


### takeWord()

匹配接下来的一个 word，其实它就是调用了 `Scanner.take(/\w/)` 而已。

唯一不同的是，如果匹配的结果是个空字符串 `""`，此函数会抛出异常。

### takeQuote( [quoteMode] )

匹配字符串中出现的成对的 `'"'` 或 `'\''` 字符串，改变 `pos` 属性到后面那个 quote 的下一个的位置。

如果匹配失败，会抛出 SyntaxError 。
 
__e.g__

```javascript
var s = new Scanner('who "are" you');
s.takeWord();   // => 'who'
s.white();      // => ' '
s.takeQuote();  // => '"are"'
s.peekRest();   // => ' you'
```

### takePair( left, right [, quoteMode] )

类似于 `Scanner.takeQuote`，但它是匹配像 `[]`, `{}`, `<>` 这种成对出现的字符的。

- 默认的 `quoteMode` 为 `'all'`，即如果 `left` 或 `right` 中的字符出现在引号中，会忽略掉它；
- 如果 `quoteMode` 为 `'single'`，即只有 `left` 或 `right` 中的字符出现在单引号中才会忽略；
- 其它类推

__e.g__

```javascript
var s = new Scanner('{"a}"} foo');

s.takePair('{', '}');             // => '{"a}"}'

s.reset();
s.takePair('{', '}', 'single');   // => '{"a}'  // 只有单引号才算引号，双引号被当作普通字符

```

### takeObject([quoteMode])

`Scanner.takePair('{', '}', quoteMode)` 的简写形式。

### takeArray([quoteMode])

`Scanner.takePair('[', ']', quoteMode)` 的简写形式。

### takeValue()

`takeObject`, `takeArray` 和 `takeQuote` 的综合体。


## History

[CHANGELOG](CHANGELOG.md)


## License

Copyright (c) 2015 Zhonglei Qiu. Licensed under the MIT license.



[project-url]: https://github.com/qiu8310/sscan
[git-tag-image]: http://img.shields.io/github/tag/qiu8310/sscan.svg
[climate-url]: https://codeclimate.com/github/qiu8310/sscan
[climate-image]: https://codeclimate.com/github/qiu8310/sscan/badges/gpa.svg
[travis-url]: https://travis-ci.org/qiu8310/sscan
[travis-image]: https://travis-ci.org/qiu8310/sscan.svg?branch=master
[daviddm-url]: https://david-dm.org/qiu8310/sscan.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/qiu8310/sscan
[coveralls-url]: https://coveralls.io/r/qiu8310/sscan
[coveralls-image]: https://coveralls.io/repos/qiu8310/sscan/badge.png

