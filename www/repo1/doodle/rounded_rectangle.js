
pj.require('../shape/rounded_rectangle1.js',function (erm,rectangle) {
  var item = pj.svg.Element.mk('<g/>');
  
  var rectangleP = item.set('rectangleP',rectangle.instantiate().__hide());
  item.set('rectangles',pj.Array.mk());
  const cols= 2;
  const rows = 2;
  const rowSep = 30;
  const colSep = 30;
  rectangleP.width = 10;
  rectangleP.height = 20;
  var  i,j;
  for (i = 0;i<rows;i++) {
    for (j = 0;j<cols;j++) {
      var r = rectangleP.instantiate().__show();
      item.rectangles.push(r);
      r.__moveto(j*colSep,i*rowSep);
    }
  }
  //item.textarea.text = 'Hello hello hello';
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/bar.js
*/
