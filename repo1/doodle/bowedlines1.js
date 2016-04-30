(pj.require('bowedline1.js',function (erm,bowedLineC) {
var svg = pj.svg;


var item = svg.Element.mk('<g/>');
item.set("BowedLineP",bowedLineC.instantiate());

item.BowedLineP.__hide();
//pj.returnValue(undefined,item);
item.width = 400;
item.height = 100;
item.numLines = 20;
//item.height = 30;
item.lineSep = 10;
item.fill = 'yellow';
item.set('__signature',pj.Signature.mk({width:'N',height:'N',fill:'S'}));

item.set('lines', pj.Spread.mk(item.BowedLineP));

item.lines.binder = function (line,notUsed,indexInSeries,lengthOfDataSeries) {
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
  //line.stroke = this.fill;
 line.update();
  line.__show();
}

item.lines.binddd = function () {
  debugger;
  var n = this.count;
  var hin = n/2;
  var maxY = this.parent().height;
  var i;
  for (i=0;i<n;i++) {
    var y = this.parent().lineSep * i;
    var line = this.selectMark(i); 
    line.set('origin',pj.geom.Point.mk(0,y));
    var ht =  50 * (Math.random() - 0.5);
    if (y + ht < 0)  {
      ht = 0;
    }
    if (y + ht > maxY) {
      ht = 0;
    }
    line.height = ht;
    console.log('ht',line.height);
    line.update();
    line.__show();
  }
}
item.update = function () {
    debugger;
    this.BowedLineP.width = this.width;
    this.BowedLineP.BowedLine.stroke = this.fill;
    this.lineSep = this.height/this.numLines;
    var numLines = this.numLines;
    this.lines.count = numLines;
    this.lines.update();
    return;
    var data = [];
    var i;
  
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
