
pj.require('../text/textbox1.js',function (erm,textboxP) {
  var item = pj.svg.Element.mk('<g/>');
  
  item.set('textbox',textboxP.instantiate());
  //item.textarea.text = 'Hello hello hello';
  item.set("ref",pj.svg.Element.mk(
   '<rect x="0" y="0" width="10" height="10" stroke="black" '+
   ' stroke-width="2" fill="blue"/>'));
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/bar.js
*/
