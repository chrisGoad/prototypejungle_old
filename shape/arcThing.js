core.require('/shape/shadedCircle.js',function (circlePP) {
  debugger;
let item =  svg.Element.mk('<g/>');

item.segWidth = 30;
item.armWidth = 10;
item.gap =5
item.circleRadiusFraction = 0.75;


item.initialize = function () {
   this.circleP = core.installPrototype(circlePP); 
   this.set('segP',svg.Element.mk('<path fill="blue" stroke="transparent" stroke-width = "1"/>'));
   this.set('segments',core.ArrayNode.mk());
   for (let i=0;i<4;i++) {
     this.segments.push(this.segP.instantiate());
   }
   this.set('circle',this.circleP.instantiate().show());

}

item.updateSegment = function (seg,which) {
   debugger;
   
  
  const p2str = function (letter,point) {
    return letter+' '+core.nDigits(point.x,5)+' '+core.nDigits(point.y,5)+' ';
  }
  let gap = this.gap;
  let segWidth = this.segWidth;
  let armWidth = this.armWidth;
  const flip = function (RL,UD,pnt) {
    return Point.mk(RL?-pnt.x:pnt.x,UD?-pnt.y:pnt.y);
  } 
  let RL,UD;
  if (which === 'UL') {
    RL = 0;
    UD = 0;
  } else if (which === 'LL') {
    RL = 0;
    UD = 1;
  } else if (which === 'UR') {
    RL = 1;
    UD = 0;
  } else if (which === 'LR') {
    RL = 1;
    UD = 1;
  }
    
  let UO = flip(RL,UD,Point.mk(-segWidth-gap,-segWidth-gap)); //Upper Outer 
  let LO = flip(RL,UD,Point.mk(-segWidth-gap,-gap));
  let LI = flip(RL,UD,Point.mk(-(segWidth-armWidth)-gap,-gap));
  let RI = flip(RL,UD,Point.mk(-gap,-(segWidth-armWidth)-gap));
  let RO = flip(RL,UD,Point.mk(-gap,-segWidth-gap));
  let radius = Math.sqrt(2) * gap + segWidth - armWidth;
  this.radius = radius;
    
 
  let path = p2str('M',UO);
  //path += `A ${this.innerRadius} ${this.innerRadius} 0 0 1`;
  //path += p2str(' ',innerEnd);
  path += p2str('L',LO);
  path += p2str('L',LI);
  if (which === 'UL') {
    path += `A ${radius} ${radius} 0 0 1`;
  } else if (which === 'LL') {
    path += `A ${radius} ${radius} 0 0 0`;
  } else if (which === 'UR') {
    path += `A ${radius} ${radius} 0 0 0`;
  } else if (which === 'LR') {
    path += `A ${radius} ${radius} 0 0 1`;
  }
  path += p2str(' ',RI);
  path += p2str('L',RO);
  path += p2str('L',UO);
  seg.d = path;
}

item.update = function () {
  let segs = this.segments;
  this.updateSegment(segs[0],'UL');
  this.updateSegment(segs[1],'LL');
  this.updateSegment(segs[2],'UR');
  this.updateSegment(segs[3],'LR');
  if (this.circle) { // in case it was deleted
     this.circle.dimension = 2* this.radius * this.circleRadiusFraction;
  }

}

return item;
});


