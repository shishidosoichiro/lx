var chai = require('chai');
var expect = chai.expect;

var Lexer = require('../lx');
var state = Lexer.state;
var shift = Lexer.shift;
var token = Lexer.token;
var log = function(){
	console.log(arguments);
	return arguments;
};

describe('lx.js', function(){

	var xml;
	before(function(){
		xml = function(string){
			var tokens = []
			var push = tokens.push.bind(tokens);

			var head = Lexer()
			.match(/[\w\.\:\-]+/, token('attr.name'), push, state(attr))
			.match(/>/, shift, token('tag.head.end'), push, state(body))

			var attr = Lexer()
			.match(/=/, token('attr.name.end'), push, state(value))
			.match(/>/, token('tag.head.end'), push, state(body))
			attr.name = 'attr'

			var value = Lexer()
			.match(/\"([^\"]+)\"/, shift, token('attr.value'), push, state(head))
			.match(/\'([^\']+)\'/, shift, token('attr.value'), push, state(head))
			.match(/[\w\.\:\-]+/, token('attr.value'), push, state(head))

			var body = Lexer()
			.match(/<([\w\.\:\-]+)/, shift, token('tag.head'), push, state(head))
			.match(/<\/([\w\.\:\-]+)>/, shift, token('tag.tail'), push)

			body(string);
			return tokens;
		};
	})

	it('', function(){
		var tokens = xml('<A><A a="b" c="d"></A><B></B><C e=\'f\'/></A>');
		console.log(tokens);
	})
})