var chai = require('chai');
var expect = chai.expect;

var Store = require('../lib/store');

describe('lib/store', function(){

	it('#put and #get', function(){
		var store = Store();
		store.put(1, 'a');
		store.put(3, 'b');
		store.put(5, 'c');
		expect(store.get(3)).to.equal('b');
		expect(store.get(2)).to.be.undefined;
	})

	it('#regex', function(){
		var store = Store();
		store.put(1, {source: 'a'});
		store.put(3, {source: 'b'});
		store.put(5, {source: 'c'});
		expect(store.regex().source).to.equal('(?:(a)|(b)|(c))');
	})
})