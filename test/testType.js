var type = require('../src/lib/type');
var assert = require('should');

describe('Type', function(t) {

  context('#is', function() {
    it('should return true', function() {
      type.is(1, 'int').should.eql(true);
      type.is(1, 'integer').should.eql(true);
      type.is(0, 'nature').should.eql(true);
      type.is(1, 'positive').should.eql(true);
      type.is(-1, 'negative').should.eql(true);
      type.is(0.1, 'number').should.eql(true);
      type.is([], 'Array').should.eql(true);
      type.is('', 'String').should.eql(true);
      type.is('abc', 'String').should.eql(true);
      type.is(function() {}, 'function').should.eql(true);
      type.is(true, 'bool').should.eql(true);
      type.is(false, 'boolean').should.eql(true);
      type.is(false, '*').should.eql(true);
      type.is(1, '*').should.eql(true);
    });
    it('should return false', function() {
      type.is(1, 'string').should.eql(false);
      type.is(1, 'array').should.eql(false);
      type.is(1, 'function').should.eql(false);
      type.is(1, 'bool').should.eql(false);
      type.is(true, 'string').should.eql(false);
      type.is([], 'object').should.eql(false);
    });
    it('should throws when no type', function() {
      assert.throws(function() { type.is(1, 'start'); }, /not exists/);
    });
  });
  context('#has', function() {
    it('should return true when has specified type', function() {
      type.has('int').should.eql(true);
      type.has('integer').should.eql(true);
      type.has('string').should.eql(true);
      type.has('*').should.eql(true);
    });
    it('should return false when no specified type', function() {
      type.has('face').should.eql(false);
      type.has('are').should.eql(false);
    });

  });
  context('#type', function() {

    it('should add new type', function() {
      type.type('x', function(x) { return x === 'x'; });
      type.is('x', 'X').should.eql(true);
      type.is('xx', 'X').should.eql(false);
      type.has('x').should.eql(true);
      type.has('X').should.eql(true);
      type.unType('x');
    });

    it('should recover old system type', function() {

      type.unType('int');
      type.unType('integer');
      type.has('int').should.eql(false);
      type.has('integer').should.eql(false);

      type.type('int');
      type.has('int').should.eql(true);
      type.has('integer').should.eql(false);
      type.type('integer');
    });

    it('should throws when type exists', function() {
      assert.throws(function() { type.type('int', function() {}); }, /already exists/);
    });
  });

  context('#untype', function() {
    it('should untype system type', function() {
      type.unType('integer');
      type.has('integer').should.eql(false);
      type.type('integer');
    });

    it('should untype defined type', function() {
      type.type('y', function() {});
      type.has('y').should.eql(true);
      type.unType('y');
    });

    it('should throws when no type', function() {
      assert.throws(function() { type.untype('start'); }, /not exists/);
    });
  });

  context('#unType', function() {
    it('should be the alias of untype', function() {
      type.unType.should.eql(type.untype);
    });
  });

});
