
var def = require('../src/full'),
  assert = require('should');

describe('defFull', function() {

  context('match any thing', function() {
    var fn;

    before(function() {
      fn = def(function(self) {
        /**
         * @rules '(* any) -> *'
         */
        return self.any;
      });
    });

    it('should throws when no arguments', function() {
      assert.throws(fn, /Not found rule/);
    });

    it('should return back', function() {
      assert.equal(fn(1), 1);
      assert.equal(fn(true), true);
      assert.equal(fn(null), null);
      assert.deepEqual(fn({}), {});
      assert.deepEqual(fn([]), []);
      assert.deepEqual(fn([1,2]), [1, 2]);
    });
  });

  context('default value', function() {

    var fn;
    before(function() {
      fn = def(function(self) {
        /**
         * @defaults a: aaa, b: 0
         * @rules ([string a = <s>,] [int b]) -> *
         */
        return self.a + self.b;
      });
    });

    it('should use default value', function() {
      fn().should.eql('s0');
    });

    it('should use user defined value', function() {
      fn('aa').should.eql('aa0');
      fn(1).should.eql('s1');
      fn('b', 1).should.eql('b1');
    });

    it('should throws when rules default value is not match it\'s type', function() {
      var fn = function() {
        def(function(){
          /**
           * @rules (string a = <123>) -> int
           */
        });
      };
      assert.throws(fn, /value is not type/);
    });

    it('defaults overwrite', function() {
      var f = def(function(self) {
        /**
         * @defaults {a: 'no_use'}
         * @defaults {a: 'doc', b: 'doc'}
         * @rules ([string a, string b = <args>]) -> *
         */
        return self.b === 'args' && self.a === 'doc';
      });

      f().should.eql(true);
    });

    it('defaults array', function() {
      fn = def(function(self) {
        /**
         * @rules ( [array a = <[1, 2, 3]>] ) -> string
         */
        return self.$get('a').join('');
      });

      fn().should.be.eql('123');
      fn([1,2]).should.be.eql('12');
    });

  });

  context('测试参数类型', function() {
    var fn;

    before(function() {
      fn  = def(function(self) {
        /**
         * @rules (number number, string type) -> *
         * @rules (string string, string type) -> *
         * @rules (object object, string type) -> *
         * @rules (array array, string type) -> *
         * @rules (function function, string type) -> *
         * @rules (arguments arguments, string type) -> *
         * @rules (boolean boolean, string type) -> *
         * @rules (null null, string type) -> *
         *
         *
         * @rules (bool isNumber, positive positive, string type) -> *
         * @rules (bool isNumber, negative negative, string type) -> *
         * @rules (bool isNumber, nature nature, string type) -> *
         * @rules (bool isNumber, int int, string type) -> *
         *
         *
         * @rules (string alias, bool bool, string type) -> *
         */
        if (self.isNumber === true) {
          return self.type + self[self.type];
        }

        return !!self[self.type];
      });
    });

    it('JS自带的类型检查', function() {
      var args = arguments;

      fn(123, 'number').should.eql(true);
      fn('123', 'string').should.eql(true);

      fn({}, 'object').should.eql(true);
      fn({a: 'aaa'}, 'object').should.eql(true);

      fn([], 'array').should.eql(true);
      fn([1,2,true], 'array').should.eql(true);

      fn(function(){}, 'function').should.eql(true);
      fn(args, 'arguments').should.eql(true);

      fn(true, 'boolean').should.eql(true);
      fn(false, 'boolean').should.eql(false); // 返回的是参数的值，所以是 false
      fn(null, 'null').should.eql(false);
    });


    it('扩展的Number类型检查', function() {
      fn(true, 123, 'positive').should.eql('positive123');
      fn(true, -123, 'negative').should.eql('negative-123');
      fn(true, 0, 'nature').should.eql('nature0');
    });

    it('类型的别名检查', function() {
      fn('alias', true, 'bool').should.eql(true);
    });

    it('整数的默认值可以正常解析', function() {
      var fn = def(function(self) {
        /**
         * @rules ([int a = <0>, int b = <1>, int c = <-1>]) -> int
         */
        return self.a === 0 && self.b === 1 && self.c === -1;
      });
      fn().should.eql(true);
    });
  });

  context('测试自定义新的参数类型', function() {
    var fn;
    before(function() {
      // 新的类型只包含两个字符串
      def.type('foo', function(mix) {
        return (mix === 'foo' || mix === 'bar');
      });

      fn = def(function(self) {
        /**
         * @rules (foo x) -> *
         */
        return self.x;
      });
    });
    after(function() {
      def.untype('foo');
    });

    it('是自定义的可以正常工作', function() {
      fn('foo').should.eql('foo');
      fn('bar').should.eql('bar');
    });

    it('不是自定义的抛出异常', function() {
      assert.throws(function() { fn('xx'); }, /Not found rule/);
    });

  });

  context('测试配置项', function() {

    it('def.option', function() {
      def.option('applySelf', true);
      def.option('applySelf').should.eql(true);
      def.option('applySelf', false);

      assert.equal(def.option('not_exists_key'), undefined);
      def.option('not_exists_key', 'a');
      assert.equal(def.option('not_exists_key'), 'a');
    });

    it('applySelf', function() {
      def.option('applySelf', false);
      var fn = def(function(str) {
        /**
         * @options {applySelf: true}
         * @rules (string str) -> *
         */
        return (str === this.$get('str') && str === 'ha' && this.$has('str'));
      });

      fn('ha').should.eql(true);
      // 定义在函数中的 options 无法修改全局的 options
      def.option('applySelf').should.eql(false);


      def.option('applySelf', true);
      fn = def(function(str) {
        /**
         * @rules (string str) -> *
         */
        return (str === this.str && str === 'ha');
      });
      fn('ha').should.eql(true);
      def.option('applySelf', false);

    });
  });

  context('其它功能项测试', function() {

    it('第一个参数不是函数时应该报错', function() {
      assert.throws(function() {def('aa');}, /should be function/);
    });

    it('没有定义任何rule时应该报错', function(){
      assert.throws(function() {def(function() {});}, /No rules/);
    });

    it('参数变量名相同时应该抛出异常', function() {
      assert.throws(function() {
        def(function() {
          /**
           * @rules (string a, bool a) -> *
           */
        });
      }, /Duplicate key/);
    });

  });

  context('test examples', function() {
    it('#random', function() {
      require('../examples/random')(def, assert);
    });
    it('#range', function() {
      require('../examples/range')(def, assert);
    });
  });
});
