module.exports = function(def, assert) {

  /**
   * 得到一个范围内的数字数组
   */
  var range = def(function() {
    /**
     * @defaults { start: 0, length: 10, step: 1 }
     * @rules () -> array
     * @rules (int start) -> array
     * @rules (int start, int length) -> array
     * @rules (int start, int length, int step) -> array
     */

    var i, result = [], count = 0;
    for (i = this.start; count < this.length; count++, i += this.step) {
      result.push(i);
    }
    return result;
  }, {"defaults":{"start":0,"length":10,"step":1},"rules":[["array",[],[[]]],["array",[["start","int"]],[[0]]],["array",[["start","int"],["length","int"]],[[0,1]]],["array",[["start","int"],["length","int"],["step","int"]],[[0,1,2]]]]});

  // Test

  // start: 0, length: 10, step: 1
  //assert.deepEqual(range(),         [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 'use default parameters');

  // start: 1, length: 10, step: 1
  assert.deepEqual(range(1),        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'set parameter start to 1');

  // start: 6, length: 2, step: 1
  //assert.deepEqual(range(6, 2),     [6, 7], 'set parameter start to 6, length to 2');

  // start: 2, length: 4, step: 2
  //assert.deepEqual(range(2, 4, 2),  [2, 4, 6, 8], 'set parameter start to 2, length to 4, step to 2');

};