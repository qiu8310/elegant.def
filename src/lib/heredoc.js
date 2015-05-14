/**
 * module HereDoc
 */

var jsonfy = require('jsonfy');
var base = require('./base');

var HereDoc = {};

var reDocItem = /^\s*\*\s*@(\w+)\s+(.*?)\s*$/mg;

/**
 * 提取 hereDoc 中的关键字段，去掉行首和行尾的空格
 *
 * @param {String} hereDocStr
 * @param {Array} keys
 * @private
 */
function toObject(hereDocStr, keys) {
  var result = {}, map = {},
    allKeysMode = !keys.length;

  base.eachArr(keys, function(it) { map[it.key] = it; });

  hereDocStr.replace(reDocItem, function(_, key, val) {
    val = base.trim(val);

    if (map[key] || allKeysMode) {
      switch (map[key] && map[key].type) {
        case Object:
          if (!base.isObject(result[key])) {
            result[key] = {};
          }
          base.merge(result[key], jsonfy(base.wrapInBrackets(val)));
          break;

        case String:
          result[key] = val;
          break;

        default:
          if (!(key in result)) {
            result[key] = [];
          }
          result[key].push(val);
      }
    }
  });
  return result;
}

/**
 * 解析 HereDoc 成对象
 *
 * @param {String} hereDocStr
 * @param {*} [keys = null]
 *
 */
HereDoc.parse = function (hereDocStr, keys) {
  var _keys = [];
  if (base.isString(keys)) {
    _keys = [{key: keys, type: Array}];
  } else if (base.isObject(keys)) {
    base.eachObj(keys, function(val, key) {
      _keys.push({key: key, type: val});
    });
  } else if (base.isArray(keys)) {
    base.eachArr(keys, function(val) {
      _keys.push({key: val, type: Array});
    });
  }

  return toObject(hereDocStr, _keys);
};

var reDoc = /(\/\*\*[\s\S]*?\*\/)/,
  reFn = /^function\s+(\w*)\s*\((.*)\)/;

/**
 * 通过 fn.toString() 来得到函数内部定义的 hereDoc
 *
 * @param {Function} fn
 * @returns {String|Boolean}
 */
HereDoc.getFromFunc = function(fn) {
  reDoc.test(fn.toString());
  return RegExp.$1 || false;
};

/**
 * 得到函数的 arguments 及 name
 */
HereDoc.parseFunc = function(fn) {
  reFn.test(fn.toString());
  var args = base.trim(RegExp.$2);
  var name = RegExp.$1;

  args = args ? args.split(/\s*,\s*/) : [];
  return {name: name, arguments: args};
};


module.exports = HereDoc;
