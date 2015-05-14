/**
 * 编译器
 *
 * 将 def 的 heredoc 编译成 def 的第二个参数
 *
 */

var base = require('./lib/base'),
  HereDoc = require('./lib/heredoc'),
  Rule = require('./lib/rule'),
  type = require('./lib/type'),
  esprima = require('esprima'),
  traverse = require('ast-traverse');

function empty(obj) { return Object.keys(obj).length === 0; }


function _getIndexedCfgArray (content, opts, forDoc) {

  opts = base.merge({defName: 'def'}, opts);

  var ast = esprima.parse(content, {range: true, comment: true, loc: true});

  //require('fs').writeFileSync('./ast.json', JSON.stringify(ast, null, 2));
  //process.exit();

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


  base.eachArr(ast.comments, function(comment) {
    if (comment.type === 'Block') {
      var cfg = HereDoc.parse(comment.value, forDoc);

      if (cfg && cfg.rules.length) {
        cfg.rules = Rule.unique(base.map(cfg.rules, Rule.parse));

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
        if (node.arguments[0].id) { cfg.names.push(node.arguments[0].id.name); }

        cfg.arguments = base.map(node.arguments[0].params, function(it) { return it.name; });

        indexes.push({range: node.arguments[0].range, loc: node.arguments[0].loc, cfg: cfg});
      }
    }
  }});

  return indexes;
}


/**
 * 编译带 HereDoc 的 def 函数
 * @param {String} content
 * @param {Object} opts
 * @param {String} opts.defName
 * @returns {String}
 */
function compile (content, opts) {
  var indexes = _getIndexedCfgArray(content, opts);

  base.eachArr(indexes, function(item) {
    var cfg = item.cfg;
    cfg.rules = base.map(cfg.rules, Rule.compress);

    base.eachArr(['options', 'defaults'], function(k) {
      if (empty(cfg[k])) { delete cfg[k]; }
    });

    // 如果没有 names 和 arguments，则把它们删除
    if (!cfg.names.length) { delete cfg.names; }
    if (!cfg.arguments.length) { delete cfg.arguments; }
  });

  var out = [], idx = 0;
  base.eachArr(indexes.sort(function(a, b) { return a.range[1] - b.range[1]; }), function(it) {
    out.push(content.substring(idx, it.range[1]), ', ' + JSON.stringify(it.cfg));
    idx = it.range[1];
  });
  out.push(content.substr(idx));
  return out.join('');
}

/**
 * 生成文档
 * @param {String} content
 * @param {Object} opts
 * @param {String} opts.defName
 * @returns {{range: Array, loc: Object, rules: Array}}
 *
 * @example
 *
 *  [
 *    {
 *      "range":[60,334],
 *      "loc":{
 *        "start":{"line":3,"column":18},
 *        "end":{"line":17,"column":3}
 *      },
 *      "rules":[
 *        {"returnType":"int","road":[]},
 *        {"returnType":"int","road":[{"type":"int","key":"a","val":0}]}
 *      ]
 *    }
 *  ]
 */
compile.doc = function(content, opts) {
  var indexes = _getIndexedCfgArray(content, opts, true);

  base.eachArr(indexes, function (item) {

    var cfg = item.cfg;
    var rules = [];
    delete item.cfg;

    base.eachArr(cfg.rules, function(rule) {
      var params = base.map(rule.params, function(p) {
        if (!('val' in p) && (p.key in cfg.defaults)) {
          p.val = cfg.defaults[p.key];
        }

        p.type = type.normalize(p.type);

        if (p.rest) {
          p.key = '...' + p.key;
        }

        delete p.rest;

        return p;
      });

      base.eachArr(rule.roads, function(road) {
        rules.push({
          returnType: rule.returnType,
          road: base.map(road, function(index) { return params[index]; })
        });
      });
    });

    item.names = cfg.names;
    item.desc = cfg.desc;
    item.rules = rules;
    item.examples = cfg.examples;
  });

  return indexes;
};


module.exports = compile;
