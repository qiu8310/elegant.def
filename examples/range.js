module.exports = function(def, assert) {

  /**
   * 得到一个范围内的数字数组
   */
  var range = def(function(self) {
    /**
     * @options { applySelf: false }
     * @defaults { start: 0, length: 10, step: 1 }
     * @rules () -> array
     * @rules (int start) -> array
     * @rules (int start, int length) -> array
     * @rules (int start, int length, int step) -> array
     */

    var i, result = [], count = 0;
    for (i = self.start; count < self.length; count++, i += self.step) {
      result.push(i);
    }

    return result;
  });

  // Test

  // start: 0, length: 10, step: 1
  assert.deepEqual(range(),         [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  // start: 1, length: 10, step: 1
  assert.deepEqual(range(1),        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  // start: 6, length: 2, step: 1
  assert.deepEqual(range(6, 2),     [6, 7]);

  // start: 2, length: 4, step: 2
  assert.deepEqual(range(2, 4, 2),  [2, 4, 6, 8]);

};