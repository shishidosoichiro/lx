;(function(factory){
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  }
})(function(){
  var noop = function(arg){return arg};
  var slice = function(array, begin, end){
    return Array.prototype.slice.call(array, begin, end);
  };
  var array = function(value){
    return value instanceof Array ? value : [value];
  };
  var functionalize = function(src){
    return typeof src === 'function' ? src : function(){return src};
  };
  var shift = function(){
    return slice(arguments, 1);
  };
  var flow = function(functions){
    if (arguments.length > 1 && !(functions instanceof Array)) functions = slice(arguments);
    functions = functions.map(functionalize);
    return function(){
      var that = this
      return functions.reduce(function(args, f){
        return f.apply(that, array(args))
      }, slice(arguments))
    }
  }
  var findIndex = function(array, callback, value){
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
  };
  var captureCount = function(src){
    return new RegExp('(?:' + source(src) + '|(any))').exec('any').length - 2;
  };
  var source = function(regex){
    if (typeof regex === 'undefined') return '';
    else if (typeof regex === 'string') return regex;
    else if (typeof regex !== 'object') return regex;

    if (regex instanceof RegExp) return regex.source;
    return regex.toString();
  };
  var call = function(src){
    if (typeof src === 'function') return src.call(this);
    return src;
  };
  var inherits = function(target, parent){
    for (var i in parent) {
      target[i] = parent[i];
    }
  };

  var defaults = {
    flags: 'mg'
  }
  var count = 0;

  var Lexer = function(options){
    options = options || {};
    inherits(options, defaults);
    var app = function(string, context){
      context = context || {};
      context.state = app;
      context.index = 0;
      while (string != ''){
        string = context.state.lex.call(context, string);
      }
    };
    var id = count++;

    var store = (function(){
      var sources = [];
      var map = {};

      return {
        map: map,
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
      }
    })();

    var get = function(matched){
      var position = findIndex(matched.slice(1)) + 1;
      return store.get(position);
    } 

    var regex = function(){
      var source = '(?:' + store.sources.map(function(src){
        return '(' + call.call(this, src) + ')';
      }, this).join('|') + ')';
      return new RegExp(source, options.flags);
    }
    app.match = function(regex){
      var position = store.last.position + store.last.count;
      var src = source(regex);

      var rule = {
        source: src,
        action: flow(slice(arguments, 1)),
        count: captureCount(src) + 1,
        position: position
      }
      store.put(position, rule);
      return app;
    };
    var other = noop;
    app.other = function(){
      other = flow(slice(arguments));
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
  Lexer.shift = shift;
  Lexer.state = function(state){
    return function(){
      this.state = state;
    }
  } 
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

  return Lexer;
})
