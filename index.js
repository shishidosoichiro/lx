var _ = require('./lib/util');
var Store = require('./lib/store');

var defaults = {
  flags: 'mg'
};

var Lexer = module.exports = function Lexer(options){
  options = options || {};
  _.inherits(options, defaults);
  var app = function(string, context){
    context = context || {};
    context.state = app;
    context.index = 0;
    context.stack = [];
    while (string != ''){
      string = context.state.lex.call(context, string);
    }
  };

  var store = Store(options);

  var defined = function(arg){
    return arg != undefined;
  };
  var get = function(matched){
    var position = _.findIndex(matched.slice(1), defined) + 1;
    return store.get(position);
  };

  app.match = function(regex){
    var position = store.last.position + store.last.count;
    var src = _.source(regex);

    var rule = {
      source: src,
      action: _.flow(_.slice(arguments, 1)),
      count: _.captureCount(src) + 1,
      position: position
    }
    store.put(position, rule);
    return app;
  };
  var other = _.noop;
  app.other = function(){
    other = _.flow(_.slice(arguments));
    return app;
  };
  app.lex = function(string){
    if (store.last.position === 0) {
      other.call(this, string, this.index);
      return '';
    }
    var matched = store.regex.call(this).exec(string);
    if (!matched) {
      other.call(this, string, this.index);
      return '';
    }

    var rule = get(matched);
    var index = matched.index;

    // unmatchd part
    if (matched.index > 0) other.call(this, string.substring(0, matched.index));

    // matched part
    this.index += matched.index;
    var captured = matched.slice(rule.position, rule.position + rule.count);
    rule.action.apply(this, captured);

    this.index += matched[0].length;
    return string.substr(matched.index + matched[0].length);
  };
  return app;
};
Lexer.noop = _.noop;
Lexer.shift = _.shift;
Lexer.flow = _.flow;
Lexer.state = function state(state){
  return function(){
    this.stack.push(this.state);
    this.state = state;
  };
};
Lexer.back = function back(){
  this.state = this.stack.pop();
};
var toString = function(){
  return this.name + '(' + this.index + (typeof this.value === 'undefined' ? '' : ':' + this.value) + ')';
};
Lexer.token = function token(name){
  return function(value){
    return {name: name, value: value, index: this.index, toString: toString};
  };
};
Lexer.push = function push(token){
  this.tokens.push(token)
};
Lexer.raise = function raise(message){
  return function(string){
    var args = {};
    args.string = string;
    args.index = this.index;
    var error = new Error(message + ' ' + JSON.stringify(args));
    error.string = args.string;
    error.index = args.index;
    throw error;
  };
};
Lexer.Tokenizer = function Tokenizer(lexer){
  return function(string){
    var context = {tokens: []};
    lexer(string, context);
    return context.tokens;
  };
};
Lexer.Converter = function Converter(lexer){
  var tokenizer = Lexer.Tokenizer(lexer);
  return function(string){
    var tokens = tokenizer(string);
    return tokens.join('');
  };
};