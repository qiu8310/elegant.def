module.exports = function(def, assert) {

  var doubleInt = def(function() {
    /**
     * @rules (int a) -> int
     */
    return this.a + this.a;
  }, {"rules":[["int",[["a","int"]],[[0]]]]});

  var intToStr = def(function(self) {
    /**
     * @rules (int b) -> string
     */

    return self.b + '';
  }, {"rules":[["string",[["b","int"]],[[0]]]],"arguments":["self"]});


  assert.equal(doubleInt(0), 0);
  assert.equal(doubleInt(1), 2);
  assert.equal(doubleInt(-2), -4);

  assert.equal(intToStr(0), '0');
  assert.equal(intToStr(1), '1');
  assert.equal(intToStr(-2), '-2');
};