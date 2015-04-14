/**
 * 处理 hereDoc 版的 def，可以直接处理没有编译过的代码，如果代码编译过，请使用 simple 版的 def
 */

var base = require('./lib/base'),
  HereDoc = require('./lib/heredoc'),
  option = require('./lib/option'),
  type = require('./lib/type'),
  Self = require('./lib/self'),
  Rule = require('./lib/rule');


function def(fn) {
  var doc, cfg;

  if (!base.isFunction(fn)) {
    throw new TypeError('Parameter "' + fn + '" should be function.');
  }

  if (false !== (doc = HereDoc.getFromFunc(fn))) {
    cfg = HereDoc.parse(doc, {rules: Array, options: Object, defaults: Object});
    cfg.options = base.merge({}, option.all, cfg.options); // clone system options
    cfg.defaults = base.merge({}, cfg.defaults);
  }

  if (!cfg || !cfg.rules || !cfg.rules.length) {
    throw new Error('No rules.');
  }

  cfg.rules = base.map(cfg.rules, Rule.parse);
  //console.log(JSON.stringify(cfg.rules, null, 2));

  return Self.def(fn, cfg);
}

def.option = option;
base.merge(def, type);

module.exports = def;
