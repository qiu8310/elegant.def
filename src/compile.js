/**
 * @module compiler
 *
 */

var base = require('./lib/base'),
  HereDoc = require('./lib/heredoc'),
  Rule = require('./lib/rule'),
  esprima = require('esprima'),
  traverse = require('ast-traverse'),
  escodegen = require('escodegen');


/**
 * 编译带 HereDoc 的 def 函数
 * @param {String} content
 * @param {Object} opts
 * @param {String} opts.defName
 * @returns {*}
 */
module.exports = function(content, opts) {
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
  delete ast.comment;

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
        var argAst = esprima.parse('a = ' + JSON.stringify(cfg)).body[0].expression.right;
        node.arguments.push(argAst);
        return false;
      }
    }
  }});

  return escodegen.generate(ast, {format: {compact: true}});
};
