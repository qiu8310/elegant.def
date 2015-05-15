#!/usr/bin/env node
'use strict';

var program = require('commander');
var fs = require('fs');
var os = require('os');
var path = require('path');
var glob = require('glob').sync;
var compile = require('../src/compile');

program
  .version(require(require('path').resolve(__dirname, '..', 'package.json')).version)
  .usage('[options] <inFile>')
  .description('Generate doc for js file which using elegant.def')
  .option('-p, --print', 'print out the generate doc content')
  .option('-o, --out-file <outFile>', 'specified the output file, default is API.md')
  .option('-d, --def-name <defName>', 'keyword used for def function name, default is "def"')
  .parse(process.argv);

function ruleToString(rule) {
  var res = [];
  rule.road.forEach(function(p) {
    res.push(p.type + ' ' + p.key + (('val' in p) ? ' = ' + JSON.stringify(p.val) : ''));
  });

  return '(' + res.join(', ') + ') -> ' + rule.returnType;
}

if (!program.args.length) {
  program.help();
} else {
  var outFile = program.outFile || './API.md';
  var result = [];

  var parse = function (file) {
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

  program.args.forEach(function(pattern) {
    glob(pattern).forEach(parse);
  });

  result = result.join(os.EOL + os.EOL);

  if (program.print) {
    console.log(result);
  } else {
    fs.writeFileSync(outFile, result);
    console.log('Write to ' + outFile + ' ok!\r\n');
  }
}
