var vdom = require('./vdom');

console.log(JSON.stringify(vdom('<A><A a="b" c="d"></A><B></B>1 2=3 4<C e=\'f g\'  h=i/></A>'), null, 2));
