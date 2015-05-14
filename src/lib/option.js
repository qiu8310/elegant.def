/**
 * @module option
 */
var _opts = {
  //applySelf: false  // 此配置已经无用了，现在采取的是自动根据函数中是否有 self 参数来判断是否 applySelf
};

/**
 *
 * @param {String} key
 * @param {*} val
 * @returns {*}
 */
function option(key, val) {
  if (typeof val === 'undefined') {
    return _opts[key];
  } else {
    _opts[key] = val;
  }
}

option.all = _opts;

module.exports = option;
