(pj.require('rline1.js',function (erm,RLineP) {
var svg = pj.svg;


var item = svg.Element.mk('<g/>');

//pj.returnValue(undefined,item);

item.numLines = 10;

item.set("lines",pj.Array.mk());
item.lines.__unselectable = true;
item.jiggle = 10;
item.interval = 50; // interval between points
item.stroke = "blue";
item['stroke-width'] = 1;
item['stroke-opacity'] = 0.1;

item.set('__signature',pj.Signature.mk({stroke:'S','stroke-opacity':'N','stroke-width':'N'}));

/*
item.lines.binderr = function (line,notUsed,indexInSeries,lengthOfDataSeries) {
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
*/

item.setColor = function (color) {
  this.lines.forEach(function (line) {
    line.setColor(color);
  });
}


item.update = function () {
    debugger;
   // var lineProps = ['stoke','stroke-width','stroke-opacity'];
    pj.resetComputedArray(this,"lines");
    for (i=0;i<this.numLines;i++) {
      var rline = RLineP.instantiate();
      rline.jiggle = this.jiggle;
      rline.interval = this.interval;
      debugger;
      pj.transferState(rline.main,this);

      //pj.setProperties(rline.main,this,lineProps);
      rline.points = this.points;
      this.lines.push(rline);
      rline.update();
    }
}
pj.returnValue(undefined,item);

}))

/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|nonfunctional/lines1.js
*/
