/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["Lexer"] = __webpack_require__(1);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2);
	var Store = __webpack_require__(3);

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
	  }
	  return app;
	};
	Lexer.noop = _.noop;
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
	Lexer.raise = function(message){
	  return function(arg){
	    var error = new Error(message)
	    error.arg = arg
	    throw error;
	  };
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

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
	    else if (typeof callback === 'undefined') {
	      found = array.some(function(el, i){
	        index = i;
	        return el
	      })
	    }
	    else if (typeof callback === 'string') {
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
	    else if (regex instanceof RegExp) return regex.source;
	    else return regex.toString();
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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2);

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



/***/ }
/******/ ]);