'use strict';


/*
  ASSERT:
    ok(value, [message]) - Tests if value is a true value.
    equal(actual, expected, [message]) - Tests shallow, coercive equality with the equal comparison operator ( == ).
    notEqual(actual, expected, [message]) - Tests shallow, coercive non-equality with the not equal comparison operator ( != ).
    deepEqual(actual, expected, [message]) - Tests for deep equality.
    notDeepEqual(actual, expected, [message]) - Tests for any deep inequality.
    strictEqual(actual, expected, [message]) - Tests strict equality, as determined by the strict equality operator ( === )
    notStrictEqual(actual, expected, [message]) - Tests strict non-equality, as determined by the strict not equal operator ( !== )
    throws(block, [error], [message]) - Expects block to throw an error.
    doesNotThrow(block, [error], [message]) - Expects block not to throw an error.
    ifError(value) - Tests if value is not a false value, throws if it is a true value. Useful when testing the first argument, error in callbacks.

  SHOULD.JS:
    http://shouldjs.github.io/

  Some test frameworks:
    sinon:  function spy
    nock: mock http request
    supertest: test http server
    rewire: modify the behaviour of a module such that you can easily inject mocks and manipulate private variables

  More on http://www.clock.co.uk/blog/tools-for-unit-testing-and-quality-assurance-in-node-js
*/

var sscan = require('../');
var assert = require('should');
var Scanner = sscan.Scanner;
var s, str;

