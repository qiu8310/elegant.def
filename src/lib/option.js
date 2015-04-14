/**
 * @module option
 */
var _opts = {
  applySelf: false
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
