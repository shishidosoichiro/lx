var _ = module.exports = {
  noop: function noop(arg){
  	return arg
  },
  slice: function slice(array, begin, end){
    return Array.prototype.slice.call(array, begin, end);
  },
  array: function array(value){
    return value instanceof Array ? value : [value];
  },
  functionalize: function functionalize(src){
    return typeof src === 'function' ? src : function(){return src};
  },
  shift: function shift(){
    return _.slice(arguments, 1);
  },
  flow: function flow(functions){
    if (arguments.length > 1 && !(functions instanceof Array)) functions = _.slice(arguments);
    functions = functions.map(_.functionalize);
    return function(){
      var that = this
      return functions.reduce(function(args, f){
        return f.apply(that, _.array(args))
      }, _.slice(arguments))
    }
  },
  findIndex: function findIndex(array, callback, value){
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
  captureCount: function captureCount(src){
    return new RegExp('(?:' + _.source(src) + '|(any))').exec('any').length - 2;
  },
  source: function source(regex){
    if (typeof regex === 'undefined') return '';
    else if (typeof regex === 'string') return regex;
    else if (typeof regex !== 'object') return regex;
    else if (regex instanceof RegExp) return regex.source;
    else return regex.toString();
  },
  call: function call(src){
    if (typeof src === 'function') return src.call(this);
    return src;
  },
  inherits: function inherits(target, parent){
    for (var i in parent) {
      target[i] = parent[i];
    }
  },
};
