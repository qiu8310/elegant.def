/* global describe, require, it, expect */

var def = require('../def.js');

describe('elegant.def', function() {


  describe('通配类型测试', function() {

    var fn = def(
      function(self) {
        return self.any;
      }, {
        rules: [
          '(* any) -> *'
        ]
      });


    it('即使用了通配类型，没传参数也会出错', function() {
      expect(fn).toThrow();
    });

    it('传什么类型应该就返回什么类型', function() {
      expect(fn('abc')).toBe('abc');
      expect(fn(true)).toBe(true);
      expect(fn(null)).toBe(null);

      var obj = {a: 'aa'};
      expect(fn(obj)).toBe(obj);
    });

  });


  describe('默认值测试', function() {
    var fn = def(
      function(self) {
        /**
         * @rule ([string a = in here doc ,] [int b]) -> *
         */
        return self.a + self.b;

      }, {
        defaults: {
          a: 'aaa',
          b: 2
        }
      }
    );

    it('使用系统默认变量和rule的默认变量', function() {
      expect(fn()).toBe('in here doc2');
    });

    it('使用用户变量和系统变量', function() {
      expect(fn('aa')).toBe('aa2');
    });

    it('使用用户变量和rule变量', function() {
      expect(fn(4)).toBe('in here doc4');
    });

    it('如果rule中配置的默认值和其指定的类型不一致，抛出异常', function() {
      var fn = function() {
        def(function(){}, {rules: ['(int a = "str") -> *']})
      };
      expect(fn).toThrow();
    });


    it('defaults 同时在多个地方定义的覆盖测试', function() {
      var f = def(
        function(self) {
          /**
           * @defaults {a: 'no_use'}
           * @defaults {a: 'doc', b: 'doc'}
           * @rule ([string a, string b]) -> *
           */
          return self.b === 'args' && self.a === 'doc';
        },
        {
          defaults: {
            b: 'args'
          }
        });

      expect(f()).toBe(true);
    });


  });


  describe('参数类型测试', function() {
    // int,number,string,object,array,function,arguments,boolean,null,nature,positive,negative


    var fn = def(function(self) {
      /**
       * @rule (number number, string type) -> *
       * @rule (string string, string type) -> *
       * @rule (object object, string type) -> *
       * @rule (array array, string type) -> *
       * @rule (function function, string type) -> *
       * @rule (arguments arguments, string type) -> *
       * @rule (boolean boolean, string type) -> *
       * @rule (null null, string type) -> *
       *
       *
       * @rule (bool isNumber, positive positive, string type) -> *
       * @rule (bool isNumber, negative negative, string type) -> *
       * @rule (bool isNumber, nature nature, string type) -> *
       * @rule (bool isNumber, int int, string type) -> *
       *
       *
       * @rule (string alias, bool bool, string type) -> *
       */
      if (self.isNumber === true) {
        return self.type + self[self.type];
      }

      return !!self[self.type];
    });

    it('JS自带的类型检查', function() {
      var args = arguments;

      expect(fn(123, 'number')).toBe(true);
      expect(fn('123', 'string')).toBe(true);

      expect(fn({}, 'object')).toBe(true);
      expect(fn({a: 'aaa'}, 'object')).toBe(true);

      expect(fn([], 'array')).toBe(true);
      expect(fn([1,2,true], 'array')).toBe(true);

      expect(fn(function(){}, 'function')).toBe(true);
      expect(fn(args, 'arguments')).toBe(true);

      expect(fn(true, 'boolean')).toBe(true);
      expect(fn(false, 'boolean')).toBe(false); // 返回的是参数的值，所以是 false
      expect(fn(null, 'null')).toBe(false);
    });


    it('扩展的Number类型检查', function() {
      expect(fn(true, 123, 'positive')).toBe('positive123');
      expect(fn(true, -123, 'negative')).toBe('negative-123');
      expect(fn(true, 0, 'nature')).toBe('nature0');
    });

    it('类型的别名检查', function() {
      expect(fn('alias', true, 'bool')).toBe(true);
    });

  });

  describe('测试自定义新的参数类型', function() {

    // 新的类型只包含两个字符串
    def.type('foo', function(mix) {
      return (mix === 'foo' || mix === 'bar');
    });

    var fn = def(function(self) {
      /**
       * @rule (foo x) -> *
       */
      return self.x;
    });

    it('是自定义的可以正常工作', function() {
      expect(fn('foo')).toBe('foo');
      expect(fn('bar')).toBe('bar');
    });

    it('不是自定义的抛出异常', function() {
      expect(function() { fn('xx'); }).toThrow();
    });

    it('可以删除自定义的类型', function() {
      expect(def.unType).toBe(def.untype);
      def.unType('foo');
      expect(function() { fn('foo'); }).toThrow();
    })

  });


  describe('测试配置项', function() {

    it('def.config', function() {
      def.config('applySelf', true);
      expect(def.config('applySelf')).toBe(true);
      def.config('applySelf', false);

      expect(def.config('not_exists_key')).toBeUndefined();
    });

    it('applySelf', function() {
      var fn = def(function(str) {
        /**
         * @options {applySelf: true}
         * @rule (string str) -> *
         */
        return (str === this.str && str === 'ha');
      });

      expect(fn('ha')).toBe(true);


      def.config('applySelf', true);
      fn = def(function(str) {
        /**
         * @rule (string str) -> *
         */
        return (str === this.str && str === 'ha');
      });
      expect(fn('ha')).toBe(true);
      def.config('applySelf', false);

    });
  });



  describe('其它功能项测试', function() {

    it('没有定义任何rule时应该报错', function(){
      expect(function(){
        def(function() {});
      }).toThrow();
    });

    it('参数变量名相同时应该抛出异常', function() {
      expect(function() {
        def(function() {
          /**
           * @rule (string a, bool a) -> *
           */
        })
      }).toThrow();
    });

  });

});

