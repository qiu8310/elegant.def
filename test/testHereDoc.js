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

  context('#parse', function() {
    var doc = HereDoc.getFromFunc(function() {
      /**
       * @a Are
       * @a you
       * WTF
       * @a ok?
       * @b Baby
       * yes
       * @c 123
       * @d {a: aa, b: true, c: [1,2,3]}
       * @d d: 4
       * no
       */
    });

    it('should parse all param which prefix with @', function() {

      assert.deepEqual(HereDoc.parse(doc), {
        a: ['Are', 'you', 'ok?'],
        b: ['Baby'],
        c: ['123'],
        d: ['{a: aa, b: true, c: [1,2,3]}', 'd: 4']
      });
    });

    it('should only parse specified param', function() {
      assert.deepEqual(HereDoc.parse(doc, ['a', 'b']), {
        a: ['Are', 'you', 'ok?'],
        b: ['Baby']
      });

      assert.deepEqual(HereDoc.parse(doc, 'b'), {
        b: ['Baby']
      });
    });

    it('should parse param to specified type', function() {
      assert.deepEqual(HereDoc.parse(doc, {a: String}), {a: 'ok?'});
      assert.deepEqual(HereDoc.parse(doc, {a: Array}), {a: ['Are', 'you', 'ok?']});
      assert.throws(function() { HereDoc.parse(doc, {a: Object}); });

      assert.deepEqual(HereDoc.parse(doc, {d: Object}), {
        d: { a: 'aa', b: true, c: [1,2,3], d: 4 }
      });
    });
  });
});
