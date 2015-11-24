(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var _ = require('./util');
var Store = require('./store');

var defaults = {
  flags: 'mg'
};

var Lexer = module.exports = function(options){
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

  var get = function(matched){
    var position = _.findIndex(matched.slice(1)) + 1;
    return store.get(position);
  } 

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
    var matched = regex.call(this).exec(string);
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
  }
  return app;
};
Lexer.shift = _.shift;
Lexer.state = function(state){
  return function(){
    this.stack.push(this.state);
    this.state = state;
  }
}; 
Lexer.back = function(){
  this.state = this.stack.pop();
};
var toString = function(){
  return this.name + '(' + this.index + (typeof this.value === 'undefined' ? '' : ':' + this.value) + ')';
}
Lexer.token = function(name){
  return function(value){
    return {name: name, value: value, index: this.index, toString: toString};
  }
};
Lexer.push = function(token){
  this.tokens.push(token)
};
Lexer.noop = _.noop;
Lexer.raise = function(message){
  return function(arg){
    var error = new Error(message)
    error.arg = arg
    throw error;
  };
};

},{"./store":2,"./util":3}],2:[function(require,module,exports){
var _ = require('./util');

var defaults = {
  flags: 'mg'
};

module.exports = function(options){
  options = options || {};
  _.inherits(options, defaults);
  var sources = [];
  var map = {};
  var wrap = function(src){
    return '(' + _.call.call(this, src) + ')';
  }

  var store = {
    sources: sources,
    last: {position: 0, count: 1},
    get: function(key){
      return map[key];
    },
    put: function(key, rule){
      map[key] = rule;
      sources.push(rule.source)
      this.last = rule;
    },
    regex: function(){
      var source = '(?:' + store.sources.map(wrap, this).join('|') + ')';
      return new RegExp(source, options.flags);
    }
  }
  return store;
}


},{"./util":3}],3:[function(require,module,exports){
var _ = module.exports = {
  noop: function(arg){
  	return arg
  },
  slice: function(array, begin, end){
    return Array.prototype.slice.call(array, begin, end);
  },
  array: function(value){
    return value instanceof Array ? value : [value];
  },
  functionalize: function(src){
    return typeof src === 'function' ? src : function(){return src};
  },
  shift: function(){
    return _.slice(arguments, 1);
  },
  flow: function(functions){
    if (arguments.length > 1 && !(functions instanceof Array)) functions = _.slice(arguments);
    functions = functions.map(_.functionalize);
    return function(){
      var that = this
      return functions.reduce(function(args, f){
        return f.apply(that, _.array(args))
      }, _.slice(arguments))
    }
  },
  findIndex: function(array, callback, value){
    var index;
    var found;
    if (typeof callback === 'function') {
      found = array.some(function(el, i){
        index = i;
        return callback.apply(this, arguments)
      })
    }
    if (typeof callback === 'undefined') {
      found = array.some(function(el, i){
        index = i;
        return el
      })
    }
    if (typeof callback === 'string') {
      found = array.some(function(el, i){
        index = i;
        return el[callback] == value
      })
    }
    return found ? index : undefined;
  },
  captureCount: function(src){
    return new RegExp('(?:' + _.source(src) + '|(any))').exec('any').length - 2;
  },
  source: function(regex){
    if (typeof regex === 'undefined') return '';
    else if (typeof regex === 'string') return regex;
    else if (typeof regex !== 'object') return regex;

    if (regex instanceof RegExp) return regex.source;
    return regex.toString();
  },
  call: function(src){
    if (typeof src === 'function') return src.call(this);
    return src;
  },
  inherits: function(target, parent){
    for (var i in parent) {
      target[i] = parent[i];
    }
  },
};

},{}]},{},[1]);
