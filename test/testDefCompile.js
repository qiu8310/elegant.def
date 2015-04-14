var compile = require('../src/compile'),
  fs = require('fs'),
  assert = require('should');

describe('defCompile', function() {
  context('examples', function() {

    var helper;
    before(function() {
      helper = function(key) {
        var inCont = fs.readFileSync('examples/' + key + '.js').toString();
        var outCont = fs.readFileSync('examples/' + key + '.out.js').toString();
        assert.ok(compile(inCont) === outCont);
      };
    });

    it('#random', function() { helper('random'); });
    it('#range', function() { helper('range'); });

  });
});
