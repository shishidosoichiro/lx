var Lexer = require('../../lx');
var state = Lexer.state;
var shift = Lexer.shift;
var token = Lexer.token;
var push = Lexer.push;

var analyze = (function(){
  var content = Lexer()
  var head = Lexer()
  var attr = Lexer()
  attr.value = Lexer()

  content
  .match(/<([\w\.\:\-]+)/, shift, token('tag.head'), push, state(head))
  .match(/<\/([\w\.\:\-]+)>/, shift, token('tag.tail'), push)
  .other(token('text'), push)

  head
  .match(/\s+([\w\.\:\-]+)/, shift, token('attr.name'), push, state(attr))
  .match(/\/>/, token('tag.head.short.end'), push, state(content))
  .match(/>/, token('tag.head.end'), push, state(content))

  attr
  .match(/=/, token('attr.name.end'), push, state(attr.value))
  .match(/\/>/, token('tag.head.short.end'), push, state(content))
  .match(/>/, token('tag.head.end'), push, state(content))

  attr.value
  .match(/\"([^\"]+)\"/, shift, token('attr.value'), push, state(head))
  .match(/\'([^\']+)\'/, shift, token('attr.value'), push, state(head))
  .match(/[\w\.\:\-]+/, token('attr.value'), push, state(head))

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
}



