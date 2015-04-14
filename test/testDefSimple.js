var def = require('../src/simple'),
  assert = require('should');

describe('defSimple', function() {
  context('examples', function() {

    it('#random', function() { require('../examples/random.out')(def, assert); });
    it('#range', function() { require('../examples/range.out')(def, assert); });

  });
});
