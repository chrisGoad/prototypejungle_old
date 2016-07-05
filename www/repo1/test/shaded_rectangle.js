
pj.require('../shape/shaded_rectangle1.js',function (erm,shape) {
  var item = pj.svg.Element.mk('<g/>');
  
  item.set('shape',shape.instantiate());
  //item.textarea.text = 'Hello hello hello';
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/bar.js
*/
