module.exports = function(def, assert) {

  def(function(a, b, c) {
    /**
     *
     * @rule () -> int
     * @rule ([int a = 0, [int b]]) -> int
     * @rule () -> int
     */
    return a + b;
  });
};