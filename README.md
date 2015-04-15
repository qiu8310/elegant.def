# elegant.def
[![NPM version](https://badge.fury.io/js/elegant.def.svg)](https://npmjs.org/package/elegant.def)
[![GitHub version][git-tag-image]][project-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-url]][daviddm-image]
[![Coverage Status][coveralls-image]][coveralls-url]

> 优雅的定义JavaScript函数


## 先来一个 Demo 感受一下：[在线编辑](http://qiu8310.github.io/elegant.def/)，[更多 Demo](https://github.com/qiu8310/elegant.def/tree/master/examples)

    /**
     * 生成一个 起始值为 start，长度为 length，步进值为 step 的整数数组
     */
    var range = def(function() {
      /**
       * 设置配置，applySelf 为 true 表示可以在内部直接使用 this
       * @options { applySelf: true }
       * 
       * 设置默认值
       * @defaults { start: 0, length: 10, step: 1 }
       * 
       * 定义配置规则
       * @rules () -> array
       * @rules (int start) -> array
       * @rules (int start, int length) -> array
       * @rules (int start, int length, int step) -> array
       */
    
      var i, result = [], count = 0;
      for (i = this.start; count < this.length; count++, i += this.step) {
        result.push(i);
      }
    
      return result;
    });
    
    /******* Below is test scripts ******/
    
    // start: 0, length: 10, step: 1
    assert.deepEqual(range(),         [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
    // start: 1, length: 10, step: 1
    assert.deepEqual(range(1),        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    
    // start: 6, length: 2, step: 1
    assert.deepEqual(range(6, 2),     [6, 7]);
    
    // start: 2, length: 4, step: 2
    assert.deepEqual(range(2, 4, 2),  [2, 4, 6, 8]);
  
  
## 安装
### Node

    npm install elegant.def --save
    
    var def = require('elegant.def');

### 浏览器
    
    bower install elegant.def --save
    
    // 然后在页面中引入 elegant.def/browser/full.js 脚本即可


## 使用

### def(fn)

```
def(function(str) {
  /**
   *  @defaults {str: 'Hello!'}
   *  @options {applySelf: false}
   *  @rules ([string str]) -> *
   */
   console.log(self.str);
});
```

### 代码需要压缩？

代码压缩会将注释全部删除了，所以在代码压缩前需要预处理一下，可以使用以下几种方法来处理

#### 命令行

先全局安装 `elegant.def`：`npm install -g elegant.def`

再使用 `def-compile` 命令：`def-compile path/to/source/file`

#### 在线处理

[http://qiu8310.github.io/elegant.def/](http://qiu8310.github.io/elegant.def/)

#### gulp-def

[http://qiu8310.github.io/gulp-def/](http://qiu8310.github.io/gulp-def/)

#### grunt-def

[http://qiu8310.github.io/grunt-def/](http://qiu8310.github.io/grunt-def/)

### 惊喜：代码预处理后，可以引用一个更小版本的脚本

* Node 中引用小版本 def 脚本：`var def = require('elegant.def/src/simple')`
* 浏览器中引用小版本 def 脚本：`elegant.def/browser/simple.js`

#### 主要配置项：

* defaults  函数默认的变量，确定变量值不会出现不存在的情况
* options   一些配置项（详情查看 [def.option](#defoptionkey-value) 处的定义）
* rules     主要的配置（详情直接看下面专门的描述）

#### rules

> 思想其实就是使得函数的调用的每一个参数关联上一个 key，使程序员可以在函数内部通过这个 key 来使用参数
> 另外就是还支持对这些参数的类型强制检查，并且支持设置默认值

_简单的格式:_ `(type_1 name_1, [type_2 name_2 = defaultValue]) -> returnType`

_e.g:_

    // 基本
    (int min, int max) -> int
    (int length) -> int
    
    
    // 可以配置可选的参数，下面的 rules 会匹配 fn(23) 及 fn('number', 23) 两种情况
    ([string pool='alpha'], int repeat) -> string
    
    
    
    // 来个高大上的...(我瞎写的)
    // 能匹配这些路径（按顺序匹配）：
    // max
    // length max
    // min length max
    // foo min length max
    
    ([[[ string foo, ] int min,] int length,] int max) -> *
    
    

#### 注意事项

* **通过HereDoc配置变量值时，使用的解析引擎是 [jsonfy](https://github.com/qiu8310/jsonfy)**
* 如果 @rules 中参数的默认值是数组，需要要用 `<`, `>` 将数组包起来，要不会导致 jsonfy 解析失败
* 如果没有定义任何 rules，会抛出异常，必须配置 rules，你可以配置一个最简单的 rules: ` ( ) -> * `
* 当前 `returnType` 目前还没有任何功能性的作用，这个后期会改进的，写上也更方便别人理解

## API

### def.is(mix, type)

判断变量 mix 的类型是否就是 type 所指定的类型

_e.g:_ 

    def.is(true, 'boolean')  // true
    def.is('123', 'number')  // false

### def.type(key, fn)

定义一个新的类型名 key， fn 是用来判断任意一个变量是否是你所指定的这个新类型

**可以通过此函数覆盖系统默认的参数类型**

_e.g:_

    def.type('float', function(mix) {
      return def.is(mix, 'number') && !def.is(mix, 'int')
    });

### def.unType(key), def.untype(key)

删除已有的类型

_e.g:_

    def.unType('float');
    

### def.option(key, value)

配置，这是全局的配置，在定义函数时，可以指定一些具体的配置来覆盖全局配置，但这些配置只在其所在的函数内才有效

如果只有一个参数 key，则返回 key 对应的值

_e.g:_

    def.config('applySelf', true);
    
    def(function(str) {
      /**
       * @rules (string str) -> *
       */
       return this.str === str;   // 注意使用的是 this
    });

目前支持的配置:

* applySelf: bool，默认为 `false`, 如果为 `true`，则在函数执行是可以直接使用 `this`，而不是其参数上的 `self`，另外它的参数也会变成和调用时使用的参数一致



## 系统默认支持的参数的类型

__大小写不敏感，可以按你自己的爱好来书写__

 TYPE                   | 说明
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
* 强化 `self` 功能(5)
* rules 可以指定名称，然后在函数执行是可以知道当前是匹配了哪条 rules
* 支持配置把字符串 '123' 也当成数字，并支持全局配置和对单个函数配置(NOT DONE)(用户自己可以通过新添加类型来支持）
* 整合我的 spa-bootstrap
* 支持这种 rules:  (string str, int arr..., bool b) -> * ，匹配 ('abc', 1, 2, 3, 4, true)
* 支持新类型 enum: (string<enum> flag = ok|cancel, string foo)
* 根据 rules 自动化测试
* self 里一定要加个函数 self.has(key)，因为习惯我们经常用 if (self.key) 模式去判断
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

## Done

* v1.0.0

  - 压缩代码工具会将注释给清除了（By 鸿飞）
  - 缓存 _allPossible 的结果，不要每次都去运行
  - 生成注释


## 更新日志

* v1.0.0 之后更新日志移入到 [CHANGELOG.md](CHANGELOG.md)

* 2015-01-13  可以用 `def.type` 来重新定义系统上已经存在的 type，但 `def.unType` 只能删除重新定义的，不会删除系统已有的（尚末测试）
* 2015-01-12  在 self 中添加变量 `$defaults`，可以让函数体访问自己定义的默认值（尚末测试）
* 2015-01-12  rules 中设置参数的默认 int 值为 0 或 负数 时，会将它们当作字符串（已加测试，待发布）
  
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
