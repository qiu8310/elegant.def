module.exports = function(def, assert) {

  var argFn = def(function(a, b, c) {
    /**
     * @defaults { b: 10 }
     * @rule ([int a = 0, [int b]]) -> int
     */
    assert.ok(typeof c === 'undefined');
    return a + b;
  });


  assert.equal(argFn(), 10);
  assert.equal(argFn(1), 11);
  assert.equal(argFn(1, 20), 21);
};