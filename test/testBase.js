var base = require('../src/lib/base');
var assert = require('should');


describe('base', function() {

  it('#eachObj', function() {
    base.eachObj({a: 'aa', b: false}, function(val, key) {
      if (key === 'a') {
        val.should.eql('aa');
      }
      return val;
    });
  });

  it('#trim', function() {
    var old = String.prototype.trim;
    String.prototype.trim = null;

    base.trim(' \t\r\n ').should.eql('');
    base.trim(' abc').should.eql('abc');
    base.trim('12 ').should.eql('12');
    base.trim(' true ').should.eql('true');

    String.prototype.trim = old;
  });
  it('#map', function() {
    assert.deepEqual(base.map([1,2], function(i) { return i * i; }), [1, 4]);

    var old = Array.prototype.map;
    Array.prototype.map = null;

    assert.deepEqual(base.map([1,2], function(i) { return i * i; }), [1, 4]);

    Array.prototype.map = old;
  });
  it('#filter', function() {
    assert.deepEqual(base.filter([1,2], function(i) { return i % 2; }), [1]);

    var old = Array.prototype.filter;
    Array.prototype.filter = null;

    assert.deepEqual(base.filter([1,2], function(i) { return i % 2; }), [1]);

    Array.prototype.filter = old;
  });

  it('#arrify', function() {
    assert.deepEqual(base.arrify([1,2]), [1,2]);
    assert.deepEqual(base.arrify([1,2], 1), [2]);
  });

  it('#isNumerical', function() {
    base.isNumerical('-1.2').should.eql(true);
    base.isNumerical('00.2').should.eql(false);
    base.isNumerical('00').should.eql(false);
    base.isNumerical('0').should.eql(true);
    base.isNumerical('-a1.2').should.eql(false);
  });

  it('#merge', function() {
    assert.deepEqual(base.merge(false, false), {});
    assert.deepEqual(base.merge(null, {a: 1}, false), {a: 1});
  });

  it('#objectKeys', function() {
    var old = Object.keys;
    Object.keys = null;
    assert.deepEqual(base.objectKeys({a: 'a', b: 'b'}), ['a', 'b']);
    Object.keys = old;
  });
});
