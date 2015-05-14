module.exports = function(def, assert) {

  var argFn = def(function(a, b, c) {
    /**
     *
     * 这里是函数描述
     *
     * @name argFn some other thing
     * @alias xx
     * @defaults { b: 10 }
     * @rule ([int a = 0, [int b]]) -> int
     *
     * @example argFn(); // => 10
     *
     * @example
     * argFn(1, 20); // => 21
     */
    assert.ok(typeof c === 'undefined');
    return a + b;
  });


  assert.equal(argFn(), 10);
  assert.equal(argFn(1), 11);
  assert.equal(argFn(1, 20), 21);
};