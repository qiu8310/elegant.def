module.exports = function(def, assert) {

  var outerFn = def(function(self) {
    /**
     * @rules ( int a ) -> int
     */

    var innerFn = def(function(self) {
      /**
       * @rules ( int a ) -> int
       */
      return self.a * self.a;
    });


    return innerFn(self.a);
  });


  assert.equal(outerFn(1), 1);
  assert.equal(outerFn(2), 4);
  assert.equal(outerFn(3), 9);

};