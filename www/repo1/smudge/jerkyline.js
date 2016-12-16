pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;

var item = svg.Element.mk('<g/>');

item.set("__contents",
 // svg.Element.mk('<path fill="none" stroke="black"  stroke-opacity="0.2" stroke-linecap="round" stroke-width="15"/>'));
  svg.Element.mk('<path fill="none" stroke="black"  stroke-opacity="0.2" stroke-linecap="round" stroke-width="2.5"/>'));

//item.set("polyline",
//  svg.Element.mk('<polyline fill="none" stroke="blue"  stroke-opacity="0.5" stroke-linecap="round"  stroke-width="1"/>'));
item.numSegments = 5;
item.stroke = 'blue';
item['stroke-width'] = 1;
item.set("end0",pj.geom.Point.mk(0,0));
item.set("end1",pj.geom.Point.mk(50,0));
item.randomFactor = 12;
item.minSepFactor = 0.3;  
item.__contents.__unselectable = true;
//item.strokeWidth = 1;
item.update = function () {
  var points = pj.Array.mk();
  var ns = this.numSegments;
  var vec = this.end1.difference(this.end0);
  var ln = vec.length();
  var unit = vec.times(1/ln);
  var nrm = unit.normal();
  var distancesAlong = [];
  var distancesToSide = [];
 // console.log('randomFactor',this.randomFactor);
  for (var n = 0; n<=ns;n++) {
    if (n === 0) {
      var dal = 0;
    } else if (n===ns) {
      dal = ln;
    } else {
      dal = ln* Math.random();
    }
    distancesAlong.push(dal);
    //var r = Math.random();
    //distancesToSide.push(this.randomFactor *  (r - 0.5));
  }
  var compareNumbers = function(a,b) {
    return a - b;
  }
  distancesAlong.sort(compareNumbers);
  //console.log('dal0',distancesAlong);
  /* now prune points that are too close to each other */
  var prunedDal = []; 
  var findNext = function (i,d) {
    var cd = distancesAlong[i];
    var nxti = i+1;
    if (nxti>=ns) {
      return;
    }
    while ((distancesAlong[nxti]-cd) < d) {
      nxti++;
      if (nxti>=ns) {
       return;
      }
    }
    return nxti;
  }
  debugger;
  prunedDal.push(0);
  var dist = this.minSepFactor * ln;
  //var ci = 0;
  var nxt = findNext(0,dist);
  var last;
  while (nxt) {
    prunedDal.push(distancesAlong[nxt]);
    last = nxt;
    nxt = findNext(nxt,dist);
  }
 
  //console.log('dal1',prunedDal);

  //var nxt = findNext(ci,dist);
  var prunedLn = prunedDal.length;
   if (last !== ns) {
    prunedDal[prunedLn-1] = ln;
  }
  for (n = 0; n<prunedLn;n++) {
    var r = Math.random();
    var rf = ((n===0) || (n=== prunedLn-1))?0.75* this.randomFactor:this.randomFactor;
    distancesToSide.push(rf *  (r - 0.5));
  }
  //console.log('distancesAlong',distancesAlong);
  points.push(this.end0.copy());
  //console.log('start');
  var d = '';//M '+this.end0.x+' '+this.end1.y;
  for (n=0;n<prunedLn;n++) {
    var alongLine = unit.times(prunedDal[n]).plus(this.end0);
    
    var v = nrm.times(distancesToSide[n]);
    
    var p = alongLine.plus(v);
    
    //console.log(distancesAlong[n],distancesToSide[n]);
    var cmd = (n===0)?'M ':' L ';
    d += cmd+p.x+' '+p.y;
    //points.push(p.plus(v));
  }
 //console.log('finish',d);
  this.__contents.stroke = this.stroke;
  this.__contents['stroke-width'] = this['stroke-width'];
  this.__contents.d = d;

 // points.push(this.end1.copy());
 // this.polyline.set("points",pj.svg.toSvgPoints(points));
}
return item;
});

/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|nonfunctional/lines1.js
*/
