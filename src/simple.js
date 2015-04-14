/**
 * 用在 compiler 压缩过的文件中
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

  cfg.rules = base.map(cfg.rules, Rule.decompress);
  cfg.options = base.merge({}, option.all, cfg.options);
  cfg.defaults = base.merge({}, cfg.defaults);

  return Self.def(fn, cfg);
}

def.option = option;
base.merge(def, type);

module.exports = def;
