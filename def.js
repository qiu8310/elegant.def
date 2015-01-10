/**
 * 支持的基本类型（大小写不敏感）：
 *
 *  类型都是严格检查的，如 '234' 就是字符串，而不是整数 234（不能因为语言宽泛就放松自己，这也是我写这个程序的意义）
 *
 *  NOTE: 因为 JS 里没有 int 类型，只有 number，所以所有 int 都是 number, 但 number 不一定是 int
 *
 *  int | integer | signed
 *  unsigned | nature           大于等于0的整数（自然数）
 *  positive                    大于0的整数
 *  negative                    小于0的整数
 *  number                      所有数字
 *  string
 *  object
 *  array
 *  function
 *  arguments
 *  bool | boolean
 *  null
 *
 *  及通配类型： *                可以匹配任意类型( * key )，也可以表示函数可以接受任何参数( * )
 *                             （函数要清晰明了，就尽量不要用通配类型，用也尽量用在最后的规则中）
 *
 *
 *
 * 函数的参数的写法 ： NOTE 支持在 rule 中设置默认值(字符串、数字、布尔、null)，只有在方括号里的参数才能设置默认值
 *
 *  NOTE 设置默认值时，它里面不能包含 , [ ] 这三种特殊字符
 *  NOTE 默认值是数字时不支持科学计数，如 1e4 这种形式，它会被解析成字符串 '1e4'，你需要写成 10000 这种形式
 *  [ string pool = 'alpha', ] int length
 *
 *  [ string pool, ] int min, int max
 *
 *  *
 *
 *  int length, * mix
 *
 *  [ string foo, ] * min [, int length] , int max // NOTE: 方括号在前就把后面的 , 放在方括号里，在后面就把前面的 , 放方括号里
 *
 *  [ string foo, ] int min [, int length , int max ]
 *
 *  [[ string foo, ] int min,] int length , int max
 *
 *  [[[ string foo, ] int min,] int length,] int max
 */


