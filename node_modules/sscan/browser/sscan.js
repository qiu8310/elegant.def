/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * sscan
	 * https://github.com/qiu8310/sscan
	 *
	 * Copyright (c) 2015 Zhonglei Qiu
	 * Licensed under the MIT license.
	 */


	'use strict';

	(function(global, undef) {
	  /**
	   * One character
	   *
	   * @typedef {String} Char
	   */

	  /**
	   * Character matcher
	   *
	   * @typedef {String|Function|RegExp} CharMatcher
	   */

	  var rWhite = /\s/,
	    rWord = /\w/,

	    quoteModes = {
	      all: {'"': 1, '\'': 1, match: '"\''},
	      single: {'\'': 1, match: '\''},
	      double: {'"': 1, match: '"'},
	      none: {match: ''}
	    },

	    /**
	     * If the character match the charMatcher
	     *
	     * @param {Char} ch
	     * @param {CharMatcher} charMatcher
	     * @returns {Boolean}
	     * @private
	     * @throws {Error} Will throw an error if charMatcher is not a valid CharMatcher.
	     */
	    match = function(ch, charMatcher) {
	      var type = typeof charMatcher;
	      if (type === 'string') {
	        return charMatcher.indexOf(ch) >= 0;
	      } else if (type === 'function') {
	        return charMatcher(ch);
	      } else if (charMatcher instanceof RegExp) {
	        return charMatcher.test(ch);
	      } else {
	        throw new Error('Character matcher "' + charMatcher + '" not acceptable.');
	      }
	    };


	  /**
	   * Scanner constructor
	   *
	   * @param {String} str
	   * @constructor
	   */
	  function Scanner(str) {
	    /**
	     * Original str
	     * @type {String}
	     */
	    this.str = str;

	    /**
	     * Current scan position
	     * @type {Number}
	     */
	    this.pos = 0;

	    /**
	     * Original str length
	     * @type {Number}
	     */
	    this.len = str.length;

	    ///**
	    // * Last matched string
	    // * @type {Object}
	    // */
	    //this.lastMatch = {
	    //  reset: function() {
	    //    this.str = null;
	    //    this.captures = [];
	    //    return this;
	    //  }
	    //}.reset();
	  }

	  Scanner.prototype = {
	    /**
	     * If is the begin of string.
	     * @returns {Boolean}
	     */
	    bos: function() {
	      return this.pos === 0;
	    },

	    /**
	     * If is the end of string.
	     * @param {CharMatcher} [acceptableMatcher]
	     * @returns {Boolean}
	     */
	    eos: function(acceptableMatcher) {
	      if (acceptableMatcher) {
	        var i, rest = this.peekRest();
	        for (i = 0; i < rest.length; i++) {
	          if (!match(rest.charAt(i), acceptableMatcher)) { return false; }
	        }
	        return true;
	      }
	      return this.pos === this.len;
	    },

	    /**
	     * Reset the position.
	     */
	    reset: function() {
	      this.pos = 0;
	    },

	    /**
	     * Throw a SyntaxError.
	     *
	     * @param {String} tpl
	     * @param {String} args...
	     * @private
	     */
	    _syntaxError: function(tpl, args) {
	      args = [].slice.call(arguments, 1);
	      tpl = tpl.replace(/%s/g, function() {
	        return '{{ ' + args.shift() + ' }}';
	      });
	      var err = new SyntaxError(tpl);
	      err.pos = this.pos;
	      err.str = this.str;
	      throw err;
	    },

	    /**
	     * Get current character.
	     * @returns {Char}
	     */
	    char: function() {
	      return this.str.charAt(this.pos);
	    },

	    /**
	     * If current character match the charMatcher.
	     * @param {CharMatcher} charMatcher
	     * @returns {Boolean}
	     */
	    isChar: function(charMatcher) {
	      return match(this.char(), charMatcher);
	    },

	    /**
	     * Get next character
	     * @param {CharMatcher} [charMatcher]
	     * @returns {Char}
	     * @throws {Error} Will throws if already in the end.
	     * @throws {SyntaxError} Will throws if matcher doesn't match current character.
	     */
	    next: function(charMatcher) {
	      if (charMatcher !== undef && !match(this.char(), charMatcher)) {
	        this._syntaxError('Expect %s, but got %s.', charMatcher, this.char());
	      }
	      if (this.eos()) {
	        throw new Error('EOS');
	      }
	      this.pos++;
	      return this.char();
	    },

	    /**
	     * Take next part string that match the charMatcher, can be empty
	     * @param {CharMatcher} charMatcher
	     * @returns {String}
	     */
	    take: function(charMatcher) {
	      var ch = this.char(), res = '';
	      while (match(ch, charMatcher) && !this.eos()) {
	        res += ch;
	        ch = this.next();
	      }
	      return res;
	    },

	    /**
	     * Take the next word.
	     * @returns {String}
	     */
	    takeWord: function() {
	      var word = this.take(rWord);
	      if (!word) {
	        this._syntaxError('Empty string is not a valid word.');
	      }
	      return word;
	    },

	    /**
	     * Take quotes, object and array.
	     * @param {String} [quoteMode='all'] - single, double, all
	     */
	    takeValue: function(quoteMode) {
	      var ch = this.char();
	      if (ch === '[') {
	        return this.takeArray(quoteMode);
	      } else if (ch === '{') {
	        return this.takeObject(quoteMode);
	      } else if (ch === '"' || ch === '\'') {
	        return this.takeQuote(quoteMode);
	      } else {
	        this._syntaxError('Not a valid value.');
	      }
	    },

	    /**
	     * Take quoted characters.
	     * @param {String} [quoteMode='all'] - single, double, all
	     */
	    takeQuote: function(quoteMode) {
	      var quotes = quoteModes[quoteMode] || quoteModes.all;
	      var lastQuote = this.char();
	      var result = lastQuote, ch = this.next(quotes.match);

	      while (lastQuote) {
	        if (ch === lastQuote) {
	          lastQuote = null;
	        }
	        result += ch;
	        ch = this.next();
	      }

	      return result;
	    },

	    /**
	     * Take pair things, line {...}, [...]
	     *
	     * @param {Char} left
	     * @param {Char} right
	     * @param {String} [quoteMode='all'] - single, double, all, none
	     */
	    takePair: function(left, right, quoteMode) {
	      var ch = this.next(left);
	      var count = 1, result = left;
	      var quotes = quoteModes[quoteMode] || quoteModes.all;

	      while (count !== 0) {
	        count += left === ch ? 1 : (right === ch ? -1 : 0);

	        if (quotes[ch]) {
	          result += this.takeQuote(quoteMode);
	          ch = this.char();
	        } else {
	          result += ch;
	          ch = this.next();
	        }
	      }
	      return result;
	    },

	    /**
	     * Take javascript object
	     * @param {String} [quoteMode='all']
	     */
	    takeObject: function(quoteMode) {
	      return this.takePair('{', '}', quoteMode);
	    },

	    /**
	     * Take javascript array
	     * @param {String} [quoteMode='all']
	     */
	    takeArray: function(quoteMode) {
	      return this.takePair('[', ']', quoteMode);
	    },

	    /**
	     * Proceed till character match the endMatcher,
	     * if acceptMatcher supplied, then all mid characters should match the acceptMatcher.
	     *
	     * @param {CharMatcher} [acceptMatcher]
	     * @param {CharMatcher} endMatcher
	     * @param {Function} [eosFn]
	     */
	    till: function(acceptMatcher, endMatcher, eosFn) {

	      var args = [].slice.call(arguments);
	      if (args.length === 1) {
	        endMatcher = acceptMatcher;
	        acceptMatcher = eosFn = null;
	      } else if (args.length === 2) {
	        if (typeof args[1] === 'function') {
	          eosFn = args[1];
	          endMatcher = args[0];
	          acceptMatcher = null;
	        }
	      }

	      var ch = this.char();
	      var pass = '';
	      while (!match(ch, endMatcher) && !this.eos()) {
	        if (acceptMatcher && !match(ch, acceptMatcher)) {
	          this._syntaxError('Expect %s, but got %s.', acceptMatcher, ch);
	        }
	        pass += ch;
	        ch = this.next();
	      }
	      if (this.eos() && eosFn) { eosFn(pass); }
	      return pass;
	    },


	    /**
	     *  Peek next one or specified length
	     */
	    peek: function(len) {
	      return this.str.substr(this.pos + 1, len || 1);
	    },

	    /**
	     * Get peek of the rest string.
	     *
	     * @returns {String}
	     */
	    peekRest: function() {
	      return this.str.substr(this.pos);
	    },

	    /**
	     * Take in all next white spaces.
	     */
	    white: function() {
	      return this.take(rWhite);
	    }
	  };

	  /**
	   * @param {String} str
	   * @param {Function} [fn]
	   * @returns {*}
	   */
	  function sscan(str, fn) {
	    var scanner = new Scanner(str);
	    if (typeof fn === 'function') {
	      var done = function() { throw {scanDone: true} };
	      try {
	        while (true) { fn.call(scanner, done); }
	      } catch (e) {
	        if (!e.scanDone) { throw e; }
	      }
	    }
	    return scanner;
	  }

	  sscan.Scanner = Scanner;

	  // Export to window and node
	  global.sscan = sscan;
	  module.exports = sscan;

	})(this);


/***/ }
/******/ ]);