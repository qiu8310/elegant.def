/**
 *
 * 全版本的 def，完全兼容另一个[简版的 def](./simple.js)
 *
 * 适合用在代码不需要压缩的地方，比如 node scripts、test scripts 等
 */

var base = require('./lib/base'),
  HereDoc = require('./lib/heredoc'),
  option = require('./lib/option'),
  type = require('./lib/type'),
  Self = require('./lib/self'),
  Rule = require('./lib/rule');


function def(fn) {
  var doc, cfg;

  if (arguments.length > 1) {
    return require('./simple').apply(this, arguments);
  }

  if (!base.isFunction(fn)) {
    throw new TypeError('Parameter "' + fn + '" should be function.');
  }

  if (false !== (doc = HereDoc.getFromFunc(fn))) {
    cfg = HereDoc.parse(doc, {name: Array, rule: Array, rules: Array, options: Object, defaults: Object});
    cfg.options = base.merge({}, option.all, cfg.options); // clone system options
    cfg.defaults = base.merge({}, cfg.defaults);

    // 转换成复数形式，兼容老版本写成 @rules 的形式
    cfg.rules = (cfg.rule || []).concat(cfg.rules || []);
    cfg.names = cfg.name || []; // 新添加函数名称的定义

    var parsedFn = HereDoc.parseFunc(fn);

    if (parsedFn.name) { cfg.names.push(parsedFn.name); }

    cfg.arguments = parsedFn.arguments;
  }

  if (!cfg || !cfg.rules.length) {
    //throw new Error('No rules.');
    return fn;
  }

  cfg.rules = base.map(cfg.rules, Rule.parse);
  //console.log(JSON.stringify(cfg.rules, null, 2));

  return Self.def(fn, cfg);
}

def.option = option;
base.merge(def, type);

module.exports = def;
