var chai = require('chai');
var expect = chai.expect;

var Lexer = require('../lx');
var state = Lexer.state;
var shift = Lexer.shift;
var token = Lexer.token;
var push = Lexer.push;

describe('lx.js', function(){

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
			.match(/\/>/, token('tag.head.shortend'), push, state(content))
			.match(/>/, token('tag.head.end'), push, state(content))

			attr
			.match(/=/, token('attr.name.end'), push, state(attr.value))
			.match(/\/>/, token('tag.head.shortend'), push, state(content))
			.match(/>/, token('tag.head.end'), push, state(content))

			attr.value
			.match(/\"([^\"]+)\"/, shift, token('attr.value'), push, state(head))
			.match(/\'([^\']+)\'/, shift, token('attr.value'), push, state(head))
			.match(/[\w\.\:\-]+/, token('attr.value'), push, state(head))

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