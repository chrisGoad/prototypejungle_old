//spots

core.require('/shape/circle.js','/line/utils.js',function (spotPP,utils) {

let item = svg.Element.mk('<g/>');


utils.setup(item);

/* adjustable parameters */
item.interval = 10;
item['stroke-width'] = 4;
item.stroke = 'black';
/* end adjustable parameters */

item.numSpots = 5;

item.initializePrototype = function () {
  core.assignPrototypes(this,'spotP',spotPP);
  this.spotP.stroke = 'transparent';
}

 

item.role = 'line';
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
  if (intv) {
    let ln = vec.length();
    numSpots = 2 + Math.floor(ln/intv);
    this.numSpots = numSpots;
    let src = this.__parent.__sourceUrl;
    if (src && core.beginsWith(src,'/connector/')) {
      this.__parent.numSpots = numSpots;
    }
  } else {
    numSpots = this.numSpots;
  }
  let actualNum = this.actualNumSpots;
  let shownSpots = this.shownSpots;
  let spotP = this.spotP;
  if (shownSpots < numSpots) {
    for (let i=0;i<numSpots;i++) {
     let nm = 's'+i;
      let spot = this[nm];
      if (spot) {
        spot.show();
      } else {
        spot = this.set(nm,spotP.instantiate()).show();
        spot.unselectable = true;
        spot.undraggable = true;
        spot.__hideInUI = true;
      }
      
    }
    this.actualNumSpots = Math.max(actualNum,numSpots);
    this.shownSpots = numSpots;  
  } else if (numSpots < shownSpots) { 
    for (let i=numSpots;i<shownSpots;i++) {
       let nm = 's'+i;
       let spot = this[nm];
       spot.hide();
     }
     this.shownSpots = numSpots;

  }
  let angle = Math.atan2(vec.y,vec.x) * (180/Math.PI);
  let step = vec.times(1/(numSpots-1));
  let pos = this.end0;
  for (let i=0;i<numSpots;i++) {
    let nm = 's'+i;
    let spot = this[nm];
    spot.dimension = this['stroke-width'];
    spot.fill = this.stroke;
    spot.show();
    spot.updateAndDraw();
    spot.moveto(pos,angle);
    pos = pos.plus(step);
  }
  if (this.omitAtEnd0) {
    for (let i=0;i<this.omitAtEnd0;i++) {
      let spot = this['s'+i];
      if (spot) {
        spot.hide();
      }
    }
  } 
  if (this.omitAtEnd1) {
    for (let i=(numSpots-this.omitAtEnd1);i<numSpots;i++) {
      let spot = this['s'+i];
      if (spot) {
        spot.hide();
      }
    }
  } 
  if (this.text) {
    this.__parent.updateText(this.text);
  }
}

item.controlPoints = function () {
  return utils.controlPoints(this);
}

item.updateControlPoint = function (idx,rpos) {
   utils.updateControlPoint(this,idx,rpos);
}

ui.hide(item,['end0','end1']);

return item;
});

