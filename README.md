# elegant.def

> 优雅的定义JavaScript函数


## 先来一个 Demo 感受一下

    var repeat = def(function(self) {
      /**
       * 指定调用函数的参数的规则
       *
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
      
      // 设置默认的选项
    }, {min: 1, max: 3, pool: '0'});
  
  
  
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

### bower

`bower install elegant.def --save`

### npm

`npm install elegant.def --save`


## 使用方法

* 方法一  `def(fn, [defaultParams])` ，rules定义在 fn 里的 HereDoc 中，如上面示例
* 方法二  `def(rules, fn, [defaultParams]`

`defaultParams` 是一个`object`，可以配置全局的默认值，但如果在 rule 中配置了默认值，会将对应的全局的默认值覆盖了


### rule 定义方法

* 通过第一个参数传给 def 函数
* 通过在 `fn` 中定义 HereDoc 

**两处都定义的话会把两处定义的 rules 进行合并，通过参数传递的 rule 放在前面，通过 HereDoc 解析的放在后面**
**如果没有定义一个 rules 的话，则返回的函数就是一个普通的函数，没有这些高级功能**


### rule 的格式 `(argType1 argName1, [argType2 argName2 = defaultValue]) -> returnType`

**在 function 中的 HereDoc 上定义还要加上 @Rule 或 @rule 的声明**

在 argName 后面加上 `＝ xxx` 可以为这个参数配置默认值，但只有可选的参数（即被 `[]` 包围的参数才有默认值配置，不过可以在定义函数时通过最后一个参数来配置全局的默认值


**当前 `returnType` 目前还没有任何功能性的作用，这个后期会改进的，写上也更方便别人理解**


**参数中你可以任意添加成对的 `[]`，程序会找出所有可能出现的情况，然后和实际传入的参数进行对比，第一个匹配成功的即被解析，下面的就不会执行**


**默认值只支持 `字符串`、`数字`、`布尔` 及 `Null` 四种类型的字面常量**
**默认值中不能出现的这三个字符：`,`, `[`, `]`**
**默认值如果没有解析成功则会返回其字面量的字符串**
**默认值是数字时不支持科学计数，如 `1e4` 这种形式，它会被解析成字符串 `'1e4'`，你需要写成 `10000` 这种形式才能解析成功




### 支持配置的参数的类型

__大小写不敏感，可以按你自己的爱好来书写__

 TYPE                   | 说明
 ---------------------- | -----------
 int, integer, signed   | 整数
 unsigned, nature       | 大于等于0的整数（自然数）
 positive               | 大于0的整数
 negative               | 小于0的整数
 number                 | 所有数字（包括浮点数）
 string                 |
 object                 |
 array                  |
 function               |
 arguments              |
 bool, boolean          |
 null                   |
 *                      | 通配类型，可以匹配任何的类型（尽量少用，写这个程序的目的就是强化JS里的数据类型）
 

### 自定义新的参数的类型

    // 自定义了一个 `foo` 类型，它只能包含 `'foo'` 和 `'bar'` 两个字符串
    def.type('foo', function(mix) {
      return (mix === 'foo' || mix === 'bar');
    });
    
    // 删除自定义的类型（删除不了系统默认的）
    def.unType('foo')


## 测试

先安装 `jasmine`:  `npm install jasmine --global`

再在根目录下执行运行 `jasmine` 即可
 
 
## TODO

* 加上返回值的监控(5)
* 强化 `self` 功能(5)
* 配置的rule中的默认值也要检查下它是否是指定的类型（系统的默认值呢？）(1)
 
