//elbow


core.require(function () {

let item =  svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="2"/>');

/* adjustable parameters */
item.stroke = "black";
item['stroke-width'] = 2;
item.elbowWidth = 10;
item.segmentDisplacement = 10; // from end0

/* end adjustable parameters */


item.role = 'edge';

item.set("end0",Point.mk(0,0));
item.set("end1",Point.mk(50,0));

item.__connectionType = 'EastWest'; //  only makes east/west connections

item.update = function () {
  let p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  let e0 = this.end0;
  let e1 = this.end1;
   if (e0.x > e1.x) { //switch ends
    e0 = this.end1;
    e1 = this.end0;
  }
  let x0 = e0.x;
  let x1 = e1.x;
  let y0 = e0.y;
  let y1 = e1.y;
  let yOrder = (y1 > y0)?1:-1;
  let yDelta = Math.abs(y1-y0);
  let elbowWidth = this.elbowWidth;
  let elbowX = x0 + (x1 - x0) * this.elbowPlacement;
  let elbowWidth0 = Math.min(elbowWidth,elbowX - x0,yDelta/2);
  let elbowWidth1 = Math.min(elbowWidth,x1-elbowX,yDelta/2);
  let elbowPoint0 = geom.Point.mk(elbowX-elbowWidth0,y0);
  let elbowPoint1 = geom.Point.mk(elbowX,y0+yOrder*elbowWidth0);
  let controlPoint0 = elbowPoint0.plus(geom.Point.mk(elbowWidth0,0));
  let controlPoint1 = elbowPoint1.difference(geom.Point.mk(0,yOrder*elbowWidth0));
  let elbowPoint2 = geom.Point.mk(elbowX,y1-yOrder*elbowWidth1);
  let elbowPoint3 = geom.Point.mk(Math.min(x1,elbowX+elbowWidth1),y1);
  let controlPoint2 = elbowPoint2.plus(geom.Point.mk(0,yOrder*elbowWidth1));
  let controlPoint3 = elbowPoint3.difference(geom.Point.mk(elbowWidth1,0));
  let path = p2str('M',e0,' ');
  path += p2str('L',elbowPoint0,' ');
  path += p2str('C',controlPoint0,',');
  path += p2str('',controlPoint1,',');
  path += p2str('',elbowPoint1,' '); 
  path += p2str('L',elbowPoint2,' ');
  path += p2str('C',controlPoint2,',');
  path += p2str('',controlPoint3,',');
  path += p2str('',elbowPoint3,' ');
  path += p2str('L',e1,' ');
  this.d = path;
  
}



item.controlPoints = function () {
  let e0 = this.end0;
  let e1 = this.end1;
  let x0 = e0.x;
  let x1 = e1.x;
  let y0 = e0.y;
  let y1 = e1.y
  //let controlPoint = 
  let elbowX = x0 + (x1 - x0) * this.elbowPlacement;
  let middlePoint = geom.Point.mk(elbowX,(y1+y0)/2);
  let rs = [this.end0,this.end1,middlePoint];
  return rs;
}


item.updateControlPoint = function (idx,rpos) {
  let x,x0,x1;
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
    case 2:
      x = rpos.x;
      x0 = this.end0.x;
      x1 = this.end1.x;
      this.elbowPlacement = Math.max(0,Math.min(1,(x - x0)/(x1 - x0)));
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

