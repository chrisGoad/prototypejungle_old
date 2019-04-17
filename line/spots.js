//okok

core.require('/shape/circle.js','/line/utils.js',function (spotPP,utils) {

let item = svg.Element.mk('<g/>');

item.spotP = core.installPrototype('spot',spotPP);
utils.setup(item);

item.spotP.fill = 'black';
item.spotP.dimension = 5;
item.spotP.stroke = 'transparent';
item.role = 'line';
//item.spotP.width = 10;
//item.spotP.height = 10;
item.numSpots = 5;
item.actualNumSpots = 0;
item.shownSpots = 0;
item.interval = 10;
item['stroke-width'] = 2;
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
    if (core.beginsWith(this.__parent.__sourceUrl,'/connector/')) {
      this.__parent.numSpots = numSpots;
    }
  } else {
    numSpots = this.numSpots;
  }
  let actualNum = this.actualNumSpots;
  let shownSpots = this.shownSpots;
  let spotP = this.spotP;
  if (shownSpots > 0) {
    spotP = Object.getPrototypeOf(this.s0); // so that the new prototype is used after a swap prototype
    spotP.dimension = this['stroke-width'];
    spotP.fill = this.stroke;
  }
  if (shownSpots < numSpots) {
    for (let i=shownSpots;i<numSpots;i++) {
      let nm = 's'+i;
      let spot = this[nm];
      if (spot) {
        spot.show();
      } else {
        spot = this.set(nm,spotP.instantiate()).show();
        spot.neverselectable = true;
        spot.undraggable = true;
        spot.__hideInUI = true;
      }
      
    }
    this.actualNumSpots = Math.max(actualNum,numSpots);
    this.shownSpots = numSpots;  
  } else if (numSpots < shownSpots) { 
  // } else if (numSpots < actualNum) { // until swapprototype preserves hiddens status
    for (let i=numSpots;i<shownSpots;i++) {
    //for (let i=numSpots;i<actualNum;i++) {
       let nm = 's'+i;
       let spot = this[nm];
       spot.hide();
     }
     this.shownSpots = numSpots;

  }
  let angle = Math.atan2(vec.y,vec.x) * (180/Math.PI);
  //let ln = vec.length();
  let step = vec.times(1/(numSpots-1));
  let pos = this.end0;
  for (let i=0;i<numSpots;i++) {
    let nm = 's'+i;
    let spot = this[nm];
    spot.show();
    spot.update();
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
 // utils.fromParent(this);
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

