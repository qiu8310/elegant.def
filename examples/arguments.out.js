module.exports = function(def, assert) {

  var argFn = def(function(a, b, c) {
    /**
     * @defaults { b: 10 }
     * @rule ([int a = 0, [int b]]) -> int
     */
    assert.ok(typeof c === 'undefined');
    return a + b;
  }, {"defaults":{"b":10},"rule":["([int a = 0, [int b]]) -> int"],"rules":[["int",[["a","int",0],["b","int"]],[[],[0],[0,1]]]],"arguments":["a","b","c"]});


  assert.equal(argFn(), 10);
  assert.equal(argFn(1), 11);
  assert.equal(argFn(1, 20), 21);
};