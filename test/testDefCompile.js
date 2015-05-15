var compile = require('../src/compile'),
  fs = require('fs'),
  os = require('os'),
  path = require('path'),
  assert = require('should');

describe('defCompile', function() {

  var helper,
    keys = require('../examples/meta');


  context('compile', function() {
    before(function() {
      helper = function(key) {
        var inCont = fs.readFileSync('examples/' + key + '.js').toString();
        var outCont = fs.readFileSync('examples/' + key + '.out.js').toString();
        assert.equal(compile(inCont), outCont);
      };
    });

    //it.only('#range', function() { helper('range'); });

    keys.forEach(function(key) {
      it('#' + key, function() { helper(key); });
    });
  });


  context('compile.doc', function() {
    var parse, result = [];

    before(function() {
      var outFile = './examples/xx.md', program;

      // copy from ./bin/def-doc.js
      function ruleToString(rule) {
        var res = [];
        rule.road.forEach(function(p) {
          res.push(p.type + ' ' + p.key + (('val' in p) ? ' = ' + JSON.stringify(p.val) : ''));
        });

        return '(' + res.join(', ') + ') -> ' + rule.returnType;
      }
      parse = function (file) {
        var docs = compile.doc(fs.readFileSync(file).toString(), program);
        var relativeFile = path.relative(path.dirname(path.resolve(outFile)), file);
        result.push('## [' + path.basename(relativeFile) + '](' + relativeFile + ')');

        docs.forEach(function(docObj) {

          var source = relativeFile + '#L' + docObj.loc.start.line + '-' + docObj.loc.end.line;
          result.push('### [' + (docObj.names && docObj.names.shift() || '(anonymous)') + '](' + source + ')');

          if (docObj.desc) {
            result.push(docObj.desc);
          }

          if (docObj.names && docObj.names.length) {
            result.push('__Alias: __`' + docObj.names.join('`, `') + '`');
          }

          result.push('__Rules: __');
          result.push(docObj.rules.map(function(rule) {
            return '  - `' + ruleToString(rule) + '`';
          }).join(os.EOL));

          if (docObj.examples.length) {
            result.push('__Examples: __');
          }
          docObj.examples.forEach(function(ex) {
            result.push('```js');
            result.push(ex);
            result.push('```');
          });

          result.push(os.EOL);
        });
      };

      helper = function(key) {
        var outCont = fs.readFileSync('examples/' + key + '.md').toString();
        parse('./examples/' + key + '.js');

        assert.equal(result.join(os.EOL + os.EOL), outCont);
        result = [];
      };
    });

    //it.only('#range', function() { helper('range'); });

    keys.forEach(function(key) {
      it('#' + key, function() { helper(key); });
    });
  });
});
