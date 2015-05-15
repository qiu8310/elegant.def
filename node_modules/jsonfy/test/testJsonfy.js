'use strict';


/*
  ASSERT:
    ok(value, [message]) - Tests if value is a true value.
    equal(actual, expected, [message]) - Tests shallow, coercive equality with the equal comparison operator ( == ).
    notEqual(actual, expected, [message]) - Tests shallow, coercive non-equality with the not equal comparison operator ( != ).
    deepEqual(actual, expected, [message]) - Tests for deep equality.
    notDeepEqual(actual, expected, [message]) - Tests for any deep inequality.
    strictEqual(actual, expected, [message]) - Tests strict equality, as determined by the strict equality operator ( === )
    notStrictEqual(actual, expected, [message]) - Tests strict non-equality, as determined by the strict not equal operator ( !== )
    throws(block, [error], [message]) - Expects block to throw an error.
    doesNotThrow(block, [error], [message]) - Expects block not to throw an error.
    ifError(value) - Tests if value is not a false value, throws if it is a true value. Useful when testing the first argument, error in callbacks.

  SHOULD.JS:
    http://shouldjs.github.io/
*/

var jsonfy = require('../');
var should = require('should');
var assert = require('assert');

describe('jsonfy', function () {

  it('should throw error', function () {
    (function() {jsonfy()}).should.throw(Object, {message: 'Illegal input'});
    (function() {jsonfy([])}).should.throw(Object, {message: 'Illegal input'});
    (function() {jsonfy('"abc')}).should.throw(Object, {message: 'Bad string'});
    (function() {jsonfy('{abc}')}).should.throw(Object, {message: 'Expected ":" instead of "}"'});
    (function() {jsonfy('{abc:def,:}')}).should.throw(Object, {message: 'Empty key'});
    (function() {jsonfy('{abc:def,abc:hig}')}).should.throw(Object, {message: 'Duplicate key "abc"'});
    (function() {jsonfy('[ab,')}).should.throw(Object, {message: 'Bad array'});
    (function() {jsonfy('[ab]ab')}).should.throw(Object, {message: 'Syntax error'});
  });

  it('should transform simple string', function () {
    jsonfy('').should.equal('');
    jsonfy('abc').should.equal('abc');
    jsonfy('are you ok').should.equal('are you ok');
    jsonfy('"are\r\nyou"').should.equal('are\r\nyou');
    jsonfy('"are\f\b\tyou"').should.equal('are\f\b\tyou');
  });

  it('should transform unicode string', function () {
    jsonfy('"\\u4E2D\\u56FD"').should.equal('中国');
    jsonfy('"\u4E2D\u56FD"').should.equal('中国');
    jsonfy('\u4E2D\u56FD').should.equal('中国');
  });

  it('should transform numbers', function() {
    jsonfy('36').should.equal(36);
    jsonfy('0').should.equal(0);
    jsonfy('-1').should.equal(-1);
    jsonfy('3.68').should.equal(3.68);
    jsonfy('0.51').should.equal(0.51);
    jsonfy('.51').should.equal(0.51);
    jsonfy('-3.68').should.equal(-3.68);
    jsonfy('3.2e2').should.equal(320);
    jsonfy('3.2e-2').should.equal(0.032);
  });

  it('should transform illegal number to string', function() {
    jsonfy('00.51').should.equal('00.51');
    jsonfy('051').should.equal('051');
  });

  it('should transform literal value', function() {
    jsonfy('true').should.equal(true);
    jsonfy('false').should.equal(false);
    should.equal(jsonfy('null'), null);
    jsonfy('"false"').should.equal("false");
  });


  it('should transform arrays', function() {
    jsonfy('[ ]').should.be.instanceof(Array).and.have.lengthOf(0);
    should.deepEqual(jsonfy('[a, b]'), ['a', 'b']);
    should.deepEqual(jsonfy('[a, 1, 2.3, "56"]'), ['a', 1, 2.3, '56']);
  });


  it('should transform objects', function() {
    should.deepEqual(jsonfy('{ }'), {});
    should.deepEqual(jsonfy('{a b: a b }'), {'a b': 'a b'});
  });

  it('should transform complex objects', function() {
    should.deepEqual(jsonfy(
        '{a:a,b:b,c:123,d:[1,2,3],e:{ee:true,eee:false}}'),
      {a: 'a', b: 'b', c: 123, d: [1,2,3], e: {ee: true, eee: false}}
    );
    should.deepEqual(jsonfy(
      '[a, true, 1e2, {a:a,b:b}]'),
      ['a', true, 100, {a: 'a', b: 'b'}]
    );
  })

});
