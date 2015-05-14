var HereDoc = require('../src/lib/heredoc');
var assert = require('should');

describe('HereDoc', function() {

  context('#parseFunc', function() {
    it('should parse empty function name, and empty arguments', function() {
      assert.deepEqual(HereDoc.parseFunc(function() {}), {name: '', arguments: []});
    });

    it('should parse function name, and arguments', function() {
      assert.deepEqual(HereDoc.parseFunc(function tt ( a, b ) {}), {name: 'tt', arguments: ['a', 'b']});
    });
  });


  context('#getFromFunc', function() {

    it('should return false when no heredoc in function', function() {
      assert.equal(HereDoc.getFromFunc(function() {}), false);
      assert.equal(HereDoc.getFromFunc(function() {
        /*
         * no here doc
         */
      }), false);
    });

    it('should return heredoc in function', function() {
      assert.ok(HereDoc.getFromFunc(function() {
        /**
         * are
         */
      }).indexOf('* are') > 0);
    });

  });
});
