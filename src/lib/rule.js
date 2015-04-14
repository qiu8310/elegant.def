/**
 * @module rule
 */

var base = require('./base');
var type = require('./type');
var RuleSimple = require('./rule-simple');
var jsonfy = require('jsonfy');
var Rule = {};

var reRule = /\(([^\)]*)\)\s*->\s*(\*|\w+)/;   // ( ... ) -> type
var reArg = /(\w+|\*)\s+(\w+)\s*(?:=(.*?))?\s*(?=[,\[\]\s]*(?:[\*\w]+\s+\w+|$))/g;
//var reArg = /(\w+|\*)\s+(\w+)\s*(?:=\s*<(.*?)>\s*)?\s*(?=[,\[\]\s]*(?:[\*\w]+\s+\w+|$))/g;
var reComma = /\s*,\s*/g;

base.merge(Rule, RuleSimple);

/**
 *
 * - 遇到 '['，到对应的 ']' 中的内容有两种选择，要或者不要
 * - 遇到非 '['，添加到 prefix
 *
 * @param {String} prefix
 * @param {String} rest
 * @param {Function} cb
 * @private
 */
function consume(prefix, rest, cb) {
  if (rest === '') { return cb(prefix); }

  var index = rest.indexOf('[');
  if (index < 0) {
    return cb(prefix + rest);

  } else if (index === 0) {
    var count = 0, c, i;
    for (i = 1; i < rest.length; i++) {
      c = rest.charAt(i);
      if (c === '[') {
        count++;
      } else if (c === ']') {
        if (count === 0) {
          consume(prefix, rest.substr(i + 1), cb);
          consume(prefix, rest.substring(index + 1, i) + rest.substr(i + 1), cb);
        } else {
          count--;
        }
      }
    }

  } else {
    consume(prefix + rest.substring(0, index), rest.substr(index), cb);
  }
}


/**
 * 字符串中是否有成对的 [, ]
 * @param {String} str
 * @returns {Boolean}
 * @private
 */
function isBracketsPaired(str) {
  var count = 0, i, c;
  for (i = 0; i < str.length; i++) {
    c = str.charAt(i);
    if (c === '[') { count++; }
    if (c === ']') { count--; }
  }
  return count === 0;
}

function toInt(str) { return parseInt(str, 10); }

function parseVal(val) {
  val = val.trim();
  if (val.charAt(0) === '<' && val.charAt(val.length - 1) === '>') {
    val = val.substr(1, val.length - 2);
  }
  return jsonfy(val);
}

/**
 * 解析 HereDoc 中的一条 @rules 定义的规则
 *
 * @param {String} rule
 * @returns {{returnType: string, params: Array, roads: Array}}
 */
Rule.parse = function(rule) {

  if (!reRule.test(rule)) {
    throw new SyntaxError('Rule "' + rule + '" defined error.');
  }

  var args = base.trim(RegExp.$1),
    params = [], roads = [], index = -1, result, keyMap = {};

  result = {
    returnType: RegExp.$2.toLowerCase(),
    params: params,
    roads: roads
  };

  // 得到 arg 的默认值
  args = args.replace(reArg, function(raw, t, key, val) {
    t = t.toLowerCase();
    var param = {key: key, type: t};
    if (keyMap[key]) {
      throw new SyntaxError('Duplicate key ' + key);
    }
    keyMap[key] = true;
    if (val) {
      try {
        param.val = parseVal(val);
      } catch (e) {
        throw new SyntaxError('Rule "' + rule + '" value "' + val + '" parsed error.');
      }
      if (!type.is(param.val, t)) {
        throw new SyntaxError(key + '\'s value is not type ' + t);
      }
    }
    params.push(param);
    index++;

    return ' ' + index + ' ';
  });

  // 去掉所有的 ','
  args = args.replace(reComma, ' ');

  // 确保 [ 和 ] 的个数是一样的
  if (!isBracketsPaired(args)) { throw new SyntaxError('Rule "' + rule + '" brackets not paired'); }

  // 得到所有可能的组合
  consume('', args, function(r) {
    r = base.trim(r);
    if (!r) {
      roads.push([]);
    } else {
      roads.push(base.map(r.split(/\s+/), toInt));
    }
  });

  return result;
};

/**
 * 将 rule 压缩， compiler 中要用
 * @param {Object} parsedRule
 * @returns {Array}
 */
Rule.compress = function(parsedRule) {
  var params = base.map(parsedRule.params, function(param) {
    var rtn = [param.key, param.type];
    if ('val' in param) { rtn.push(param.val); }
    return rtn;
  });
  return [parsedRule.returnType, params, parsedRule.roads];
};


module.exports = Rule;
