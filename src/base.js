//## 基本函数
function typeOf(obj) { return ({}).toString.call(obj).slice(8, -1).toLowerCase(); }
function trim(str) { return str.trim ? str.trim() : str.replace(/^\s*|\s*$/g, ''); }
function cap(str) { return str.charAt(0).toUpperCase() + str.substr(1); }

function eachObj(o, fn) {for(var k in o){ if(o.hasOwnProperty(k)){if(fn(o[k], k, o) === false) {break;}}}}
function each(a, fn){for (var i = 0; i < a.length; ++i) {if (fn(a[i], i, a) === false) { break; }}}
function map(a, fn){var r = []; return a.map ? a.map(fn) : (each(a, function(){r.push(fn.apply(null, arguments));}) || r);}
function filter(a, fn){var r = []; return a.filter ? a.filter(fn) : (each(a, function(i){fn.apply(null, arguments) && r.push(i);}) || r);}
//function index(a, s) {var r = -1; return a.indexOf ? a.indexOf(s) : (each(a, function(t, i) {if(s===t) {r=i; return false;}}) || r);}
//function include(a, s) {return ~index(a, s);}

var T = {};

// 类型检查
each('Object,Number,String,Array,Boolean,Undefined,Function'.split(','), function(key) {
  // NaN 不属于上面的任何类型，默认的 typeOf(NaN) 返回的是 number 的，用 mix === mix 把 NaN 过滤掉
  T['is' + key] = function(mix) { return mix === mix && typeOf(mix) === key.toLowerCase(); };
});

function arrify(arg, index) { return [].slice.call(arg, index || 0); }
function merge(to) {
  if (!T.isObject(to)) { to = {}; }
  each(arrify(arguments, 1), function(arg) {
    if (T.isObject(arg)) {eachObj(arg, function(v, k) { to[k] = v; });}
  });
  return to;
}

function error(msg, obj) {
  var sep = '\r\n', pre = '\t';
  eachObj(obj, function(val, key) {
    msg += sep + pre + cap(key) + ': ' + val.toString();
  });
  throw new Error(msg);
}

