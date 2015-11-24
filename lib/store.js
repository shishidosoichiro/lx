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

