var test = require('tape'),
  full = require('../../src/full'),
  simple = require('../../src/simple');

test('simple def test', function (t) {
  require('../../examples/random.out')(simple, t);
  require('../../examples/range.out')(simple, t);
  t.end();
});

test('full def test', function(t) {
  require('../../examples/random')(full, t);
  require('../../examples/range')(full, t);
  t.end();
});