describe('Scanner', function () {

  beforeEach(function() {
    str = ' hello(\tworld ) ';
    s = new Scanner(str);
  });

  context('#isChar( charMatcher )', function() {
    it('should accept String, RegExp and Function argument', function() {
      s = new Scanner('a()b');
      s.isChar('a').should.eql(true);
      s.isChar('b').should.eql(false);
      s.isChar(/a/).should.eql(true);
      s.next();
      s.isChar('()').should.eql(true);
      s.isChar(function(c) { return c === '(' }).should.eql(true);
      s.isChar(function(c) { return c === ')' }).should.eql(false);

    });

    it('should throws when argument type not acceptable', function() {
      s = new Scanner('');
      (function() {s.isChar(123); }).should.throw('Character matcher "123" not acceptable.');
    });
  });

  context('#bos( )', function() {
    it('should be true when first init', function() {
      [new Scanner(''), new Scanner('abc')].forEach(function(s) {
        s.bos().should.eql(true);
      });
    });

    it('should not be true when polluted', function() {
      [new Scanner('dd'), new Scanner('abc')].forEach(function(s) {
        s.next();
        s.bos().should.eql(false);
      });
    });

    it('should be true when after reset', function() {
      [new Scanner('dd'), new Scanner('abc')].forEach(function(s) {
        s.next();
        s.reset();
        s.bos().should.eql(true);
      });
    });
  });

  context('#eos( )', function() {
    it('should not be true when not to end', function() {
      [new Scanner('dd'), new Scanner('abc')].forEach(function(s) {
        s.next();
        s.eos().should.eql(false);
      });
    });

    it('should be true when got end', function() {
      [new Scanner(''), new Scanner('a'), new Scanner('ab')].forEach(function(s, i) {
        while (i) {
          i--;
          s.next();
        }
        s.eos().should.eql(true);
      });
    });

    it('should take acceptable matcher', function() {
      s = new Scanner('abc');
      s.eos('abc').should.eql(true);
      s.eos(/[abc]/).should.eql(true);
      s.eos(function(c) {
        return c === 'a' || c === 'b' || c === 'c';
      }).should.eql(true);

      s.eos('ac').should.eql(false);
      s.eos(/[bc]/).should.eql(false);
      s.eos(function(c) {
        return c === 'a' || c === 'b';
      }).should.eql(false);

    });
  });

  context('#next( [charMatcher] )', function() {
    it('should throw when not match charMatcher', function() {
      (function() { s.next('hello'); }).should.throw(/Expect .*?, but got .*?/);
      (function() { s.next(/abc/); }).should.throw(/Expect .*?, but got .*?/);
      (function() { s.next(/\s/); }).should.not.throw();
    });

    it('should throw when got end', function() {
      s.take(/./);
      (function() {s.next(); }).should.throw('EOS');
    });
  });

  context('#reset( )', function() {
    it('should reset position', function() {
      s = new Scanner('abc');
      s.next();
      s.pos.should.eql(1);
      s.reset();
      s.pos.should.eql(0);
    });
  });

  context('#white( )', function() {
    it('should take all the next white space', function() {
      s.white().should.eql(' ');
      s.white().should.eql('');
      s.takeWord();
      s.next();
      s.white().should.eql('\t');
    });
  });

  context('#peek( [length] )', function() {
    it('should return the next length string', function() {
      s = new Scanner('ab de');
      s.peek().should.eql('b');
      s.peek(2).should.eql('b ');
      s.peek(3).should.eql('b d');
      s.peek(20).should.eql('b de');
      s.takeWord();
      s.peek().should.eql('d');
      s.next();
      s.takeWord();
      s.peek().should.eql('');
    });
  });

  context('#peekRest( )', function() {
    it('should return the rest string', function() {
      s = new Scanner('ab de');
      s.peekRest().should.eql('ab de');
      s.takeWord();
      s.peekRest().should.eql(' de');
    });
  });

  context('#take( charMatcher )', function() {
    it('should return empty when found nothing', function() {
      s.take('xyz').should.eql('');
      s.take(/abc/).should.eql('');
    });
    it('should take specified character', function() {
      s.take(/\s/).should.eql(' ');
      s.take(/[\seh]/).should.eql('he');
    });
    it('should return all rest string when matched all', function() {
      s.take(/./).should.eql(str);
      s.reset();
      s.take(str).should.eql(str);
      s.reset();
      s.take(function() { return true; }).should.eql(str);
    });
  });

  context('#takeWord( )', function() {
    it('should throw when not match a word', function() {
      (function() { s.takeWord(); }).should.throw('Empty string is not a valid word.')
    });
    it('should take the word', function() {
      s.next();
      s.takeWord().should.eql('hello');
    });
  });

  context('#takeQuote( [quoteMode] )', function() {
    it('should throw when no quote', function() {
      (function() { s.takeQuote(); }).should.throw();
    });

    it('should take single quote', function() {
      s = new Scanner('a\'abc\'');
      (function() { s.takeQuote(); }).should.throw();
      s.next();
      (function() { s.takeQuote('double'); }).should.throw();
      (function() { s.takeQuote('none'); }).should.throw();
      s.takeQuote('single').should.eql('\'abc\'');
    });

    it('should take double quote', function() {
      s = new Scanner('"abc"');
      (function() { s.takeQuote('single'); }).should.throw();
      (function() { s.takeQuote('none'); }).should.throw();
      s.takeQuote('double').should.eql('"abc"');
    });
    it('should take single and double quote', function() {
      s = new Scanner('"abc"');
      (function() { s.takeQuote('all'); }).should.not.throw();
      s = new Scanner('\'abc\'');
      (function() { s.takeQuote('all'); }).should.not.throw();
    });

  });

  context('#takePair( left, right [, quoteMode] )', function() {
    it('should take paired string', function() {
      s = new Scanner('<abc>');
      s.takePair('<', '>').should.eql('<abc>');
      s = new Scanner('<>');
      s.takePair('<', '>').should.eql('<>');
    });
    it('should take deep paired string', function() {
      s = new Scanner('<a<<b>c>>');
      s.takePair('<', '>').should.eql('<a<<b>c>>');
    });
    it('should take quote inside paired string', function() {
      s = new Scanner('<"<",ad>');
      s.takePair('<', '>').should.eql('<"<",ad>');
    });
    it('should throws', function() {
      (function() { (new Scanner('<')).takePair('<', '>'); }).should.throw('EOS');
      (function() { (new Scanner('<<<>>')).takePair('<', '>'); }).should.throw('EOS');
      (function() { (new Scanner('<"<">')).takePair('<', '>', 'none'); }).should.throw('EOS');
    });
  });
  context('#takeObject( [quoteMode] )', function() {
    (new Scanner('{}').takeObject()).should.eql('{}');
    (new Scanner('{abc}').takeObject()).should.eql('{abc}');
    (new Scanner('{a{b}c}').takeObject()).should.eql('{a{b}c}');
    (function() {new Scanner('{a{bc}').takeObject()}).should.throw('EOS');
  });
  context('#takeArray( [quoteMode] )', function() {
    (new Scanner('[]')).takeArray().should.eql('[]');
    (new Scanner('[abc]')).takeArray().should.eql('[abc]');
    (new Scanner('[a[b]c]')).takeArray().should.eql('[a[b]c]');
    (function() {new Scanner('[a[bc]').takeArray()}).should.throw('EOS');
  });

  context('#takeValue', function() {
    it('should take object', function() {
      (new Scanner('{}z').takeValue()).should.eql('{}');
    });
    it('should take array', function() {
      (new Scanner('[]y').takeValue()).should.eql('[]');
    });
    it('should take quote', function() {
      (new Scanner('""x').takeValue()).should.eql('""');
    });
    it('should throws', function() {
      (function() { new Scanner('abc').takeValue() }).should.throw('Not a valid value.');
    });
  });

  context('#till([acceptMatcher,] endMatcher [, eosFn])', function() {
    it('endMatcher', function() {
      s.till('l').should.eql(' he');
      s.reset();
      s.till('z').should.eql(str);
    });
    it('endMatcher, eosFn', function() {
      s = new Scanner('abc');
      var rtn = s.till('d', function(re) {
        re.should.eql('abc');
      });
      rtn.should.eql('abc');

      s.reset();
      rtn = s.till('b', function() {});
      rtn.should.eql('a');
    });
    it('acceptMatcher, endMatcher', function() {
      s.till(/./, 'l').should.eql(' he');
      s.reset();
      s.till(/[\seh]/, 'l').should.eql(' he');
      s.reset();
      (function() {s.till('x', 'l');}).should.throw('Expect {{ x }}, but got {{   }}.');
    });
    it('acceptMatcher, endMatcher, eosFn', function() {
      s.till(/./, ')', function() {}).should.eql(' hello(\tworld ');
    });
  });
});

describe('sscan', function() {
  context('with callback', function() {
    it('should get result from return', function() {
      var result = '';
      sscan('a"b"c', function(done) {
        var ch = this.char();
        if (this.eos()) { return done(); }

        if (this.isChar('"')) {
          this.takeQuote();
          ch = this.char();
        }
        result += ch;
        ch = this.next();
      });
      result.should.eql('ac');
    });

    it('should throws', function() {
      (function() {
        sscan('a', function() {
          throw new Error('abc');
        });
      }).should.throw('abc');
    });
  });

  context('without callback', function() {
    it ('should return Scanner', function() {
      s = sscan('abc');
      s.should.instanceof(Scanner);
    });
  });
});