(function() {

  // 所有用到的正则，预编译
  var RE = {
    hereDoc: /\/\*\*([\s\S]*?)\*\//,
    gHereDocRule: /@[Rr]ule\s*(\([^\)]*\)\s*->\s*(?:\*|\w+))/g,
    gTrim: /^\s*|\s*$/g,
    gComma: /,/g,
    gEOL: /[\r\n]+/g,
    word: /^\w+$/,
    gSpace: /\s+/g,
    numerical: /^(?:\d*\.)?\d+$/,
    gBracket: /([\[\]])/g,
    ruleArgs: /\(([^\)]*)\)/,
    gRuleArgsItem: /(\*|\w+)\s+(\w+)\s*(?:=\s*([^,\[\]]*))?/g
  };
  var TYPE = {};

  //## 基本函数
  function typeOf(obj) { return ({}).toString.call(obj).slice(8, -1).toLowerCase(); }
  function trim(str) { return str.trim ? str.trim() : str.replace(RE.gTrim, ''); }
  function cap(str) { return str.charAt(0).toUpperCase() + str.substr(1); }

  function eachObj(o, fn) {for(var k in o){ if(o.hasOwnProperty(k)){if(fn(o[k], k, o) === false) {break;}}}}
  function each(a, fn){for (var i = 0; i < a.length; ++i) {if (fn(a[i], i, a) === false) { break; }}}
  function map(a, fn){var r = []; return a.map ? a.map(fn) : (each(a, function(){r.push(fn.apply(null, arguments));}) || r);}
  function filter(a, fn){var r = []; return a.filter ? a.filter(fn) : (each(a, function(i){fn.apply(null, arguments) && r.push(i);}) || r);}
  //function index(a, s) {var r = -1; return a.indexOf ? a.indexOf(s) : (each(a, function(t, i) {if(s===t) {r=i; return false;}}) || r);}
  //function include(a, s) {return ~index(a, s);}

  function arrify(arg, index) { return [].slice.call(arg, index || 0); }
  function merge(to) {
    if (!TYPE.isObject(to)) { to = {}; }
    each(arrify(arguments, 1), function(arg) {
      if (TYPE.isObject(arg)) {eachObj(arg, function(v, k) { to[k] = v; });}
    });
    return to;
  }

  function error(msg, obj) {
    var sep = '\r\n', pre = '\t';
    eachObj(obj, function(val, key) {
      msg += sep + pre + cap(key) + ': ' + val.toString();
    });
    throw new Error(msg);
  }

  // 类型检查
  each('Object,Number,String,Array,Boolean,Undefined,Function'.split(','), function(key) {
    // NaN 不属于上面的任何类型，默认的 typeOf(NaN) 返回的是 true 的，用 mix === mix 把 NaN 过滤掉
    TYPE['is' + key] = function(mix) { return mix === mix && typeOf(mix) === key.toLowerCase(); };
  });

  function isNumerical(str) {
    if (RE.numerical.test(str)) {
      // 0056, 00.56, 56.00 也会符合正则的
      if (~str.indexOf('.')) {
        // 如果小数的第一位是0，则第二位一定要是 . ； 而如果第一位不是 0，则不管 . 在第几位都有效
        return (str.charAt(0) !== '0') || (str.charAt(1) === '.')
      } else {
        return str.charAt(0) !== '0';
      }
    }
    return false;
  }

  function isInt(mix) { return TYPE.isNumber(mix) && String(mix).indexOf('.') === -1; }

  /**
   * 将字符串解析成 JS 的字面量，只支持 字符串、数字、布尔、null 这四种形式
   *
   * @example
   *  strToLiteralValue("'123'")  => '123'
   *  strToLiteralValue("123")  => 123
   *  strToLiteralValue("true")  => true
   *  strToLiteralValue("'true'")  => 'true'
   */
  var literalKeyWords = {'true': true, 'false': false, 'null': null};
  function strToLiteralValue(str) {
    if (!TYPE.isString(str)) { return str; }
    if (str === '') { return undefined; }

    var fc = str.charAt(0), lc = str.charAt(str.length - 1);
    if (fc === lc && (fc === '"' || fc === '\'')) { return str.slice(1, -1); }

    var kw = str.toLowerCase();
    if (kw in literalKeyWords) {  return literalKeyWords[kw]; }

    if (isNumerical(str)) {
      return (~str.indexOf('.')) ? parseFloat(str) : parseInt(str, 10);
    }

    // 其它情况都当作字符串吧
    return str;
  }


  function parseRulesFromHereDoc(doc) {
    var result = [];

    if (RE.hereDoc.test(doc)) {
      RegExp.$1.replace(RE.gHereDocRule, function(_, rule) {
        result.push(rule);
      });
    }
    return result;
  }


  function def(rules, fn, context) {
    var binder = this;

    if (TYPE.isFunction(rules)) {
      context = fn;
      fn = rules;
      rules = [];
    }

    rules = map(rules.concat(parseRulesFromHereDoc(fn.toString())), function(rule) { return new Rule(rule); });

    return function() {
      var args = arrify(arguments), matches = false, rule;

      if (rules.length === 0) {
        return fn.apply(binder, args);
      }

      // 遍历规则，看是否有匹配的
      each(rules, function(r) {
        matches = r.match(args);
        if (matches) {
          rule = r;
          return false;
        }
      });

      // 执行原函数
      if (matches) {
        var self = {arguments: args, $rule: rule};
        merge(self, context, matches);
        return fn.call(binder, self);
      }


      // 输出错误（一定要输出，谁要你自己不规范，程序要写好就要确保不出现下面的错误）
      error('Arguments match no rule.', {
        function: fn.toString().replace(RE.gEOL, ' ').substr(0, 100),
        arguments: map(args, function(arg) { return String(arg); }).join(','),
        rules: map(rules, function(rule) { return rule.raw; }).join('; ')
      });

    };
  }



  //## 基本类型

  var basicTypes = '*,int,number,string,object,array,function,arguments,boolean,null,nature,positive,negative'.split(',');
  var typeAliases = {
    integer: 'int',
    signed: 'int',
    bool: 'boolean',
    unsigned: 'nature'
  };
  each(basicTypes, function (key) { typeAliases[key] = key; });


  def.is = function(mix, type) {
    type = type && type.toLowerCase();
    if (!(type in typeAliases)) { error('Type: ' + type + ' is not exists.'); }

    type = typeAliases[type];

    // 自定义的类型
    var fn = typeAliases[type + '___check'];
    if (fn) { return fn(mix); }

    switch (type) {
      case '*':         return true;
      case 'int':       return isInt(mix);
      case 'number':    return TYPE.isNumber(mix);
      case 'nature':    return isInt(mix) && mix >= 0;
      case 'positive':  return isInt(mix) && mix > 0;
      case 'negative':  return isInt(mix) && mix < 0;

      //case 'string':
      //case 'object':
      //case 'array':
      //case 'function':
      //case 'arguments':
      //case 'boolean':
      //case 'null':

      default : return typeOf(mix) === type;
    }
  };

  // 注册新的类型
  def.type = function(key, fn) {
    typeAliases[key] = key;
    typeAliases[key + '___check'] = fn;
  };

  // 删除自定义的类型
  def.unType = function(key) {
    var fnKey = key + '___check';
    if (fnKey in typeAliases) {
      delete typeAliases[key];
      delete typeAliases[fnKey];
      return true;
    }
    return false;
  };



  //## 规则对象
  function Rule(str) {
    var self = this;
    this.raw = trim(str);
    this.keys = [];     // Example: [pool, length, min, max]
    this.keysAry = [];  // Example: [pool, [length, [min, max]]
    this.keyOpts = {};  // key => {type: <string>, defaultValue: *, optional: <bool> }

    this.rawArgs = trim(this.raw.match(RE.ruleArgs)[1]);

    // 空字符串 和 * 都全是匹配所有的情况
    if (this.rawArgs === '' || this.rawArgs === '*') {
      this.matchAll = true;
    } else {

      // 获取 keys 和 keyOpts {key => {type: *, defaultValue: *, optional: true}
      // 返回只包含 [ ] 和 key 的字符串
      str = this._parseRuleItems();

      // 生成 keysAry
      this._parseKeysAry(str);

      // keysAry 最外层的 key 的 optional 属性是 false
      each(this.keysAry, function(key) {
        if (TYPE.isString(key)) {
          var ref = self.keyOpts[key];
          ref.optional = false;

          // 非 optional 的字段不能设置 defaultValue
          if (!TYPE.isUndefined(ref.defaultValue)) {
            self._error('Not optional key `' + key + '` can not set default value `' + ref.defaultValue + '`.')
          }
        }
      });
    }
  }

  Rule.prototype = {
    _error: function(msg) {
      var rule = this.raw;
      error(msg, {rule: rule});
    },

    // 解析 rawArgs 中所指定的 type key defaultValue (eg: string pool = 'alpha')字段
    // 返回去除了 type 和 defaultValue 后的字符串（即只包含 [ ] 和 key 的信息）
    _parseRuleItems: function() {
      var keyOpts = this.keyOpts, keys = this.keys, self = this;

      return this.rawArgs.replace(RE.gRuleArgsItem, function(_, type, key, defaultValue) {
        if (!TYPE.isUndefined(defaultValue)) {
          defaultValue = strToLiteralValue(trim(defaultValue));
        }

        if (key in keyOpts) {
          self._error('Argument name `' + key + '` duplicated');
        }
        keys.push(key);
        keyOpts[key] = {type: type, defaultValue: defaultValue, optional: true};

        return key;
      });
    },

    // [[[ foo, ] min,] length,] max => 生成一个对应的深层的数组
    _parseKeysAry: function(str) {
      var self = this;
      var ref = this.keysAry;
      var stack = [ref];

      // 去除逗号
      str = str.replace(RE.gComma, ' ');

      // 避免 [ ] 连在一起，为下面通过 space 来划分 token 作准备
      str = str.replace(RE.gBracket, ' $1 ');

      each(str.split(RE.gSpace), function(token) {
        if (token === '[') {
          var ary = [];
          ref.push(ary);
          stack.push(ary);
          ref = ary;
        } else if (token === ']') {
          stack.pop();
          ref = stack[stack.length - 1];
        } else if (RE.word.test(token)) {
          if (!(token in self.keyOpts)) {
            self._error('Key word `' + token + '` not exists');
          } else {
            ref.push(token);
          }
        }
      });
    },


    // 除了最外层的 []，在内部每遇到一个 [] 就有两种情况，要与不要
    _allPossible: function() {
      var walk = function(arr) {
        var result = [[]];  // result 是个多维数组
        each(arr, function(item) {
          if (TYPE.isArray(item)) {
            var len = result.length;
            each(walk(item), function(keys) {
              var i, copy;
              for (i = 0; i < len; i++) {
                copy = [].concat(result[i]);
                result.push(copy.concat(keys));
              }
            });
          } else {
            each(result, function(r) { r.push.apply(r, [].concat(item)); });
          }
        });
        return result;
      };

      return walk(this.keysAry);
    },

    match: function(args) {
      var result = {};
      if (this.matchAll) {
        return result;
      } else {
        var argsLen = args.length, opt, ok,
          self = this;

        each(this._allPossible(), function(keys) {
          if (keys.length === argsLen) {
            ok = keys;
            each(keys, function(key, index) {
              opt = self.keyOpts[key];
              if (!def.is(args[index], opt.type)) {
                ok = false;
                return false;
              }
            });
            return !ok;
          }
        });

        if (ok) {
          // 取出默认值
          eachObj(self.keyOpts, function(opt, key) {
            if (!TYPE.isUndefined(opt.defaultValue)) {
              result[key] = opt.defaultValue;
            }
          });

          // 设置用户定义的值
          each(ok, function(key, index) {
            result[key] = args[index];
          });

          return result;
        }
      }

      return false;
    }
  };


  if ( typeof module === 'object' && typeof module.exports === 'object' ) {
    module.exports = def;
  } else {
    (typeof window !== 'undefined' ? window : this).def = def;
  }



  //var repeat = def(function(self) {
  //  /**
  //   * @rule ( [string pool = '1',] int min, int max ) -> string
  //   * @rule ( [string pool = '2',] int length ) -> string
  //   * @rule ( string pool ) -> string
  //   *
  //   * @return string
  //   */
  //
  //  var times = function(pool, count) { return (new Array(count + 1)).join(pool); };
  //
  //  // 生成一个长度为 length 的 pool
  //  if (self.length) {
  //    return times(self.pool, self.length);
  //  }
  //
  //  // 剩下的情况：生成一个长度在 min 和 max 的 pool
  //  else {
  //    var count = self.min + Math.floor(Math.random() * (self.max - self.min + 1));
  //    return times(self.pool, count);
  //  }
  //
  //
  //}, {min: 1, max: 3, pool: '0'});
  //
  //
  //
  //console.log(repeat(5, 10));       // 匹配第一条 rule => 生成的 '1' 的个数在 5 到 10 之间
  //console.log(repeat('a', 5, 10));  // 匹配第一条 rule => 生成的 'a' 的个数在 5 到 10 之间
  //
  //console.log(repeat(5));           // 匹配第二条 rule => 生成的5 个 '2'，即 '22222'
  //console.log(repeat('b', 5));      // 匹配第二条 rule => 生成的5 个 'b'，即 'bbbbb'
  //
  //console.log(repeat('c'));         // 匹配第三条 rule => 生成的 'c' 的个数在 1 到 3 之间
  //
  //try{
  //  console.log(repeat());          // 没有匹配的 rule，报错
  //} catch (e) { console.log('catch error'); }
  //
  //try{
  //  console.log(repeat('a', 'b'));  // 也没有匹配的 rule，报错
  //} catch (e) { console.log('catch error'); }


})();


