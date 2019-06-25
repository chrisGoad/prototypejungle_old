//connectedSpots

core.require('/shape/circle.js','/line/utils.js',function (spotPP,utils) {

let item = svg.Element.mk('<g/>');

utils.setup(item);

/* adjustable parameters */
item.interval = 20;
item['stroke-width'] = 4;
item.stroke = 'black';
item.lineStroke = 'black';
item.lineWidth = 1;
/* end adjustable parameters */

item.shaftProperties = core.lift(['interval','stroke-width','stroke','lineStroke','lineWidth']);



item.initializePrototype = function () {
  core.assignPrototypes(this,'spotP',spotPP);
  let spotP = this.spotP
  spotP.stroke = 'transparent';
  spotP.fill = 'black';
  spotP.dimension = 5;
}

item.role = 'line';
item.numSpots = 5;
item.actualNumSpots = 0;
item.shownSpots = 0;
item.omitAtEnd0 = 0;
item.omitAtEnd1 = 0;

item.setEnds = function (e0,e1) {
  utils.setEnds(this,e0,e1);
}

item.set('end0',geom.Point.mk(-25,0));
item.set('end1',geom.Point.mk(25,0));


item.update = function () {
  let intv = this.interval;
  let numSpots;
  let vec = this.end1.difference(this.end0);
  let ln = vec.length();
  let nvec = vec.times(1/ln);
  if (intv) {
    numSpots = 2 + Math.floor(ln/intv);
  } else {
    numSpots = this.numSpots;
  }
  let actualNum = this.actualNumSpots;
  let shownSpots = this.shownSpots;
  let spotP = this.spotP;
  if (shownSpots < numSpots) {
    for (let i=shownSpots;i<numSpots;i++) {
      let nm = 's'+i;
      let spot = this[nm];
      if (spot) {
        spotP = 
        spot.show();
        if (i>0) {
          let lnm = 'l'+(i-1);
          let line = this[lnm];
          line.show();
        }
      } else {
        spot = this.set(nm,spotP.instantiate()).show();
        spot.neverselectable = true;
        if (i>0) {
          let lnm = 'l'+(i-1);
          let line = this.set(lnm,svg.Element.mk('<line/>'));
          line.neverselectable = true;
        }
      }
     
    }
    let lastSpot = this['s'+(numSpots-1)];
    this.spotP = Object.getPrototypeOf(lastSpot); // there may have been a swap
    this.actualNumSpots = Math.max(actualNum,numSpots);
    this.shownSpots = numSpots;
   } else if (numSpots < actualNum) { // until swapprototype preserves hiddens status
    for (let i=numSpots;i<actualNum;i++) {
       let nm = 's'+i;
       let spot = this[nm];
       spot.hide();
       let lnm = 'l'+(i-1);
       let line = this[lnm];
       line.hide();
     }
     this.shownSpots = numSpots;

  }
  let angle = Math.atan2(vec.y,vec.x) * (180/Math.PI);
  let step = vec.times(1/(numSpots-1));
  let pos = this.end0;
  let lastPos;
  let wd = this.s0.getWidth();
  let wvec = nvec.times(wd/2);
  for (let i=0;i<numSpots;i++) {
    let nm = 's'+i;
    let spot = this[nm];
    spot.fill = this.stroke;
    spot.dimension = this['stroke-width'];
    spot.show();
    spot.update();
    spot.moveto(pos,angle);
    lastPos = pos;
    pos = pos.plus(step);
    if (i < (numSpots - 1)) {
      let fromPoint = lastPos.plus(wvec);
      let toPoint = pos.difference(wvec);
      let lnm = 'l'+i;
      let line = this[lnm];
      line.show();
      line.stroke = this.lineStroke;
      line['stroke-width'] = this.lineWidth;
      line.setDomAttribute('x1',fromPoint.x);
      line.setDomAttribute('y1',fromPoint.y);
      line.setDomAttribute('x2',toPoint.x);
      line.setDomAttribute('y2',toPoint.y);
      line.draw();
    }
  }
   if (this.omitAtEnd0) {
    for (let i=0;i<this.omitAtEnd0;i++) {
      let spot = this['s'+i];
      if (spot) {
        spot.hide();
      }
      let line = this['l'+(i-1)];
      if (line) {
        line.hide();
      }
    }
  } 
  if (this.omitAtEnd1) {
    for (let i=(numSpots-this.omitAtEnd1);i<numSpots;i++) {
      let spot = this['s'+i];
      if (spot) {
        spot.hide();
      }
      let line = this['l'+ i];
      if (line) {
        line.hide();
      }
    }
   if (this.text  && this.__parent.updateText) {
    this.__parent.updateText(this.text);
   }
  }
}

item.controlPoints = function () {
  return utils.controlPoints(this);
}

item.updateControlPoint = function (idx,rpos) {
   utils.updateControlPoint(this,idx,rpos);
}

ui.hide(item,['end0','end1']);
item.setFieldType('lineStroke','svg.Rgb');

return item;
});

