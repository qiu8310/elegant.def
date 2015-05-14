#!/usr/bin/env node
'use strict';

var program = require('commander');
var fs = require('fs');
var glob = require('glob').sync;
var compile = require('../src/compile');

program
  .version(require(require('path').resolve(__dirname, '..', 'package.json')).version)
  .usage('[options] <inFile>')
  .description('Compile def\'s heredoc to function arguments')
  .option('-p, --print', 'print out the generate file content')
  .option('-o, --out-file <outFile>', 'specified the output file, default is inFile.out.js')
  .option('-d, --def-name <defName>', 'keyword used for def function name, default is "def"')
  .parse(process.argv);

if (!program.args.length) {
  program.help();
} else {

  var parse = function(file) {
    var inContent = fs.readFileSync(file).toString();
    var outContent = compile(inContent, program);

    if (program.print) {
      console.log(outContent);
    } else {
      var outFile = program.outFile || file.replace(/(\.\w+)?$/, '.out$1');
      fs.writeFileSync(outFile, outContent);
      console.log('Write to ' + outFile + ' ok!\r\n');
    }
  };

  program.args.forEach(function(pattern) { glob(pattern).forEach(parse); });
}
