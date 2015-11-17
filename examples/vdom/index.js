var vdom = require('./vdom');

var xml = '<A><A a="b" c="d"></A><B></B>1 2=3 4<C e=\'f g\'  h=i/></A>';
console.log('xml: ' + xml);
console.log('vdom: ');
console.log(JSON.stringify(vdom(xml), null, 2));
