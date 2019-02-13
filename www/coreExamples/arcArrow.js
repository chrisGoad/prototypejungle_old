// Arc Arrow


core.require('/coreExamples/solidHead.js',function (arrowHeadP) {
let item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.text = '';
item.stroke= "black";
item['stroke-width'] = 2;
item.clockwise = 1;
item.headLength = 10;
item.headWidth = 8;
item.headGap = 0; // arrow head falls short of e1 by this amount
item.tailGap = 0; // tail of arrow  is this far out from e0
item.straight = false; // dont make this an arc after all (a good option for middle children in trees)
item.radius = 0.8; // radius of the arc as a multiple of arrow length
item.set("end0",Point.mk(0,0));
item.set("end1",Point.mk(35,0));
item.includeEndControls = true;

/* end adjustable parameters */


item.setEnds = function (p0,p1) {
  this.setPointProperty('end0',p0);
  this.setPointProperty('end1',p1);
}

let transferredProperties = ['text','stroke','stroke-width','headLength','headWidth','headGap','tailGap',
                             'radius','includeEndControls'];


item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,transferredProperties,own);
}

item.totalHeadGap = 0; // if defined, item.vertexHeadGap is added to item.headGap to yield the totaHeadGap
                      // vertexGap is the distance from where the arc hits the vertex, and its center
item.totalTailGap = 0; //similarly
item.vertexHeadGap = 0;
item.vertexTailGap = 0;

item.role = 'edge';

