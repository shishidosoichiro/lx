var chai = require('chai');
var expect = chai.expect;

var Lexer = require('../index');
var state = Lexer.state;
var back = Lexer.back;
var shift = Lexer.shift;
var token = Lexer.token;
var push = Lexer.push;

describe('index', function(){

	describe('Lexer', function(){
		var xml
		before(function(){
			xml = (function(){
				var content = Lexer()
				var head = Lexer()
				var attr = Lexer()
				attr.value = Lexer()

				content
				.match(/<([\w\.\:\-]+)/, shift, token('tag.head'), push, state(head))
				.match(/<\/([\w\.\:\-]+)>/, shift, token('tag.tail'), push)
				.other(token('text'), push)

				head
				.match(/\s+([\w\.\:\-]+)/, shift, token('attr.name'), push, state(attr))
				.match(/\/>/, token('tag.head.shortend'), push, back)
				.match(/>/, token('tag.head.end'), push, back)

				attr
				.match(/=/, token('attr.name.end'), push, state(attr.value))
				.match(/\/>/, token('tag.head.shortend'), push, back, back)
				.match(/>/, token('tag.head.end'), push, back, back)

				attr.value
				.match(/\"([^\"]+)\"/, shift, token('attr.value'), push, back, back)
				.match(/\'([^\']+)\'/, shift, token('attr.value'), push, back, back)
				.match(/[\w\.\:\-]+/, token('attr.value'), push, back, back)

				return function(string){
					var context = {tokens: []};
					content(string, context);
					return context.tokens;
				}
			})();
		})

		it('', function(){
			var tokens = xml('<A><A a="b" c="d"></A><B></B>1 2=3 4<C e=\'f g\'  h=i/></A>');
			expect(tokens[0].toString()).to.equal('tag.head(0:A)')
			expect(tokens[1].toString()).to.equal('tag.head.end(2:>)')
			expect(tokens[2].toString()).to.equal('tag.head(3:A)')
			expect(tokens[3].toString()).to.equal('attr.name(5:a)')
			expect(tokens[4].toString()).to.equal('attr.name.end(7:=)')
			expect(tokens[5].toString()).to.equal('attr.value(8:b)')
			expect(tokens[6].toString()).to.equal('attr.name(11:c)')
			expect(tokens[7].toString()).to.equal('attr.name.end(13:=)')
			expect(tokens[8].toString()).to.equal('attr.value(14:d)')
			expect(tokens[9].toString()).to.equal('tag.head.end(17:>)')
			expect(tokens[10].toString()).to.equal('tag.tail(18:A)')
			expect(tokens[11].toString()).to.equal('tag.head(22:B)')
			expect(tokens[12].toString()).to.equal('tag.head.end(24:>)')
			expect(tokens[13].toString()).to.equal('tag.tail(25:B)')
			expect(tokens[14].toString()).to.equal('text(29:1 2=3 4)')
			expect(tokens[15].toString()).to.equal('tag.head(36:C)')
			expect(tokens[16].toString()).to.equal('attr.name(38:e)')
			expect(tokens[17].toString()).to.equal('attr.name.end(40:=)')
			expect(tokens[18].toString()).to.equal('attr.value(41:f g)')
			expect(tokens[19].toString()).to.equal('attr.name(46:h)')
			expect(tokens[20].toString()).to.equal('attr.name.end(49:=)')
			expect(tokens[21].toString()).to.equal('attr.value(50:i)')
			expect(tokens[22].toString()).to.equal('tag.head.shortend(51:/>)')
			expect(tokens[23].toString()).to.equal('tag.tail(53:A)')
		})
	})

	describe('helper methods', function(){
		var shift = Lexer.shift;
		var state = Lexer.state;
		var back = Lexer.back;
		var token = Lexer.token;
		var push = Lexer.push;

		it('#shift', function(){
			var input = ['a', 'b', 'c', 'd'];
			var output = shift.apply(null, input)
			expect(input[0]).to.equal('a');
			expect(input[1]).to.equal('b');
			expect(input[2]).to.equal('c');
			expect(input[3]).to.equal('d');
			expect(output[0]).to.equal('b');
			expect(output[1]).to.equal('c');
			expect(output[2]).to.equal('d');
		})
		it('#state', function(){
			var context = {state: 2, stack:[1]};
			state(3).call(context);
			expect(context.state).to.equal(3);
			expect(context.stack[0]).to.equal(1);
			expect(context.stack[1]).to.equal(2);
		})
		it('#back', function(){
			var context = {state: 3, stack:[1, 2]};
			back.call(context);
			expect(context.state).to.equal(2);
			expect(context.stack[0]).to.equal(1);
			expect(context.stack.length).to.equal(1);
		})
		it('#token', function(){
			var tkn = token('a')('b');
			expect(tkn.name).to.equal('a');
			expect(tkn.value).to.equal('b');
		})
		it('#push', function(){
			var context = {tokens: [1]};
			push.call(context, 2);
			expect(context.tokens.length).to.equal(2);
			expect(context.tokens[0]).to.equal(1);
			expect(context.tokens[1]).to.equal(2);
		})
	})
})