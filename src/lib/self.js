var base = require('./base');
var Rule = require('./rule-simple');

/**
 * @class Self
 * @param {Object} values
 * @param {Array} args
 * @param {Object} $rule
 * @param {Object} $defaults
 * @param {Object} $options
 */
function Self(values, args, $rule, $defaults, $options) {
  var dft = base.merge({}, $defaults);
  base.eachArr($rule.params, function(param) {
    if ('val' in param) { dft[param.key] = param.val; }
  });
  this.values = base.merge(dft, values);
  this.arguments = args;
  this.$rule = $rule;
  this.$defaults = $defaults;
  this.$options = $options;

  var self = this;
  base.eachObj(this.values, function(val, key) {
    self[key] = val;
  });
}

Self.prototype.$has = function(key) {
  return (key in this.values);
};

Self.prototype.$get = function(key, dft) {
  return this.$has(key) ? this.values[key] : dft;
};

Self.def = function(fn, cfg) {
  return function() {
    var binder = this;
    var args = base.arrify(arguments), matches = false, rule;

    // 遍历规则，看是否有匹配的，有的话立即跳出
    base.eachArr(cfg.rules, function(r) {
      if ((matches = Rule.match(r, args))) {
        rule = r;
        return false;
      }
    });

    // 执行原函数
    if (matches) {
      var self = new Self(matches, args, rule, cfg.defaults, cfg.options);

      return fn.apply(
        cfg.arguments.indexOf('self') >= 0 ? binder : self,
        base.map(cfg.arguments, function(arg) { return arg === 'self' ? self : self.$get(arg); })
      );

    } else {
      throw new Error('Not found rule for arguments (' + args.join(', ') + ').');
    }
  };
};


module.exports = Self;
