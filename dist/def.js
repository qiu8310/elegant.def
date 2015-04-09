/*!
 * elegant.def JavaScript Library v0.0.2
 *
 * Author: Zhonglei Qiu
 *
 * Date: Mon Mar 16 2015 11:29:32 GMT+0800 (CST)
 */

(function() {


"use strict";

var help = 5;
var core = 1;

var def = function () {};



if ( typeof module === 'object' && typeof module.exports === 'object' ) {
  module.exports = def;
} else {
  (typeof window !== 'undefined' ? window : this).def = def;
}

})();