//oneBend

core.require(function () {

let item =  svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="2"/>');

/* adjustable parameters */
item.vertical = true; // for consistency with twoBend and arrow implementations; second segment is vertical
item.stroke = "black";
item['stroke-width'] = 0.2;
item.elbowWidth = 5;

/* end adjustable parameters */


item.role = 'edge';
item.set("end0",Point.mk(0,0));
item.set("end1",Point.mk(50,50));


item.setEnds = function (p0,p1) {
  this.setPointProperty('end0',p0);
  this.setPointProperty('end1',p1);
}


item.__connectionType = 'EastWest'; //  only makes east/west connections

item.update = function () {
  let p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  let w = this.elbowWidth;
  let e0 = this.end0;
  let e1 = this.end1;
  let x0 = e0.x;
  let y0 = e0.y;
  let x1 = e1.x;
  let y1 = e1.y;
  let right = x1 > x0;
  let up = y0 > y1;
  let bx = x1;
  let by = y0;
  let xDelta = Math.abs(x1-x0);
  let ew = Math.min(w,xDelta);  
  let yDelta = Math.abs(y1-y0);
  let eh = Math.min(w,yDelta);
  let ew0 = 0;
  let ew1 = 0;
  let bend = geom.Point.mk(bx,by); // the bend point
  let bendStart = bend.difference(geom.Point.mk(right?ew:-ew,0));;
  let bendEnd = bend.plus(geom.Point.mk(0,up?-eh:eh));
  let path = p2str('M',e0,' ');
  path += p2str('L',bendStart,' ');
  path += p2str('C',bend,',');
  path += p2str('',bend,',');
  path += p2str('',bendEnd,' '); 
  path += p2str('L',e1,' ');
  this.d = path;
  
}



item.controlPoints = function () {
  return [this.end0,this.end1];
}


item.updateControlPoint = function (idx,rpos) {
  switch (idx) {
    case 0:
       if (this.end0vertex) {
        graph.mapEndToPeriphery(this,this.end0,this.end0vertex,'end0connection',rpos);
      } else {
        this.end0.copyto(rpos);
      }
      break;
    case 1:
      if (this.end1vertex) {
        graph.mapEndToPeriphery(this,this.end1,this.end1vertex,'end1connection',rpos);
      } else {
        this.end1.copyto(rpos);
      }
      break;
  }
  this.update();
  this.draw();
}

graph.installEdgeOps(item);

item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,['stroke','stroke-width'],own);
}

ui.hide(item,['d','fill','shaft','end0','end1','direction']);

return item;

});

