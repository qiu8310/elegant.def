/**
 * @module rule
 */

var base = require('./base');
var type = require('./type');
var RuleSimple = require('./rule-simple');
var jsonfy = require('jsonfy');
var scan = require('sscan');
var Rule = {};

var reRule = /\(([^\)]*)\)\s*->\s*(\*|\w+)/;   // ( ... ) -> type
//var reArg = /(\w+|\*)\s+((?:\.\.\.)?\w+)\s*(?:=(.*?))?\s*(?=[,\[\]\s]*(?:[\*\w]+\s+(?:\.\.\.)?\w+|$))/g;
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

// args before :  "* start, [int ...length, int step = 1 ]"
// args after :   "0, [1, 2]"
function _parseRuleArgs(args) {
  var tpl = '', params = [], count = 0;

  scan(args, function(end) {

    this.white();
    if (this.eos()) { end(); }

    var param = {};

    tpl += this.till(/[\[\s]/, /[\w\*]/);

    if (this.isChar('*')) {
      param.type = '*';
      this.next('*');
    } else {
      param.type = type.normalize(this.takeWord());
    }

    this.next(/\s/);
    this.white();

    if (this.isChar('.')) {
      this.next('.');
      this.next('.');
      this.next('.');
      param.rest = 1;
    } else {
      param.rest = 0;
    }
    param.key = this.takeWord();

    tpl += count++;

    tpl += this.till(/[\s\[\]]/, ',=', function(rest) {
      tpl += rest;
      params.push(param); end();
    });

    if (this.isChar('=')) {
      this.next('=');
      this.white();
      if (this.isChar('"\'[{')) {
        param.val = this.takeValue();
      } else if (this.isChar('<')) {
        param.val = this.takePair('<', '>'); // 为了兼容早期的正则表达式版本
      } else {
        param.val = base.trim(this.take(/[^\[\],]/));
      }
    }

    params.push(param);

    tpl += this.take(/[,\]\[\s]/);

    if (this.eos()) {
      end();
    }
  });

  return {tpl: tpl, params: params};
}


/**
 * 解析 HereDoc 中的一条 @rules 定义的规则
 *
 * @param {String} rule
 * @returns {{returnType: String, params: [{type: String, key: String, rest: Boolean}], roads: Array}}
 */
Rule.parse = function(rule) {

  if (!reRule.test(rule)) {
    throw new SyntaxError('Rule "' + rule + '" defined error.');
  }

  var args = base.trim(RegExp.$1), parsedArgs,
    roads = [], result, keyMap = {};

  result = {
    returnType: RegExp.$2.toLowerCase(),
    roads: roads
  };

  // args before :  "int start, [int length, int step = 1 ]"
  // args after :   "0, [1, 2]"
  try {
    parsedArgs = _parseRuleArgs(args);
  } catch (e) {
    throw new Error('Parse rule arguments error: ' + args);
  }

  args = parsedArgs.tpl;
  base.eachArr(parsedArgs.params, function(param) {
    if (keyMap[param.key]) { throw new SyntaxError('Duplicate key ' + param.key); }
    keyMap[param.key] = true;

    if (!base.isUndefined(param.val)) {
      param.type = param.type.toLowerCase();

      try {
        param.val = parseVal(param.val);
      } catch (e) {
        throw new SyntaxError('Rule "' + rule + '" value "' + param.val + '" parsed error.');
      }

      if (!type.is(param.val, param.type)) {
        throw new SyntaxError(param.key + '\'s value is not type ' + param.type);
      }
    }
  });

  result.params = parsedArgs.params;

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
    if (param.rest) { rtn.unshift(param.rest); }
    if ('val' in param) { rtn.push(param.val); }
    return rtn;
  });
  return [parsedRule.returnType, params, parsedRule.roads];
};

/**
 * 将重复的 rule 中的 road 去掉
 * @param {Array} rules
 */
Rule.unique = function(rules) {
  var roads = {};
  return base.filter(rules, function(rule) {

    rule.roads = base.filter(rule.roads, function(road) {
      var key = base.map(road, function(index) {
        var param = rule.params[index];
        return (param.rest ? '...' : '') + param.type;
      }).join('|');

      var exists = key in roads;

      roads[key] = true;

      return !exists;
    });


    return rule.roads.length > 0;

  });
};


module.exports = Rule;
