module.exports = function(def, assert) {

  /**
   * 得到一个范围内的数字数组
   */
  var random = def(function() {
    /**
     * @defaults { max: 10 }
     * @rules ([int min = 0, [int max]]) -> int
     */
    if (this.min > this.max) { throw new Error(); }
    return this.min + Math.floor(Math.random() * (this.max - this.min + 1))
  }, {"defaults":{"max":10},"rules":[["int",[["min","int",0],["max","int"]],[[],[0],[0,1]]]]});

  // Test
  for (var r, i = 0; i < 10; i++) {
    // 如果不带任何参数，则会返回一个 0 到 10 之间（包括 0 和 10 的数）
    r = random();
    assert.ok(r >= 0 && r <= 10, r + ' should between 0 to 10');

    // 如果指定第一个参数为 9，则最小值为 9，最大值还是默认的 10
    r = random(9);
    assert.ok(r >= 9 && r <= 10, r + ' should between 9 to 10');

    // 如果同时指定两个参数，则一个是最小值，另一个是最大值
    r = random(9, 11);
    assert.ok(r >= 9 && r <= 11, r + ' should between 9 to 11');

    // 如果两个参数相等，则始终返回的是这个相等的参数
    r = random(2, 2);
    assert.ok(r === 2 , r + ' should equal 2');
    r = random(0, 0);
    assert.ok(r === 0 , r + ' should equal 0');

    // 如果第 1 个参数大于第 2 个参数，则抛出异常
    assert.throws(function() { random(10, 3); });

  }
};