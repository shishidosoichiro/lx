;(function(factory){
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = factory();
	}
})(function(){
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
		functions = functions.map(functionalize);
		return function(){
			var that = this
			return functions.reduce(function(args, f){
				return f.apply(that, array(args))
			}, slice(arguments))
		}
	}
	var noop = function(arg){return arg};

	var matcher = function(arg){
		if (typeof arg === 'function') return arg;
		if (arg instanceof RegExp) return function(string){return arg.exec(string)};
		return function(){}
	}

	var Lexer = function(){
		var app = function(string){
			var context = {}
			context.state = app;
			context.index = 0;
			while (string != ''){
				string = context.state.lex.call(context, string);
			}
		};

		var rules = [];
		app.match = function(regex, action){
			rules.push({matcher: matcher(regex), action: flow(slice(arguments, 1))})
			return app;
		};
		var other = noop;
		app.other = function(){
			other = flow(slice(arguments, 1));
			return app;
		};
		app.lex = function(string){
			for (var i = 0; i < rules.length; i++) {
				var matcher = rules[i].matcher;
				var action = rules[i].action;
				var matched = matcher(string);
				if (!matched) continue;

				// unmatchd part
				if (matched.index != 0) {
					other.call(this, string.substring(0, matched.index));
				}

				// match part
				this.index += matched.index;
				action.apply(this, matched);
				return string.slice(matched.index + matched[0].length);
			}

			// unmatchd part
			other.call(this, string);
			return '';
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
		return this.name + '(' + value + ')';
	}
	Lexer.token = function(name){
		return function(value){
			return {name: name, value: value, toString: toString};
		}
	};
	return Lexer;
})
