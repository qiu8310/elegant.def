/*
 * jsonfy
 * https://github.com/qiu8310/jsonfy"
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var jsonfy = (function() {

  var at,     // The index of the current character
    ch,     // The current character
    endChars = ':,}]',
    words = {'true': true, 'false': false, 'null': null},
    trim = function(str) { return str.replace(/^\s+|\s+$/g, ''); },
    escapee = {
      '"': '"',
      '\\': '\\',
      '/': '/',
      b: '\b',
      f: '\f',
      n: '\n',
      r: '\r',
      t: '\t'
    },
    text,
    value,  // Place holder for the value function.

    isNumerical = function (str) {
      if (str.charAt(0) === '-') { str = str.substr(1); }

      if (/^(?:\d*\.)?\d+(?:[eE][-+]?\d*)?$/.test(str)) {
        // 0056, 00.56, 56.00 也会符合正则的
        if (str.indexOf('.') >= 0) {
          // 如果小数的第一位是0，则第二位一定要是 . ； 而如果第一位不是 0，则不管 . 在第几位都有效
          return (str.charAt(0) !== '0') || (str.charAt(1) === '.');
        } else {
          return str === '0' || str.charAt(0) !== '0';
        }
      }
      return false;
    },

    error = function (m) {
      // Call error when something is wrong.
      throw {
        name: 'SyntaxError',
        message: m,
        at: at,
        text: text
      };
    },

    next = function (c) {

      // If a c parameter is provided, verify that it matches the current character.

      if (c && c !== ch) {
        error('Expected "' + c + '" instead of "' + ch + '"');
      }

      // Get the next character. When there are no more characters,
      // return the empty string.

      ch = text.charAt(at);
      at += 1;
      return ch;
    },

    string = function() {
      var hex,
        i,
        string = '',
        start = ch === '"' || ch === '\'' ? ch : '',
        uffff;

      // When parsing for string values, we must look for " and \ characters.

      if (start) { next(start); }

      while (ch) {
        if (start && ch === start) {
          next();
          return string;
        } else if (!start && endChars.indexOf(ch) >= 0) {
          return trim(string);
        }

        if (ch === '\\') {
          next();
          if (ch === 'u') {
            uffff = 0;
            for (i = 0; i < 4; i += 1) {
              hex = parseInt(next(), 16);
              if (!isFinite(hex)) {
                break;
              }
              uffff = uffff * 16 + hex;
            }
            string += String.fromCharCode(uffff);
          } else if (typeof escapee[ch] === 'string') {
            string += escapee[ch];
          } else {
            break;
          }
        } else {
          string += ch;
        }
        next();
      }

      error('Bad string');
    },

  // 字面量，可以是字符串、数值，或 true, false, null
    literal = function() {
      var result = '';
      while (ch && endChars.indexOf(ch) < 0) {
        result += ch;
        next();
      }
      result = trim(result);
      if (words.hasOwnProperty(result)) { return words[result]; }
      if (isNumerical(result)) {
        return +result;
      }
      return result;
    },

    array = function() {
      var array = [];

      if (ch === '[') {
        next('[');
        white();
        if (ch === ']') {
          next(']');
          return array;   // empty array
        }
        while (ch) {
          array.push(value());
          white();
          if (ch === ']') {
            next(']');
            return array;
          }
          next(',');
          white();
        }
      }
      error('Bad array');
    },

    object = function() {
      var key,
        object = {};

      if (ch === '{') {
        next('{');
        white();
        if (ch === '}') {
          next('}');
          return object; // empty object
        }
        while (ch) {
          key = string();
          white();
          next(':');
          if (key === '') {
            error('Empty key');
          }
          if (Object.hasOwnProperty.call(object, key)) {
            error('Duplicate key "' + key + '"');
          }
          object[key] = value();
          white();
          if (ch === '}') {
            next('}');
            return object;
          }
          next(',');
          white();
        }
      }
      error('Bad object');
    },

    white = function() {
      // Skip whitespace.
      while (ch && ch <= ' ') { next(); }
    };

  value = function() {
    white();
    switch (ch) {
      case '{':
        return object();
      case '[':
        return array();
      case '"':
      case '\'':
        return string();
      default:
        return literal();
    }
  };

  return function (source) {

    var result;
    if (typeof source !== 'string') {
      error('Illegal input');
    }

    text = source;
    at = 0;
    ch = ' ';
    result = value();
    white();
    if (ch) {
      error('Syntax error');
    }

    return result;
  };
})();

if ( typeof module === 'object' && typeof module.exports === 'object' ) {
  module.exports = jsonfy;
}
