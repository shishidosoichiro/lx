var Lexer = require('../../lx');
var state = Lexer.state;
<<<<<<< HEAD
var back = Lexer.back;
var shift = Lexer.shift;
var token = Lexer.token;
var push = Lexer.push;
var noop = Lexer.noop;
var raise = Lexer.raise;

var tokenize = (function(){
  var content = Lexer()
  var doctype = Lexer()
  var node = Lexer()
  var element = Lexer()
  element.arg = Lexer()
  element.arg.category = Lexer()
  element.arg.content = Lexer()
  element.end = Lexer()
  var attribute = Lexer()
  var arg = Lexer()

  doctype
  .match(/<\!DOCTYPE\s+([\w\.\:\-]+)\s+\[/, shift, token('DOCTYPE'), push, state(node))
  .match(/\s+/, noop)
  .other(raise('unexpected statement.'))


  node
  .match(/<\!(ELEMENT)\s+/, shift, token('ELEMENT'), push, state(element))
  .match(/<\!(ATTRIBUTE)\s+/, shift, token('ATTRIBUTE'), push, state(attribute))
  .match(/\]>/, token('DOCTYPE.END'), push, back)
  .match(/\s+/, noop)
  .other(raise('unexpected node declare.'))

  element
  .match(/^([\w\.\:\-]+)\s+/, shift, token('ELEMENT.NAME'), push, state(element.arg))
  .match(/\s+/, noop)
  .other(raise('unexpected node name.'))

  element.arg
  .match(/^(EMPTY|ANY)\s+/, shift, token('ELEMENT.CATEGORY'), push, state(element.end))
  .match(/^(?=\()/, token('ELEMENT.CONTENT'), push, state(element.content))
  .match(/\s+/, noop)
  .other(raise('unexpected arg.'))

  element.end
  .match(/^>/, token('ELEMENT.END'), push, state(element.node))
  .match(/\s+/, noop)
  .other(raise('should be end statement ">".'))

  element.content
  .match(/\(/, shift, token('content.open'), push)
  .match(/[\w\.\:\-]+/, shift, token('content.child'), push, state(element.content.sus))
  .match(/\,/, shift, token('content.sequence'), push)
  .match(/\|/, shift, token('content.or'), push)
  .match(/\)/, shift, token('content.close'), state(element.content.sus))
  .match(/\s+/, noop)
  .other(raise('unexpected content.'))

  arg
  .match(/\"([^\"]+)\"/, shift, token('attr.value'), push, back, back)
  .match(/\'([^\']+)\'/, shift, token('attr.value'), push, back, back)
  .match(/[\w\.\:\-]+/, token('attr.value'), push, back, back)
=======
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
>>>>>>> FETCH_HEAD

  return function(string){
    var context = {tokens: []};
    content(string, context);
    return context.tokens;
  }
})();

// convert tokens to vdom;
<<<<<<< HEAD
var build = function(tokens){
=======
var construct = function(tokens){
>>>>>>> FETCH_HEAD
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
<<<<<<< HEAD
  var tokens = tokenize(string);
  return build(tokens);
=======
  var tokens = analyze(string);
  return construct(tokens);
>>>>>>> FETCH_HEAD
};
