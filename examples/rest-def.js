module.exports = function(def, assert) {

  var sum = def(function(self) {
    /**
     * @rules ( int ...all ) -> int
     */

    return self.all.reduce(function(prev, curr) {
      return prev + curr;
    }, 0);
  });


  assert.equal(sum(1, 2, 3), 6);
  assert.equal(sum(1), 1);
  assert.equal(sum(-1, 0, 1, 100), 100);


  var concat = def(function(self) {
    /**
     * @rules ( array to = <[]>, * ...others ) -> array
     */

    return self.to.concat(self.others);
  });

  assert.deepEqual(concat([], 1, 2, 3), [1, 2, 3]);
  assert.deepEqual(concat([], 'a', true), ['a', true]);
  assert.deepEqual(concat([], 1), [1]);


  var fn = def(function() {
    /**
     * @options { applySelf: true }
     * @rules ( int a, int ...b, string c ) -> string
     */
    return this.a + this.b.join('') + this.c;
  });

  assert.deepEqual(fn(1, 2, 3, 'a'), '123a');
  assert.throws(function() { fn(1, 'a'); });

};