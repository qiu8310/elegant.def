// 所有用到的正则，预编译
var RE = {
  hereDoc: /\/\*\*([\s\S]*?)\*\//,
  gHereDocItem: /^\s*\*\s*@(\w+)\s+(.*?)\s*$/mg,
  gTrim: /^\s*|\s*$/g,
  gComma: /,/g,
  gEOL: /[\r\n]+/g,
  word: /^\w+$/,
  gSpace: /\s+/g,
  numerical: /^(?:\d*\.)?\d+$/,
  gBracket: /([\[\]])/g,
  rule: /\(([^\)]*)\)\s*->\s*(\*|\w+)/,   // ( ... ) -> type
  gRuleArgsItem: /(\*|\w+)\s+(\w+)\s*(?:=\s*([^,\[\]]*))?/g
};

var doc = '' +
'/**' +
' * @rule ([int min]) => double' +
' */';

console.log(doc)