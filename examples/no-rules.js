module.exports = function(def, assert) {

  var fn = function(a, b) {
    return a + b;
  };

  var outFn = def(fn);

  assert.equal(fn, outFn);
  assert.equal(outFn(1, 2), 3);
  assert.equal(outFn('a', '3'), 'a3');

};