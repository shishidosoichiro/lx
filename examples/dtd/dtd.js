var Lexer = require('../../lx');
var state = Lexer.state;
var shift = Lexer.shift;
var token = Lexer.token;
var push = Lexer.push;

var analyze = (function(){
  var doctype = Lexer()
  var declare = Lexer()
  var parameter = Lexer()

  doctype
  .match(/<\!DOCTYPE\s+((?:\w|\.|\-|\_)+?)\s*\[/, shift(doctype), push, lex('ELEMENT and ATTLIST'))

  declare
  .match(/<\!(ELEMENT)\s+((?:\w|\.|\-|\_)+?)\s+((?:\w|\.|\-|\_)+?|EMPTY|ANY)\s*>/, shift(element), push, pop)
  .match(/<\!(ELEMENT)\s+((?:\w|\.|\-|\_)+?)\s+/, shift(element), push, lex('In a Element'))
  .match(/<\!(ATTLIST)\s+((?:\w|\.|\-|\_)+?)\s+/, shift(element), push, lex('In a Attribute List'))
  .match(/\]>/, pop)
  //  .match(/<\!ATTLIST\s+((?:\w|\.|\-|\_)+?)\s+((?:\w|\.|\-|\_)+?)\s+/, shift(attr), push, lex('Content Modal'))

  lexer.lex('In a Element')
  .match(/\(/, content, push, lex('Content Modal'))
  .match(/>/, pop)

  lexer.lex('Content Modal')
  .match(/\(/, content, push, lex('Content Modal'))
  .match(/\#PCDATA/, push, pop)
  .match(/\#CDATA/, push, pop)
  .match(/[^\|\,\&<>]+(?:\+|\*|\?)?\b/, push, pop)
  .match(/\|/, type('or'))
  .match(/\,/, type('seq'))
  .match(/\&/, type('and'))
  .match(/\)\+/, type('content+'), pop)
  .match(/\)\*/, type('content*'), pop)
  .match(/\)\?/, type('content?'), pop)
  .match(/\)/, pop)

  lexer.lex('In a Attribute List')
  .match(/((?:\w|\.|\-|\_)+?)\s+((?:\w|\.|\-|\_)+?)\s+(\"[^\"]+?\"|\#REQUIRED|\#IMPLIED|\#FIXED \"[^\"]+?\")/, shift(attr), push, pop)
  .match(/((?:\w|\.|\-|\_)+?)\b/, shift(attr), push, lex('In a Attribute'))
  .match(/>/, pop)

  lexer.lex('In a Attribute')
  .match(/\(/, content, push, lex('Enumerated Attribute Values'))
  .match(/(\"[^\"]+?\"|\#REQUIRED|\#IMPLIED|\#FIXED \"[^\"]+?\")/, shift(function(value){
    this.current.node.value = value;
  }), pop)

  lexer.lex('Enumerated Attribute Values')
  .match(/\(/, content, push, lex('Content Modal'))
  .match(/\#PCDATA/, push, pop)
  .match(/\#CDATA/, push, pop)
  .match(/(?:\w|\.|\-|\_)+(?:\+|\*|\?)?\b/, push, pop)
  .match(/\|/, type('or'))
  .match(/\)/, pop)

  return function(string){
    var context = {tokens: []};
    content(string, context);
    return context.tokens;
  }
})();

// convert tokens to vdom;
var construct = function(tokens){
  var stack = [];
  var top = {attrs: {}, children: []};
  var current = top;
  var attr;
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];        
    if (token.name === 'tag.head') {
      var tag = {tag: token.value, attrs: {}, children: [], index: token.index, status: 'head'};
      current.children.push(tag);
      stack.push(current);
      current = tag;
      attr = undefined;
    }
    else if (token.name === 'tag.head.end') {
      current.status = 'open';
      attr = undefined;
    }
    else if (token.name === 'tag.tail' && token.value === current.tag) {
      current.status = 'closed';
      current = stack[stack.length - 1];;
      stack.pop();
      attr = undefined;
    }
    else if (token.name === 'tag.head.short.end') {
      current.status = 'closed';
      current = stack[stack.length - 1];;
      stack.pop();
      attr = undefined;
    }
    else if (token.name === 'attr.name' && current.status != 'open') {
      current.attrs[token.value] = true;
      current.status = 'attr name: ' + token.value;
      attr = token;
    }
    else if (token.name === 'attr.name.end' && attr) {
      current.status = 'attr eq: ' + attr.value;
    }
    else if (token.name === 'attr.value' && attr) {
      var value = current.attrs[attr.value] = token.value;
      value.index = token.index;
      current.status = 'attr value: ' + attr.value;
      attr = undefined;
    }
    else if (token.name === 'text') {
      token.value.index = token.index;
      current.children.push(token.value);
      attr = undefined;
    }
  }
  return top.children;
};

module.exports = function(string){
  var tokens = analyze(string);
  return construct(tokens);
};
