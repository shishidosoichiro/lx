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
