pj.require('/smudge/jerkyline.js',function (jerkyLineC) {
var svg = pj.svg;


var item = svg.Element.mk('<g/>');
item.set("JerkyLineP",jerkyLineC.instantiate());

item.JerkyLineP.__hide();
//pj.returnValue(undefined,item);
item.set("end0",pj.geom.Point.mk(0,0));
item.set("end1",pj.geom.Point.mk(50,50));
item.randomFactor = 2;

item.numLines = 50;
//item.height = 30;
item.lineSep = 10;
item.stroke = 'blue';
//item.drawVertically = false;
//item.set('__signature',pj.Signature.mk({width:'N',height:'N',fill:'S'}));

item.set('lines', pj.Spread.mk(item.JerkyLineP));
item.lines.__unselectable = true;
item.lines['stroke-width'] = 15;

item.lines.bind = function () {
  debugger;
  var lines = this.__parent;
  var end0 = lines.end0;
  var end1 = lines.end1;
  var n = this.count;
  for (var i=0;i<n;i++) {
    var line = this.selectMark(i);
    line.randomFactor = lines.randomFactor;
    line['stroke-width'] = lines['stroke-width'];
    line.stroke = lines.stroke;
    line.set('end0',end0.copy());
    line.set('end1',end1.copy());
    line.update();
    line.__show();
  }
}
item.update = function () {
    debugger;
    this.lines.count = this.numLines;
    this.lines.update();
}
return item;
});

/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|nonfunctional/lines1.js
*/
