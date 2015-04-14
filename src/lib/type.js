/**
 * @module type
 */

var base = require('./base');

var type = {};

var all = type._all = {};

var basicTypes = '*,int,number,string,object,array,function,arguments,boolean,null,nature,positive,negative'.split(','),
  typeAliases = {
    integer: 'int',
    signed: 'int',
    bool: 'boolean',
    unsigned: 'nature'
  };

function is(mix, type) {
  if (type in typeAliases) {
    type = typeAliases[type];
  }

  switch (type) {
    case '*':
      return true;
    case 'int':
      return base.isInt(mix);
    case 'number':
      return base.isNumber(mix);
    case 'nature':
      return base.isInt(mix) && mix >= 0;
    case 'positive':
      return base.isInt(mix) && mix > 0;
    case 'negative':
      return base.isInt(mix) && mix < 0;

    //case 'string':
    //case 'object':
    //case 'array':
    //case 'function':
    //case 'arguments':
    //case 'boolean':
    //case 'null':

    default :
      return base.typeOf(mix) === type;
  }
}

base.eachArr(basicTypes.concat(base.objectKeys(typeAliases)), function (key) { all[key] = is; });

/**
 * 判断 mix 是否是 type 类型
 * @param {*} mix
 * @param {String} type
 * @returns {Boolean}
 */
type.is = function(mix, type) {
  type = type.toLowerCase();

  if (!(type in all)) {
    throw new Error('type "' + type + '" not exists.');
  }

  return all[type](mix, type);
};

/**
 * 判断是否定义了 type 类型
 * @param {String} type
 * @returns {Boolean}
 */
type.has = function(type) {
  return type.toLowerCase() in all;
};

/**
 * 注册新的类型
 * @param {String} type
 * @param {Function} fn
 */
type.type = function(type, fn) {
  type = type.toLowerCase();
  if (type in all) {
    throw new Error('type "' + type + '" already exists.');
  }

  // 恢复默认的类型
  if (!fn && (typeAliases[type] || basicTypes.indexOf(type))) {
    fn = is;
  }

  all[type] = fn;
};

/**
 * 删除某一类型
 * @param {String} type
 */
type.untype = function(type) {
  type = type.toLowerCase();

  if (!(type in all)) {
    throw new Error('type "' + type + '" not exists.');
  }

  delete all[type];
};

/**
 *
 * @alias untype
 */
type.unType = type.untype;

module.exports = type;
