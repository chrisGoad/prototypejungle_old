
pj.require('text/textarea1.js',function (erm,textareaP) {
  var item = pj.svg.Element.mk('<g/>');
  item.set('textarea',textareaP.instantiate());
  item.textarea.text = 'Hello hello hello';
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/bar.js
*/
