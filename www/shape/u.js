//elbow


core.require(function () {

let item =  svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="2"/>');

/* adjustable parameters */
item.stroke = "black";
item['stroke-width'] = 0.2;
item.elbowWidth = 5;
item.depth = 10; // from end0

/* end adjustable parameters */


item.role = 'edge';

item.set("end0",Point.mk(0,0));
item.set("end1",Point.mk(50,0));

item.setEnds = function (p0,p1) {
  this.setPointProperty('end0',p0);
  this.setPointProperty('end1',p1);
}

item.__connectionType = 'EastWest'; //  only makes east/west connections

item.update = function () {
  let p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  let d = this.depth;
  let e0 = this.end0;
  let e1 = this.end1;
  let x0 = e0.x;
  let y0 = e0.y;
  let x1 = e1.x;
  let toRight = x1 > x0;
  let y1 = e1.y;
  let ipy = y0 + d;
  let xDelta = Math.abs(x1-x0);
  let ew0 = Math.min(this.elbowWidth,Math.abs(d),xDelta/2);
  let ew1 = Math.min(this.elbowWidth,Math.abs(ipy-y1),xDelta/2);
  let e0down = d > 0;
  let e1down = (ipy-y1)>0;
  let elbow0a = geom.Point.mk(x0,ipy + (e0down?-ew0:ew0));
  let controlPoint0 = geom.Point.mk(x0,ipy);
  let elbow0b = geom.Point.mk(x0 + (toRight?ew0:-ew0),ipy);
  let elbow1a = geom.Point.mk(x1 - (toRight?ew1:-ew1),ipy);
  let controlPoint1 = geom.Point.mk(x1,ipy);
  let elbow1b = geom.Point.mk(x1,ipy + (e1down?-ew1:ew1));
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
  let x1 = e1.x;
  let y0 = e0.y;
  let middlePoint = geom.Point.mk((x0+x1)/2,y0 + this.depth);
  let rs = [this.end0,this.end1,middlePoint];
  return rs;
}


item.updateControlPoint = function (idx,rpos) {
  switch (idx) {
    case 0:
       if (this.end0vertex) {
        graph.mapEndToPeriphery(this,this.end0,this.end0vertex,'end0connection',rpos);
      } else {
        let delta = rpos.y - this.end0.y;
        this.end0.copyto(rpos);
        this.depth = this.depth - delta;
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
      let y = rpos.y;
      let y0 = this.end0.y;
      this.depth = y - y0;
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

