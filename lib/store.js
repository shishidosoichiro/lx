var _ = require('./util');

var defaults = {
  flags: 'mg'
};

module.exports = Store;

function Store(options){
  options = options || {};
  _.inherits(options, defaults);
  var sources = [];
  var map = {};
  var wrap = function(src){
    return '(' + src + ')';
  }
  var _regex;
  var regex = function(){
    var source = '(?:' + sources.map(wrap).join('|') + ')';
    return new RegExp(source, options.flags);
  };

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
      _regex = regex();
    },
    regex: function(){
      _regex.lastIndex = 0;
      return _regex;
    }
  }
  return store;
}

