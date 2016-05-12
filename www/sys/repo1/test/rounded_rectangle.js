
pj.require('../shape/rounded_rectangle1.js',function (erm,rectangle) {
  var item = pj.svg.Element.mk('<g/>');
  
  item.set('rectangle',rectangle.instantiate());
  //item.textarea.text = 'Hello hello hello';
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/bar.js
*/
