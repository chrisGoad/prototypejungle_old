// Arrow

'use strict';

pj.require('/shape/arrowHead.js',function (arrowHeadP) {
var svg = pj.svg;
var ui = pj.ui;
var geom = pj.geom;

var item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.label = '';
item.labelSep = 20;
item.stroke= "black";
item['stroke-width'] = 2;
item.clockwise = 1;
item.headLength = 15;
item.headWidth = 10;
item.solidHead = true;
item.headGap = 0; // arrow head falls short of e1 by this amount
item.tailGap = 0; // tail of arrow  is this far out from e0
item.radius = 0.8; // radius of the arc as a multiple of arrow length
item.set("end0",pj.geom.Point.mk(0,0));
item.set("end1",pj.geom.Point.mk(50,0));
item.includeEndControls = true;

/* end adjustable parameters */


item.__adjustable = true;
item.__cloneable = true;
item.__cloneResizable = true;
item.__customControlsOnly = true;
item.__draggable = true;
item.__defaultSize = geom.Point.mk(120,0);

item.set("shaft", svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="1"/>'));
item.set('labelText', svg.Element.mk('<text font-size="20" stroke-width="0.2" font-style="italic" font-family="Arial" stroke="black" fill="black" text-anchor="middle">1</text>'));

item.labelText.__hide();
item.labelText.__draggable = false;
item.setLabel = function (txt) {
  this.label.setText(txt);
}


item.shaft.__unselectable = true;
item.shaft.__show();


item.set('head',arrowHeadP.instantiate());
item.head.__unselectable = true;


var center,tailPoint,headPoint,aHead,aTail,aHeadd,aTaild;


item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}

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
var halfwayPoint; //between end0,end1 on straight line
var radius;
var length;
var headSubtends;
  var headCenterAngle;// = aHead + 0.5*headSubtends;
var shaftEnd;

item.computeRadius = function () {
  var e0 = this.end0,e1 = this.end1;
  length = (e1.difference(e0)).length();
  radius = length * this.radius;
  return radius;
}
item.computeCircleCenter = function () {
    var e0 = this.end0,e1 = this.end1;
  var v = e1.difference(e0);
  var ln = v.length();
  radius  = ln * this.radius;

  var distToCenterSquared = radius*radius - 0.25*ln*ln;
  var distToCenter = Math.sqrt(distToCenterSquared);
  halfwayPoint = e1.plus(e0).times(0.5);// halfway point between e0 and e1
  var uv = v.times(1/ln).normal(); // the direction normal to e0->e1
  center = halfwayPoint.difference(uv.times(distToCenter * (this.clockwise?-1:1)));
  return center;
  
}
item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}

var toDeg = 180/Math.PI;
item.pointAtAngle = function (angle,otherRadius) {
  var rad = otherRadius?otherRadius:radius;
  var ad = toDeg * angle;
  var vc = geom.Point.mk(Math.cos(angle),Math.sin(angle)).times(rad);//vector from center
  return center.plus(vc);
  return this.center.plus(vc);

}

item.computeEnds = function () {
  var e0 = this.end0,e1 = this.end1;
  this.computeRadius();
  this.computeCircleCenter();
  var e02c = e0.difference(center);
  var e12c = e1.difference(center);
  var a0 = Math.atan2(e02c.y,e02c.x);
  var a1 = Math.atan2(e12c.y,e12c.x);
  if (0 && this.clockwise) {
    var tmp = a1;
    a1 = a0;
    a0 = tmp;
  }
  var a0d = a0*toDeg;//debugging
  var a1d = a1*toDeg;
  aTail = a0 - (this.clockwise?-1:1) * this.tailGap/radius;
  aHead = a1 + (this.clockwise?-1:1) * this.headGap/radius;
  pj.aTaild = aTail*toDeg;
  pj.aHeadd = aHead * toDeg;
  tailPoint = this.pointAtAngle(aTail);//center.plus(tailVFC);
  headPoint = this.pointAtAngle(aHead);
  headSubtends = this.headLength/radius;
  //headSubtends = 0;
  headCenterAngle = this.clockwise? aTail + 0.5*headSubtends: aHead + 0.5*headSubtends;
  headCenterAngle = aHead + (this.clockwise?-0.5:0.5)*headSubtends;
  shaftEnd = this.solidHead?this.pointAtAngle(headCenterAngle):headPoint;
  return;
  var e0 = this.end0,e1 = this.end1;
  var d = e1.difference(e0).normalize();
  return e1.difference(d.times(this.headGap));
}
/* aHead and aTail might be more that PI apart (eg -PI - small angle , and PI+small angle). For finding the middle
on the correct side, we need to bring aTail  within PI of aHead*/
var bringWithinPI = function (target,otherAngle) {
  if (Math.abs(otherAngle - target) < Math.PI) return otherAngle;
  if (otherAngle > target) {
    return otherAngle - 2*Math.PI
  }
  return otherAngle + 2*Math.PI;
}

item.middle = function (otherRadius) { //middle point on the curved arrow
  var aTailN = bringWithinPI(aHead,aTail);
  return this.pointAtAngle(0.5*(aHead+aTailN),otherRadius);
}

item.setEnds = function (e0,e1) {
  this.end0.copyto(e0);
  this.end1.copyto(e1);
}
item.setColor = function (c) {
  this.stroke = c;
}

item.updateShaft = function () {
  pj.setProperties(this.shaft,this,['stroke','stroke-width']);
  var d = 'M '+ tailPoint.x+' '+ tailPoint.y;
  d += ' A '+ radius+' ' + radius+' 1 0 '+(this.clockwise?'1':'0')+' '+shaftEnd.x+' '+ shaftEnd.y;
  this.shaft.d = d;
}
var firstTime = true;
item.update = function () {
  var e0 = this.end0,e1 = this.end1;
  //var hw = Number(this.head0['stroke-width']);
  var hw = Number(this['stroke-width']);
  var n,sh,e1he,h0,h1;
  this.computeEnds();
  this.updateShaft();
  var d = geom.Point.mk(Math.cos(headCenterAngle),Math.sin(headCenterAngle)).normal();
  if (!this.clockwise) {
    d = d.minus();
  }
  this.head.headPoint.copyto(headPoint);
  this.head.direction.copyto(d);
  pj.setProperties(this.head,this,['solidHead','stroke','stroke-width','headLength','headWidth']);
  this.head.update();
  if (this.label) {
    this.labelText.__show();
    var labelPos = this.middle(radius+this.labelSep);
    this.labelText.setText(this.label);
    this.labelText.__moveto(labelPos);
    this.labelText.center();
  } else {
    this.labelText.__hide();
    ui.hide(this,['labelText','label','labelSep']);
  }
}


item.__controlPoints = function () {
 // debugger;
  var headControlPoint = this.head.controlPoint();
  var rs = [headControlPoint];
  this.computeEnds();
  rs.push(this.middle());
  if (this.includeEndControls) {
    rs.push(this.end0);
    rs.push(this.end1);
  }
  return rs;
}

item.__holdsControlPoint = function (idx,headOfChain) {
  if (idx === 0) {
    return this.hasOwnProperty('headWidth')
  } 
  return headOfChain;
}

item.__updateControlPoint = function (idx,pos) {
  var event,toAdjust,e0,e1,end,d,n,e1p,h2shaft,cHeadWidth,cHeadLength;
  if (idx > 1) {
    if (idx === 2) {
      end = this.end0;
    } else {
      end = this.end1;
    }
    end.copyto(pos);
    event = pj.Event.mk('moveArrowEnd',end);
    event.emit();
    this.update();
    this.__draw();
    return;
  }
  
  this.computeEnds();
  if (idx===0) {
     // adjust the head
  
    this.head.updateControlPoint(pos);
    
  } else {
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
     //debugger;
    // if this  owns radius, then this  should be adjusted regardless of ui.whatToAdjust
    if (this.hasOwnProperty('radius')) {
      toAdjust = this;
    } else {
      toAdjust = ui.whatToAdjust?ui.whatToAdjust:this;// we might be adjusting the prototype
    }
    this.computeRadius();
    var middle = this.middle();
    var v = middle.difference(center).normalize();
    var dist = pos.distance(center);
    var hwdist = halfwayPoint.distance(center);
    if (dist < hwdist) {
      toAdjust.clockwise = !this.clockwise;
      this.update();
      this.__updateControlPoint(pos,idx);
      return;
    }
    var delta = dist - radius;
    var newMiddle = middle.plus(v.times(delta));
    var mx=newMiddle.x,my=newMiddle.y;
    var vx=v.x,vy=v.y;
    var cx=center.x,cy=center.y;
    var hx=this.end0.x,hy=this.end0.y;
    var ss = hx*hx + hy*hy - ( mx*mx + my*my);
    var t = (2*(cx*(hx-mx) + cy*(hy - my)) - ss)/(2 * (vx*(mx-hx) + vy*(my-hy)));
    var newCenter = center.plus(v.times(t));
    var nx = newCenter.x,ny = newCenter.y;
    var maxRadius = 100;// a big number, is all
    toAdjust.radius = Math.min(maxRadius,Math.max(0.5,(radius + delta- t)/length));
  }
  ui.adjustInheritors.forEach(function (x) {
    x.update();
    x.__draw();
  });
  return;
}




// If ordered is present, this called from finalizeInsert and
// ordered says which way the box was dragged, which in turn determines the direction of the arrow
item.__setExtent = function (extent,ordered) {
  var center = this.end1.plus(this.end0).times(0.5);
  var ox = ordered?(ordered.x?1:-1):1;
  var oy = ordered?(ordered.y?1:-1):1;
  var end1  = geom.Point.mk(0.5 * ox * extent.x,0.5 * oy * extent.y);
  var end0 = end1.times(-1);
  this.setEnds(end0,end1);
}
 
ui.hide(item,['head','shaft','includeEndControls']);
ui.hide(item,['head0','head1','LineP','end0','end1']);

item.__setFieldType('solidHead','boolean');



return item;
});
