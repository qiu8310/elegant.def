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
    var result = false;
    var argsLen = args.length, okRoad;
    base.eachArr(parsedRule.roads, function(road, j) {
      if (road.length === argsLen) {
        okRoad = road;
        base.eachArr(road, function(index, i) {
          var param = parsedRule.params[index];
          if (!type.is(args[i], param.type)) {
            okRoad = false;
            return okRoad;
          }
        });
        return !okRoad;
      }
    });

    if (okRoad) {
      result = {};
      base.eachArr(okRoad, function(i, j) {
        var param = parsedRule.params[i];
        result[param.key] = args[j];
      });
    }

    return result;
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
        var rtn = {key: group[0], type: group[1]};
        if (typeof group[2] !== 'undefined') { rtn.val = group[2]; }
        return rtn;
      }),
      roads: compressedRule[2]
    };
  }
};
