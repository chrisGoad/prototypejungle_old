(pj.require('bowedline.js',function (erm,bowedLineC) {
var svg = pj.svg;


var item = svg.Element.mk('<g/>');
item.set("BowedLineP",bowedLineC.instantiate());

item.BowedLineP.__hide();
//pj.returnValue(undefined,item);
item.width = 400;
item.height = 100;
//item.width = 100;
//item.height= 400;
item.numLines = 20;
//item.height = 30;
item.lineSep = 10;
item.fill = 'blue';
item.drawVertically = false;
item.set('__signature',pj.Signature.mk({width:'N',height:'N',fill:'S'}));

item.set('lines', pj.Spread.mk(item.BowedLineP));
item.lines.__unselectable = true;

item.lines.bind = function () {
  debugger;
  var n = this.count;
  var hin = n/2;
  var parent = this.__parent;
  var vertical = parent.drawVertically
  var maxY = vertical?parent.width:parent.height;
  var hmaxY = 0.5*maxY;
  var mhwidth = -0.5*(vertical?parent.height:parent.width);
  var i;
  for (i=0;i<n;i++) {
    var y = parent.lineSep * i;
    var line = this.selectMark(i); 
    line.set('origin',vertical?pj.geom.Point.mk(y-hmaxY,mhwidth):pj.geom.Point.mk(mhwidth,y-hmaxY));
    var ht =  50 * (Math.random() - 0.5);
    if (y + ht < 0)  {
      ht = 0;
    }
    if (y + ht > maxY) {
      ht = 0;
    }
    if (vertical) {
      line.width = ht;
    } else {
      line.height = ht;
    }
    line.vertical = vertical;
    console.log('ht',line.height);
    line.update();
    line.__show();
  }
}
item.update = function () {
    debugger;
    var vertical = this.drawVertically
    if (vertical) {
      this.BowedLineP.height = this.height;
      this.lineSep = this.width/this.numLines;
    } else {
      this.BowedLineP.width = this.width;
      this.lineSep = this.height/this.numLines;
    }
    this.BowedLineP.BowedLine.stroke = this.fill;
    var numLines = this.numLines;
    this.lines.count = numLines;
    this.lines.update();
}
pj.returnValue(undefined,item);

}))

/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|nonfunctional/lines1.js
*/
