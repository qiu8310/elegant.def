/**
 * 由于此组件需要给浏览器用，所以很多函数都是为了兼容各个浏览器
 *
 * @module base
 */

/**
 *
 * @callback IteratorCallback
 * @param {*} iteratorItem - 遍历对象中的单个元素
 * @param {Number|String} iteratorKey - 数组的 index 或哈希的 key
 * @param {Object|Array} ref - 遍历对象本身的引用
 */

/**
 * 遍历一个哈希
 *
 * @param {Object} obj
 * @param {IteratorCallback} fn
 */
exports.eachObj = function(obj, fn) {
  for (var k in obj){
    if (obj.hasOwnProperty(k)){
      if (fn(obj[k], k, obj) === false) {
        break;
      }
    }
  }
};

/**
 * 遍历一个数组
 *
 * @param {Array} arr
 * @param {IteratorCallback} fn
 */
exports.eachArr = function(arr, fn) {
  for (var i = 0; i < arr.length; ++i) {
    if (fn(arr[i], i, arr) === false) {
      break;
    }
  }
};

/**
 * 返回任意一个 Object 的 type
 *
 * @param {*} obj
 * @returns {String}
 */
exports.typeOf = function(obj) {
  return ({}).toString.call(obj).slice(8, -1).toLowerCase();
};

/**
 * 去除字符串首末的空白字符
 *
 * @param {String} str
 * @returns {String}
 */
exports.trim = function(str) {
  return str.trim ? str.trim() : str.replace(/^\s*|\s*$/g, '');
};


/**
 * 兼容 Array.map
 *
 * @param {Array} arr
 * @param {IteratorCallback} fn
 * @returns {Array}
 */
exports.map = function(arr, fn) {
  var r = [];
  return arr.map ?
    arr.map(fn) :
    (exports.eachArr(arr, function(){
      r.push(fn.apply(null, arguments));
    }) || r);
};

/**
 * 兼容 Array.filter
 *
 * @param {Array} arr
 * @param {IteratorCallback} fn
 * @returns {Array}
 */
exports.filter = function(arr, fn) {
  var r = [];
  return arr.filter ?
    arr.filter(fn) :
    (exports.eachArr(arr, function(i){
      if (fn.apply(null, arguments)) {
        r.push(i);
      }
    }) || r);
};

/**
 * 将类似于数组的对象转换成数组
 *
 * @param {Object} arrLike
 * @param {Number} [index = 0]
 * @returns {Array}
 */
exports.arrify = function(arrLike, index) {
  return [].slice.call(arrLike, index || 0);
};

var T = {};

// 类型检查
exports.eachArr('Object,Number,String,Array,Boolean,Undefined,Function'.split(','), function(key) {
  // NaN 不属于上面的任何类型，默认的 typeOf(NaN) 返回的是 number 的，用 mix === mix 把 NaN 过滤掉
  T['is' + key] = function(mix) { return mix === mix && exports.typeOf(mix) === key.toLowerCase(); };
});

/**
 * 判断一个字符串是否是一个合法的数字
 *
 * @param {String} str
 * @returns {Boolean}
 */
exports.isNumerical = function (str) {
  if (str.charAt(0) === '-') { str = str.substr(1); }

  if (/^(?:\d*\.)?\d+$/.test(str)) {
    // 0056, 00.56, 56.00 也会符合正则的
    if (str.indexOf('.') >= 0) {
      // 如果小数的第一位是0，则第二位一定要是 . ； 而如果第一位不是 0，则不管 . 在第几位都有效
      return (str.charAt(0) !== '0') || (str.charAt(1) === '.');
    } else {
      return str === '0' || str.charAt(0) !== '0';
    }
  }
  return false;
};

/**
 * 判断一个数字是否是一个合法的整数
 *
 * @param {Number} num
 * @returns {Boolean}
 */
exports.isInt = function (num) {
  return T.isNumber(num) && String(num).indexOf('.') === -1;
};


exports.merge = function(to) {
  if (!to) { to = {}; }
  exports.eachArr(exports.arrify(arguments, 1), function(arg) {
    if (T.isObject(arg)) {exports.eachObj(arg, function(v, k) { to[k] = v; });}
  });
  return to;
};

exports.merge(module.exports, T);

/**
 * 取出某个哈希中所有的 key
 *
 * @param {Object} obj
 * @returns {Array}
 */
exports.objectKeys = function(obj) {
  if (Object.keys) {
    return Object.keys(obj);
  }
  var keys = [];
  exports.eachObj(obj, function(val, key) {
    keys.push(key);
  });
  return keys;
};

/**
 * 保证 str 包含在 { } 内
 *
 * @param {String} str
 * @returns {String}
 */
exports.wrapInBrackets = function(str) {
  if (str.charAt(0) !== '{') {
    str = '{' + str;
  }
  if (str.charAt(str.length - 1) !== '}') {
    str += '}';
  }
  return str;
};
