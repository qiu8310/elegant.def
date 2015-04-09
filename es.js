// http://bocoup.com/weblog/building-command-line-tools-in-node-with-liftoff/

var traverse = require("ast-traverse"),
  esprima = require('esprima'),
  alter = require("alter"),
  _ = require('lodash');


var content = require('fs').readFileSync('./t.js', {encoding: 'utf8'});
var ast = esprima.parse(content, {range: true});
var fragments = [];



var R = {
  hereDoc: /\/\*\*([\s\S]*?)\*\//,
  gHereDocItem: /^\s*\*\s*@(\w+)\s+(.*?)\s*$/mg
};
function parse(src) {
  if (!R.hereDoc.test(src)) { return false; }
  var result = [];
  RegExp.$1.replace(R.gHereDocItem, function(raw, key, str) {
    key = key.toLowerCase();
    console.log(key, str);

  });
}











traverse(ast, {
  pre: function(node) {
    if (node.type === 'CallExpression' && node.callee.name === 'def' && node.arguments.length === 1) {
      var start = node.range[0],
        end = node.range[1],
        src = content.substring(start, end);

      parse(src);

      fragments.push({start: start, end: end, str: src});
    }
  }
});

// console.log(alter(content, fragments));


//console.log(JSON.stringify(ast, null, 2));