item.set("shaft",svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="1"/>'));

item.shaft.unselectable = true;
item.shaft.show();


item.set('head',arrowHeadP.instantiate());
item.head.unselectable = true;


let center,tailPoint,headPoint,aHead,aTail;

/* debugging aid 
item.set("circle0",svg.Element.mk(
   '<circle fill="red" cx="0" cy="0" stroke="black" stroke-width="0.2" \ r="2" />'));

item.set("circle1",svg.Element.mk(
   '<circle fill="orange" cx="0" cy="0" stroke="black" stroke-width="0.2" \ r="2" />'));
item.mark = function (p,n) {
  this['circle'+n].cx  = p.x;
  this['circle'+n].cy  = p.y;
}
*/
let halfwayPoint; //between end0,end1 on straight line
let radius;
let length;
let headSubtends;
  let headCenterAngle;// = aHead + 0.5*headSubtends;
let shaftEnd;

item.effectiveRadius = function () {
  return this.straight?100:this.radius;
}
item.computeRadius = function () {
  let e0 = this.end0;
  let e1 = this.end1;
  length = (e1.difference(e0)).length();
  radius = length * this.effectiveRadius();
  return radius;
}
item.computeCircleCenter = function () {
  let e0 = this.end0;
  let e1 = this.end1;
  let v = e1.difference(e0);
  let ln = v.length();
  radius  = ln * this.effectiveRadius();
  let distToCenterSquared = radius*radius - 0.25*ln*ln;
  let distToCenter = Math.sqrt(distToCenterSquared);
  halfwayPoint = e1.plus(e0).times(0.5);// halfway point between e0 and e1
  let uv = v.times(1/ln).normal(); // the direction normal to e0->e1
  center = halfwayPoint.difference(uv.times(distToCenter * (this.clockwise?-1:1)));
  return center;
  
}

let toDeg = 180/Math.PI;
item.pointAtAngle = function (angle,otherRadius) {
  let rad = otherRadius?otherRadius:radius;
  let vc = Point.mk(Math.cos(angle),Math.sin(angle)).times(rad);//vector from center
  return center.plus(vc);
}

// used in updateConnectedEnds
item.computeDirections= function () {
  let e0 = this.end0;
  let e1 = this.end1;
  this.computeRadius();
  this.computeCircleCenter();
  let e02c = e0.difference(center);
  let e12c = e1.difference(center);
  let a0 = Math.atan2(e02c.y,e02c.x)+Math.PI/2;
  let a1 = Math.atan2(e12c.y,e12c.x)+Math.PI/2;
  this.tailDirection = geom.angleToDirection(a0).minus();
  this.headDirection = geom.angleToDirection(a1);
}

item.computeEnds = function () {
  let e0 = this.end0;
  let e1 = this.end1;
  this.computeRadius();
  this.computeCircleCenter();
  let e02c = e0.difference(center);
  let e12c = e1.difference(center);
  let a0 = Math.atan2(e02c.y,e02c.x);
  let a1 = Math.atan2(e12c.y,e12c.x);
  aTail = a0 - (this.clockwise?-1:1) * this.totalTailGap/radius;
  aHead = a1 + (this.clockwise?-1:1) * this.totalHeadGap/radius;
  //core.aTaild = aTail*toDeg;
  //core.aHeadd = aHead * toDeg;
  tailPoint = this.pointAtAngle(aTail);//center.plus(tailVFC);
  headPoint = this.pointAtAngle(aHead);
  headSubtends = this.headLength/radius;
  headCenterAngle = this.clockwise? aTail + 0.5*headSubtends: aHead + 0.5*headSubtends;
  headCenterAngle = aHead + (this.clockwise?-0.5:0.5)*headSubtends;
  shaftEnd = this.head.solidHead?this.pointAtAngle(headCenterAngle):headPoint;
}

/* aHead and aTail might be more that PI apart (eg -PI - small angle , and PI+small angle). For finding the middle
on the correct side, we need to bring aTail  within PI of aHead*/
const bringWithinPI = function (target,otherAngle) {
  if (Math.abs(otherAngle - target) < Math.PI) {
    return otherAngle;
  }
  if (otherAngle > target) {
    return otherAngle - 2*Math.PI
  }
  return otherAngle + 2*Math.PI;
}

item.middle = function (otherRadius) { //middle point on the curved arrow
  let aTailN = bringWithinPI(aHead,aTail);
  return this.pointAtAngle(0.5*(aHead+aTailN),otherRadius);
}

item.setColor = function (c) {
  this.stroke = c;
}

item.updateShaft = function () {
  core.setProperties(this.shaft,this,['stroke','stroke-width']);
  let d = 'M '+ tailPoint.x+' '+ tailPoint.y;
  d += ' A '+ radius+' ' + radius+' 1 0 '+(this.clockwise?'1':'0')+' '+shaftEnd.x+' '+ shaftEnd.y;
  this.shaft.d = d;
}

item.update = function () {
  this.totalHeadGap = this.headGap + this.vertexHeadGap;
  this.totalTailGap = this.tailGap + this.vertexTailGap;
  
  this.computeEnds();
  this.updateShaft();
  let d = Point.mk(Math.cos(headCenterAngle),Math.sin(headCenterAngle)).normal();
  if (!this.clockwise) {
    d = d.minus();
  }
  this.head.headPoint.copyto(headPoint);
  this.head.direction.copyto(d);
  if (this.head.solidHead) {
    this.head.fill = this.stroke;
  } else {
    core.setProperties(this.head,this,['stroke','stroke-width']);
  }
  core.setProperties(this.head,this,['headLength','headWidth']);
  this.head.update();

}

// when connected, the associated control point goes away (no moving around the periphery)


item.endFromIndex = function (idx) {
  return this.end0vertex?idx+1:idx; 
}

item.controlPoints = function () {
  this.computeEnds();
  let headControlPoint = this.head.controlPoint();
  let rs =  [];
  if (this.includeEndControls) {
    if (!this.end0vertex) {
      rs.push(this.end0);
    }
    if (!this.end1vertex) {
      rs.push(this.end1);
    }
  }
  rs.push(headControlPoint);
  rs.push(this.middle());
  return rs;
}
item.updateControlPoint = function (idx,pos) {
  let toAdjust,middle,v,dist,hwdist,delta,newMiddle,mx,my,vx,vy,cx,cy,hx,hy,ss,t,maxRadius;
  let cidx = 0;
  let end0idx  = -1;
  let end1idx = -1;
  if (!this.end0vertex) {
    end0idx = cidx++;
  }
  if (!this.end1vertex) {
    end1idx = cidx++;
  }
  let headIdx = cidx++;
  let centerIdx = cidx++;
  switch (idx) {
    case headIdx:
      this.head.updateControlPoint(pos);
      ui.updateInheritors(ui.whatToAdjust);
      return;
    case end0idx:
    //case 0:
      this.end0.copyto(pos);
      break;
    case end1idx:
   // case 1:
      this.end1.copyto(pos);
      break;
    case centerIdx:
        // adjust the radius
      /* we need to compute a new radius such that the distance from the new center
      * to the head is the same as that to the new (dragged) middle
      * now the new center will lie on the existing line from the center to the arcCenter
      *  Let v be the unit vector in the direction from center to arcCenter
      *  Suppose that the newCenter(nx,ny) is t*v + center.
      *  So nx = t*vx + cx, ny = t*vy + cy
      *  We want to solve for t
      *  we have
      *  dist(newCenter,headPoint) = distance(newCenter,newMiddle)
      *  newMiddle = middle + delta*v (write newMiddle as mx,my)
      *  distanceSquared(newCenter,headPoint) = (nx -hx)**2 + (ny- hy)**2
      *  distanceSquared(newCenter,newMiddle) = (nx - mx)**2 + (ny - my)**2
      *  Call t*vx + cx nx, t*vy+cy ny
      *  We have:
      *  nx**2 - 2*nx*hx + hx**2 + ny**2 - 2*ny*hy + hy**2 - (nx**2 - 2*nx*mx + mx**2 + ny**2 - 2*ny*my + my**2 = 0
      *  hx**2 + hy**2 - mx**2 - my**2 + 2*(nx*mx + ny*my - nx*hx - ny*hy) = 0
      *  ss + 2*((t*vx+cx)*mx + (t*vy+cy)*my - (t*vx+cx)*hx - (t*vy+cy)*hy) = 0
      *  ss + t * 2 * (vx*mx + vy*my - vx*hx - vy*hy) + 2*(cx*mx + cy*my - cx*hx - cy*hy) = 0
      * ss + t * 2 * (vx*(mx-hx) + vy*(my-hy)) + 2*(cx*(mx-hx) + cy*(my - hy)) = 0
      * t * 2 * (vx*(mx-hx) + vy*(my-hy)) = 2*(cx*(hx-mx) + cy*(hy - my)) - ss
      * t =  (2*(cx*(hx-mx) + cy*(hy - my)) - ss)/(2 * (vx*(mx-hx) + vy*(my-hy))) 
      *  whew!
      */
     // if this  owns radius, then this  should be adjusted regardless of ui.whatToAdjust
     if (this.hasOwnProperty('radius')) {
       toAdjust = this;
     } else {
       toAdjust = ui.vars.whatToAdjust;//?ui.whatToAdjust:this;// we might be adjusting the prototype
     }
     this.computeRadius();
     middle = this.middle();
     v = middle.difference(center).normalize();
     dist = pos.distance(center);
     hwdist = halfwayPoint.distance(center);
     if (dist < hwdist) {
       toAdjust.clockwise = !this.clockwise;
       this.update();
       this.updateControlPoint(pos,idx);
       return;
     }
     delta = dist - radius;
     newMiddle = middle.plus(v.times(delta));
     mx=newMiddle.x;
     my=newMiddle.y;
     vx=v.x;
     vy=v.y;
     cx=center.x;
     cy=center.y;
     hx=this.end0.x;
     hy=this.end0.y;
     ss = hx*hx + hy*hy - ( mx*mx + my*my);
     t = (2*(cx*(hx-mx) + cy*(hy - my)) - ss)/(2 * (vx*(mx-hx) + vy*(my-hy)));
     maxRadius = 100;// a big number, is all
     toAdjust.radius = Math.min(maxRadius,Math.max(0.5,(radius + delta- t)/length));
     ui.updateInheritors(toAdjust);
     break;
  }
  this.update();
  this.draw();
}


item.setSide = function (whichSide) {  // used by verticalTree
  if (whichSide === 'left') {
    this.clockwise = false;
    this.straight = false;
  } else if (whichSide === 'right') {
    this.clockwise = true;
    this.straight = false;
  } else {
    this.straight = true;
  }
}
 

item.updateConnectedEnds = function (vertex0,vertex1) {
  let {end0,end1} = this;
  this.computeDirections();
  let tr = this.getTranslation();
  if (vertex0) {
    let vertex0pos = vertex0.getTranslation();
    end0.copyto(vertex0pos.difference(tr));
    let tailPeriphery = vertex0.peripheryAtDirection(this.tailDirection);
    this.vertexTailGap = tailPeriphery.intersection.length();//distance(vertex0pos);
  }
  if (vertex1) {
    let vertex1pos = vertex1.getTranslation();
    end1.copyto(vertex1pos.difference(tr));
    let headPeriphery = vertex1.peripheryAtDirection(this.headDirection);
     this.vertexHeadGap = headPeriphery.intersection.length();
  }
}



  

  return item;
});