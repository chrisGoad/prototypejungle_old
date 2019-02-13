//elbow


core.require(function () {

let item =  svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="2"/>');

/* adjustable parameters */
item.stroke = "black";
item['stroke-width'] = 0.2;
item.elbowWidth = 5;
item.width = 10; // from end0

/* end adjustable parameters */


item.role = 'edge';

item.set("end0",Point.mk(0,0));
item.set("end1",Point.mk(0,-50));


item.setEnds = function (p0,p1) {
  this.setPointProperty('end0',p0);
  this.setPointProperty('end1',p1);
}


item.__connectionType = 'EastWest'; //  only makes east/west connections

item.update = function () {
  let p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  let w = this.width;
  let e0 = this.end0;
  let e1 = this.end1;
  let x0 = e0.x;
  let y0 = e0.y;
  let x1 = e1.x;
  let y1 = e1.y;
  let up = y0 > y1;
  let ipx = x0 + w;
  let yDelta = Math.abs(y1-y0);
  let ew0 = Math.min(this.elbowWidth,Math.abs(w),yDelta/2);
  let ew1 = Math.min(this.elbowWidth,Math.abs(ipx-x1),yDelta/2);
  let e0right = w > 0;
  let e1right = ipx>x1;
  let elbow0a = geom.Point.mk(ipx + (e0right?-ew0:ew0),y0);
  let controlPoint0 = geom.Point.mk(ipx,y0);
  let elbow0b = geom.Point.mk(ipx,y0 + (up?-ew0:ew0));
  let elbow1a = geom.Point.mk(ipx,y1 + (up?ew1:-ew1));
  let controlPoint1 = geom.Point.mk(ipx,y1);
  let elbow1b = geom.Point.mk(ipx + (e1right?-ew1:ew1),y1);
  let path = p2str('M',e0,' ');
  path += p2str('L',elbow0a,' ');
  path += p2str('C',controlPoint0,',');
  path += p2str('',controlPoint0,',');
  path += p2str('',elbow0b,' '); 
  path += p2str('L',elbow1a,' ');
  path += p2str('C',controlPoint1,',');
  path += p2str('',controlPoint1,',');
  path += p2str('',elbow1b,' ');
  path += p2str('L',e1,' ');
  this.d = path;
  
}



item.controlPoints = function () {
  let e0 = this.end0;
  let e1 = this.end1;
  let x0 = e0.x;
  let y0 = e0.y;
  let y1 = e1.y;
  let middlePoint = geom.Point.mk(x0+this.width,(y0+y1)/2);
  let rs = [this.end0,this.end1,middlePoint];
  return rs;
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
    case 2:
      let x = rpos.x;
      let x0 = this.end0.x;
      this.width = x - x0;
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

