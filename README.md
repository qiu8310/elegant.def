# elegant.def

> 优雅的定义JavaScript函数


## 先来一个 Demo 感受一下 [在线查看](http://runjs.cn/code/v1q62mja)

    var repeat = def(function(self) {
      /**
       * 设置默认的参数
       * @defaults {min: 1, max: 3, pool: '0'}
       * 
       * 指定调用函数的参数的规则
       * @rule ( [string pool = '1',] int min, int max ) -> string
       * @rule ( [string pool = '2',] int length ) -> string
       * @rule ( string pool ) -> string
       *
       * @return string
       */
      var times = function(pool, count) { return (new Array(count + 1)).join(pool); };
  
      // 生成一个长度为 length 的 pool
      if (self.length) {
        return times(self.pool, self.length);
      }
  
      // 剩下的情况：生成一个长度在 min 和 max 的 pool
      else {
        var count = self.min + Math.floor(Math.random() * (self.max - self.min + 1));
        return times(self.pool, count);
      }
    });
  
  
  
    console.log(repeat(5, 10));       // 匹配第一条 rule => 生成的 '1' 的个数在 5 到 10 之间
    console.log(repeat('a', 5, 10));  // 匹配第一条 rule => 生成的 'a' 的个数在 5 到 10 之间
  
    console.log(repeat(5));           // 匹配第二条 rule => 生成的5 个 '2'，即 '22222'
    console.log(repeat('b', 5));      // 匹配第二条 rule => 生成的5 个 'b'，即 'bbbbb'
  
    console.log(repeat('c'));         // 匹配第三条 rule => 生成的 'c' 的个数在 1 到 3 之间
  
    try{
      console.log(repeat());          // 没有匹配的 rule，报错
    } catch (e) { console.log('catch error'); }
  
    try{
      console.log(repeat('a', 'b'));  // 也没有匹配的 rule，报错
    } catch (e) { console.log('catch error'); }
  
  
## 安装
### Node

    npm install elegant.def --save
    
    var def = require('elegant.def');

### 浏览器
    
    bower install elegant.def --save
    
    // 然后在页面中引入脚本即可
  

## 使用

### def(fn, cfg)

**HereDoc 风格**

    def(function(str) {
      /**
       *  @defaults {str: 'Hello!'}
       *  @options {applySelf: false}
       *  @rule ([string str]) -> *
       */
       console.log(self.str);
    });
    
    
**参数风格**
    
    def(function(self) {
    
      console.log(self.str);
      
    }, {
      rules: ['([string str]) -> *']
      defaults: {str: 'Hello!'}
      options: {applySelf: false}
    })


> 当然上面两种风格也可以混用，混用后:

> 参数风格的 rules 和 hereDoc 风格的 rules 会并存，但 参数风格的 rules 会被先匹配

> 参数风格的 defaults 和 hereDoc 风格的 defaults 会通过 merge 合并，参数风格的会覆盖 hereDoc 风格的

> options 与 defaults 类型语法类似

> 综述：**参数风格中的配置的优先级比 hereDoc 风格中的配置的优先级要高**


#### 主要配置项：

* defaults  函数默认的变量，确定变量值不会出现不存在的情况
* options   一些配置项（详情查看 config.def处的定义）
* rules     主要的配置（详情直接看下面专门的描述）

#### rule

> 思想其实就是使得函数的调用的每一个参数关联上一个 key，使程序员可以在函数内部通过这个 key 来使用参数
> 另外就是还支持对这些参数的类型强制检查，并且支持设置默认值

_简单的格式:_ `(type_1 name_1, [type_2 name_2 = defaultValue]) -> returnType`

_e.g:_

    // 基本
    (int min, int max) -> int
    (int length) -> int
    
    
    // 可以配置可选的参数，下面的 rule 会匹配 fn(23) 及 fn('number', 23) 两种情况
    ([string pool='alpha'], int repeat) -> string
    
    
    
    // 来个高大上的...(我瞎写的)
    // 能匹配这些路径（按顺序匹配）：
    // max
    // length max
    // min length max
    // foo min length max
    
    ([[[ string foo, ] int min,] int length,] int max) -> *
    
    

#### 注意事项

* **通过HereDoc配置变量值时，只支持配置简单的 `string`, `boolean`, `number` 及 `null` 这些类型的值，另外当配置字符串时，字符串中不能含有 `,`, `[`, `]`, `:`**
* 如果没有定义任何 rules，会抛出异常，必须配置 rule，你可以配置一个最简单的 rule: ` ( * ) -> * `
* rule中只有可选的参数（即包含在`[`,`]`内的参数）才能配置默认值，否则会抛出异常
* 当前 `returnType` 目前还没有任何功能性的作用，这个后期会改进的，写上也更方便别人理解


### def.is(mix, type)

判断变量 mix 的类型是否就是 type 所指定的类型

_e.g:_ 

    def.is(true, 'boolean')  // true
    def.is('123', 'number')  // false

### def.type(key, fn)

定义一个新的类型名 key， fn 是用来判断任意一个变量是否是你所指定的这个新类型

_e.g:_

    def.type('float', function(mix) {
      return def.is(mix, 'number') && !def.is(mix, 'int')
    });

### def.unType(key), def.untype(key)

删除自定义的类型（系统定义的类型删除不了）

_e.g:_

    def.unType('float');
    

### def.config(key, value)

配置，这是全局的配置，在定义函数时，可以指定一些具体的配置来覆盖全局配置，但这些配置只在其所在的函数内才有效

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
 null                   | Null(其实这个没什么意义，某个变量的类型是 Null)
 *                      | 通配类型，可以匹配任何的类型（尽量少用，写这个程序的目的就是强化JS里的数据类型）
 
## DEMO

    var mean = def(function(self) {
      /**
       * @defaults {min: 0, max: 10}
       *
       * @rule () -> int
       * @rule (int length) -> int
       * @rule (int min, int max) -> int
       */
      var mean = self.length ? self.length : (self.min + self.max) / 2;
      return Math.round(mean);
    });
    
    console.log(mean());     // 5
    console.log(mean(6));    // 6
    console.log(mean(1,3));  // 2


## 测试

* 先安装 `jasmine`:  `npm install jasmine --global`
* 再在根目录下执行运行 `jasmine` 即可



## TODO

* 加上返回值的监控(5)
* 强化 `self` 功能(5)
* rule 可以指定名称，然后在函数执行是可以知道当前是匹配了哪条 rule
* 支持配置把字符串 '123' 也当成数字，并支持全局配置和对单个函数配置(NOT DONE)(用户自己可以通过新添加类型来支持）


 
