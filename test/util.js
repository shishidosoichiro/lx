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
})