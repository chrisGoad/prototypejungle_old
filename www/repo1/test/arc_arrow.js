
pj.require('../shape/arc_arrow.js',function (erm,shape) {
  var geom = pj.geom;
  var item = pj.svg.Element.mk('<g/>');
  
  item.set('shape',shape.instantiate());
  item.shape.label = 'X';
  item.shape.setEnds(geom.Point.mk(50,0),geom.Point.mk(100,100));
  //item.textarea.text = 'Hello hello hello';
  pj.returnValue(undefined,item);
});
/*
http://127.0.0.1:3000/edit.html?source=/repo1/test/arc_arrow.js

http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/bar.js
*/
