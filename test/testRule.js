var Rule = require('../src/lib/rule');
var assert = require('should');

describe('Rule', function() {

  context('#parse', function() {
    it('should parse return type', function() {
      Rule.parse('(* a) -> string').returnType.should.eql('string');
      Rule.parse('(* a) -> *').returnType.should.eql('*');
      Rule.parse('(* a) -> array').returnType.should.eql('array');

      assert.throws(function() { Rule.parse('(*) -> '); }, /defined error/);
      assert.throws(function() { Rule.parse('(*) string'); }, /defined error/);
    });

    it('should parse param type', function() {
      Rule.parse('(* a) -> *').params[0].type.should.eql('*');
      Rule.parse('(int a) -> *').params[0].type.should.eql('int');
      Rule.parse('(int a, double b) -> *').params[1].type.should.eql('double');
    });

    it('should parse param default value', function() {
      Rule.parse('(int a = 123) -> *').params[0].val.should.eql(123);
      Rule.parse('(string a = "123") -> *').params[0].val.should.eql('123');
      Rule.parse('(string a = "123", bool b = true) -> *').params[1].val.should.eql(true);

      assert.throws(function() { Rule.parse('(int a = [a,b) -> *'); }, /Parse rule arguments error/);
    });

    it('should parse optional params', function() {
      assert.deepEqual(Rule.parse('() -> *').roads, [[]]);
      assert.deepEqual(Rule.parse('(int a, [int b]) -> *').roads, [[0], [0, 1]]);
      assert.deepEqual(Rule.parse('([[int a], int b]) -> *').roads, [[], [1], [0, 1]]);
      assert.deepEqual(Rule.parse('([[int a], int b], int c) -> *').roads.length, 3);

      assert.throws(function() { Rule.parse('(int a, [int b) -> *'); }, /not paired/);
    });
  });

  context('#match', function() {
    var parsed = Rule.parse('(int a, [string b = "3"]) -> *');
    it('should return matched args', function() {
      assert.deepEqual(Rule.match(parsed, [1]), {a: 1});
      assert.deepEqual(Rule.match(parsed, [1, '34']), {a: 1, b: '34'});
    });

    it('should return false when no matched', function() {
      Rule.match(parsed, []).should.eql(false);
      Rule.match(parsed, [true]).should.eql(false);
      Rule.match(parsed, ['34']).should.eql(false);
      Rule.match(parsed, ['34', 1]).should.eql(false);
      Rule.match(parsed, ['34', 1, 3]).should.eql(false);
    });
  });

  context('#compress and #decompress', function() {
    it('should compress and decompress', function() {
      var rule = Rule.parse('(int a, int b = 1) -> int');
      var compressedRule = Rule.compress(rule);

      assert.deepEqual(Rule.decompress(compressedRule), rule);
    });
  });
});
