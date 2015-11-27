var chai = require('chai');
var expect = chai.expect;

var _ = require('../lib/util');

describe('lib/util', function(){

	it('#noop', function(){
		var input = 'a';
		var output = _.noop(input)
		expect(output).to.equal(input);
	})

	it('#slice', function(){
		var input = ['a', 'b', 'c', 'd'];
		var output = _.slice(input, 1, 3)
		expect(output.length).to.equal(2);
		expect(output[0]).to.equal(input[1]);
		expect(output[1]).to.equal(input[2]);
	})

	it('#array', function(){
		var input1 = ['a', 'b', 'c', 'd'];
		var output1 = _.array(input1)
		expect(output1).to.equal(input1);
		var input2 = 'a';
		var output2 = _.array(input2)
		expect(output2[0]).to.equal(input2);
	})

	it('#functionalize', function(){
		var input1 = 'a';
		var output1 = _.functionalize(input1)
		expect(output1()).to.equal(input1);
		var input2 = function(){return 'b';};
		var output2 = _.functionalize(input2)
		expect(output2()).to.equal(input2());
	})

	it('#shift', function(){
		var input = ['a', 'b', 'c', 'd'];
		var output = _.shift.apply(null, input)
		expect(input[0]).to.equal('a');
		expect(input[1]).to.equal('b');
		expect(input[2]).to.equal('c');
		expect(input[3]).to.equal('d');
		expect(output[0]).to.equal('b');
		expect(output[1]).to.equal('c');
		expect(output[2]).to.equal('d');
	})

	describe('#flow', function(){
		it('normal', function(){
			var a = 'a';
			var b = function(arg){return arg + 'b'};
			var c = function(arg){return arg + 'c'};
			var output = _.flow(a, b, c);
			expect(output(1)).to.equal('abc');
		})
		it('array', function(){
			var a = 'a';
			var b = function(arg){return arg + 'b'};
			var c = function(arg){return arg + 'c'};
			var output = _.flow([a, b, c]);
			expect(output(1)).to.equal('abc');
		})
		it('value', function(){
			var a = function(arg){return arg + 'a'};
			var b = function(arg){return arg + 'b'};
			var c = function(arg){return arg + 'c'};
			var output = _.flow(a, b, c);
			expect(output(1)).to.equal('1abc');
		})
	})

	describe('#findIndex', function(){
		it('function style', function(){
			var input1 = [
				{
					id: 1,
					name: 'a'
				},
				{
					id: 2,
					name: 'b'
				}
			];
			var output1 = _.findIndex(input1, function(item){
				return item.name === 'b';
			});
			expect(output1).to.equal(1);
		})
		it('boolean style', function(){
			var input1 = [false, true, true];
			var output1 = _.findIndex(input1);
			expect(output1).to.equal(1);
		})
		it('name-value style', function(){
			var input1 = [
				{
					id: 1,
					name: 'a'
				},
				{
					id: 2,
					name: 'b'
				}
			];
			var output1 = _.findIndex(input1, 'name', 'b');
			expect(output1).to.equal(1);
		})
		it('not found', function(){
			var input1 = [
				{
					id: 1,
					name: 'a'
				},
				{
					id: 2,
					name: 'b'
				}
			];
			var output1 = _.findIndex(input1, 'name', 'c');
			expect(output1).to.be.undefined;
		})
	})

	describe('#source', function(){
		it('undefined', function(){
			var input = undefined;
			var output = _.source(input);
			expect(output).to.equal('');
		});
		it('string', function(){
			var input = 'a';
			var output = _.source(input)
			expect(output).to.equal(input);
		});
		it('not object', function(){
			var input = 1;
			var output = _.source(input)
			expect(output).to.equal(input);
		});
		it('regex', function(){
			var input = /a/;
			var output = _.source(input)
			expect(output).to.equal(input.source);
		});
		it('object', function(){
			var input = {toString: function(){return 'a'}};
			var output = _.source(input)
			expect(output).to.equal(input.toString());
		});
	})

	it('#captureCount', function(){
		var input = /a(b)((c)(d)e)f/;
		var output = _.captureCount(input);
		expect(output).to.equal(4);
	})

	describe('#call', function(){
		it('not function', function(){
			var input = 'a';
			var output = _.call(input);
			expect(output).to.equal(input);
		});
		it('function', function(){
			var input = function(){return 'a'};
			var output = _.call(input)
			expect(output).to.equal(input());
		});
	})

	it('#inherits', function(){
		var parent = {a: 'b'};
		var input = {c: 'd'};
		var output = _.inherits(input, parent);
		expect(input.a).to.equal(parent.a);
		expect(input.c).to.equal(input.c);
	})
})