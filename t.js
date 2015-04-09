var random = def(function () {
  /**
   * 设置默认的参数
   * @defaults {min: 1, max: 3, pool: '0'}
   *
   * @options {foo: true}
   *
   * 指定调用函数的参数的规则
   * @rule ( [string pool = '1',] int min, int max ) -> string
   * @rule ( [string pool = '2',] int length ) -> string
   * @rule ( string pool ) -> string
   *
   * @return string
   */
  return Math.random();
});


/*
var random = def(
  function() {
    return Math.random();
  },
  {
    rules: ['([int min]) => double']
  }
)
*/


//var obj = {
//  foo: def(function() {
//    /**
//     * @rule (*) => string
//     *
//     * @test ('abc') => 'foo'
//     */
//    return 'foo';
//  })
//};
//
//obj.prototype.bar = def(function() {});

