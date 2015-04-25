/**
 * 简版的 def
 *
 * 不支持 heredoc，适合用在代码需要压缩的地方（代码压缩会将 heredoc 给删除了）
 */

var base = require('./lib/base');
var option = require('./lib/option');
var Rule = require('./lib/rule-simple');
var type = require('./lib/type');
var Self = require('./lib/self');

/**
 *
 * @param {Function} fn
 * @param {Object} cfg
 * @returns {Function}
 */
function def(fn, cfg) {

  if (!cfg) {
    return fn;
  }

  cfg.rules = base.map(cfg.rules, Rule.decompress);
  cfg.options = base.merge({}, option.all, cfg.options);
  cfg.defaults = base.merge({}, cfg.defaults);

  return Self.def(fn, cfg);
}

def.option = option;
base.merge(def, type);

module.exports = def;
