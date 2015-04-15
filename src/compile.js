/**
 * 编译器
 *
 * 将 def 的 heredoc 编译成 def 的第二个参数
 *
 */

var base = require('./lib/base'),
  HereDoc = require('./lib/heredoc'),
  Rule = require('./lib/rule'),
  esprima = require('esprima'),
  traverse = require('ast-traverse');


/**
 * 编译带 HereDoc 的 def 函数
 * @param {String} content
 * @param {Object} opts
 * @param {String} opts.defName
 * @returns {*}
 */
function compile (content, opts) {
  opts = base.merge({defName: 'def'}, opts);

  var ast = esprima.parse(content, {range: true, comment: true});

  var docs = [];
  var findDocCfg = function(range) {
    for (var r, i = 0; i < docs.length; i++) {
      r = docs[i].range;
      if (range[0] <= r[0] && range[1] >= r[1]) {
        return docs.splice(i, 1)[0].cfg;
      }
    }
    return false;
  };
  var parseRule = function(rule) { return Rule.compress(Rule.parse(rule)); };

  base.eachArr(ast.comments, function(comment) {
    if (comment.type === 'Block') {
      var cfg = HereDoc.parse(comment.value, {rules: Array, options: Object, defaults: Object});
      if (cfg && cfg.rules && cfg.rules.length) {
        cfg.rules = base.map(cfg.rules, parseRule);
        docs.push({range: comment.range, cfg: cfg});
      }
    }
  });
  delete ast.comments;

  var indexes = [];
  traverse(ast, {pre: function(node) {
    if (
      node.type === 'CallExpression' &&
      node.callee.name === opts.defName &&
      node.arguments.length === 1 &&
      node.arguments[0].type === 'FunctionExpression'
    ) {
      delete node.range;
      var cfg = findDocCfg(node.arguments[0].range);
      if (cfg) {
        indexes.push({index: node.arguments[0].range[1], cfg: cfg});
      }
    }
  }});

  var out = [], idx = 0;
  base.eachArr(indexes.sort(function(a, b) { return a.index - b.index; }), function(it) {
    out.push(content.substring(idx, it.index), ', ' + JSON.stringify(it.cfg));
    idx = it.index;
  });
  out.push(content.substr(idx));
  return out.join('');
}

module.exports = compile;
