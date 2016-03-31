(pj.require('doodle/bowedline1.js',function (erm,bowedLineC) {
var svg = pj.svg;


var item = svg.Element.mk('<g/>');
item.set("BowedLineP",bowedLineC.instantiate());

item.BowedLineP.__hide();
//pj.returnValue(undefined,item);
item.width = 1000;
item.height = 100;
item.numLines = 20;
//item.height = 30;
item.lineSep = 10;

item.set('lines', pj.Spread.mk(item.BowedLineP));

item.lines.binder = function (line,data,indexInSeries,lengthOfDataSeries) {
  var hin = lengthOfDataSeries/2;
  var y = this.parent().lineSep * indexInSeries;
  var maxY = this.parent().height;
  line.set('origin',pj.geom.Point.mk(0,y));
  //line.height = -(indexInSeries - hin) * 1 + 20 * Math.random();
  var ht =  50 * (Math.random() - 0.5);
  if (y+  ht < 0)  {
    ht = 0;//-ht;
  }
  if (y + ht > maxY) {
    ht = 0;// - ht;
  }
  line.height = ht;
  console.log('ht',line.height);
 line.update();
  line.__show();
}

item.update = function () {
    
    this.lineSep = this.height/this.numLines;
    var numLines = this.numLines;
    var data = [];
    var i;
    this.BowedLineP.width = this.width;
    for (i=0;i<numLines;i++) {
        data.push(0);
    }
    this.lines.setData(data,1);
}
pj.returnValue(undefined,item);

}))

/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|nonfunctional/lines1.js
*/
