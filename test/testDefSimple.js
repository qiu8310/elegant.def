var def = require('../src/simple'),
  assert = require('should');

describe('defSimple', function() {
  context('examples', function() {

    var helper, keys;
    keys = require('../examples/meta');
    helper = function(key) {
      require('../examples/' + key + '.out')(def, assert);
    };

    keys.forEach(function(key) {
      it('#' + key, function() { helper(key); });
    });
  });
});
