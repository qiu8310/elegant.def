/**
 * module HereDoc
 */

var jsonfy = require('jsonfy');
var base = require('./base');

var HereDoc = {};

var reDocTag = /^\s*@(\w+)\s/mg,
  reDocAsterisk = /^\s*\*[ \t]?/mg;

/**
 * 提取 hereDoc 中的关键字段，去掉行首和行尾的空格
 *
 * @param {String} hereDocStr
 * @private
 */
function getTags(hereDocStr) {

  hereDocStr = hereDocStr.replace(reDocAsterisk, '');

  var start = 0, tagKey, desc = '', tags = {};

  function addTag(key, val) {
    if (!(key in tags)) { tags[key] = []; }
    tags[key].push(base.trim(val));
  }

  hereDocStr.replace(reDocTag, function(raw, key, index) {
    if (!start) {
      desc = base.trim(hereDocStr.substring(start, index));
    } else {
      addTag(tagKey, hereDocStr.substring(start, index));
    }

    tagKey = key;
    start = index + raw.length;
  });

  if (tagKey) {
    addTag(tagKey, hereDocStr.substr(start));
  }

  tags.desc = desc;

  return tags;
}


var _firstLine = function (str) { return str.split(/[\r]?\n/).shift();},
  _firstWord = function(str) { /^(\w+)/.test(str); return RegExp.$1; };

/**
 * 解析 HereDoc 成对象
 *
 * @param {String} hereDocStr
 * @param {Boolean} [forDoc = false]
 * @returns {{rules: Array, names: Array, defaults: Object, options: Object}}
 *
 */
HereDoc.parse = function (hereDocStr, forDoc) {

  var tags = getTags(hereDocStr);
  var result = {};

  base.eachArr(['defaults', 'options'], function(k) {
    result[k] = tags[k] ? jsonfy(base.wrapInBrackets(_firstLine(tags[k].pop()))) : {};
  });

  result.rules = base.map((tags.rules || []).concat(tags.rule || []), _firstLine);
  result.names = base.map((tags.name ? [tags.name.pop()] : []).concat((tags.alias || [])), _firstWord);

  var map = {};
  result.names = base.filter(result.names, function(name) {
    var exists = name in map;
    map[name] = true;
    return name && !exists;
  });


  if (forDoc) {
    result.examples = tags.example || [];
    result.desc = tags.desc;
  }

  return result;
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
