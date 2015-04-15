var base = require('./base'),
  type = require('./type');

module.exports = {
  /**
   *
   * @param {Object} parsedRule
   * @param {Array} args
   * @returns {Boolean}
   */
  match: function(parsedRule, args) {
    var result;
    var argsLen = args.length, okRoad;

    base.eachArr(parsedRule.roads, function(road, j) {
      result = {};
      var roadIndex, argIndex = 0, param, arg;
      for (roadIndex = 0; roadIndex < road.length; roadIndex++) {
        param = parsedRule.params[road[roadIndex]];
        arg = args[argIndex];
        if (!type.is(arg, param.type) || argIndex >= argsLen) {
          break;
        }

        argIndex++;
        if (param.rest) {
          result[param.key] = [arg];
          while (argIndex < argsLen && type.is(args[argIndex], param.type)) {
            result[param.key].push(args[argIndex]);
            argIndex++;
          }
        } else {
          result[param.key] = arg;
        }
      }

      if (argIndex === argsLen && roadIndex === road.length) {
        okRoad = road;
        return false;
      }
    });

    return okRoad ? result : false;
  },

  /**
   * 解压缩 rule
   * @param {Array} compressedRule
   * @returns {{returnType: *, params: Array, roads: *}}
   */
  decompress: function(compressedRule) {
    return {
      returnType: compressedRule[0],
      params: base.map(compressedRule[1], function(group) {
        if (group[0] !== 1) { group.unshift(0); }
        var rtn = {key: group[1], type: group[2], rest: group[0]};
        if (group.length > 3) { rtn.val = group[3]; }
        return rtn;
      }),
      roads: compressedRule[2]
    };
  }
};
