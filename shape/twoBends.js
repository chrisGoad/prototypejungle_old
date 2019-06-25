//twoBends

core.require(function () {

let item =  svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="2"/>');

/* adjustable parameters */
item.vertical = false; // the part between bends is vertical, as in a C
item.stroke = "black";
item['stroke-width'] = 0.2;
item.elbowWidth = 5;
/* end adjustable parameters */


item.role = 'edge';
if (item.vertical) {
  item.set("end0",Point.mk(0,0));
  item.set("end1",Point.mk(0,50));
} else {
  item.set("end0",Point.mk(0,0));
  item.set("end1",Point.mk(50,0));
}

item.setEnds = function (p0,p1) {
  this.setPointProperty('end0',p0);
  this.setPointProperty('end1',p1);
}

item.__connectionType = 'EastWest'; //  only makes east/west connections

item.update = function () {
  let vertical = this.vertical;
  this.__connectionType = vertical?'UpDown':'EastWest';
  let p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  let elbow0a,elbow0b,controlPoint0,elbow1a,elbow1b,controlPoint1;
  let d = this.depth;
  let e0 = this.end0;
  let e1 = this.end1;
  if (vertical) {
  
    let x0 = e0.x;
    let y0 = e0.y;
    let x1 = e1.x;
    let y1 = e1.y;
    let up = y0 > y1;
    let ipx = x0 + d;
    let yDelta = Math.abs(y1-y0);
    let ew0 = Math.min(this.elbowWidth,Math.abs(d),yDelta/2);
    let ew1 = Math.min(this.elbowWidth,Math.abs(ipx-x1),yDelta/2);
    let e0right = d > 0;
    let e1right = ipx>x1;
    elbow0a = geom.Point.mk(ipx + (e0right?-ew0:ew0),y0);
    controlPoint0 = geom.Point.mk(ipx,y0);
    elbow0b = geom.Point.mk(ipx,y0 + (up?-ew0:ew0));
    elbow1a = geom.Point.mk(ipx,y1 + (up?ew1:-ew1));
    controlPoint1 = geom.Point.mk(ipx,y1);
    elbow1b = geom.Point.mk(ipx + (e1right?-ew1:ew1),y1);
    if (this.depth === undefined) {
      this.depth = 25 // for the catalog
    }
  } else {
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
    elbow0a = geom.Point.mk(x0,ipy + (e0down?-ew0:ew0));
    controlPoint0 = geom.Point.mk(x0,ipy);
    elbow0b = geom.Point.mk(x0 + (toRight?ew0:-ew0),ipy);
    elbow1a = geom.Point.mk(x1 - (toRight?ew1:-ew1),ipy);
    controlPoint1 = geom.Point.mk(x1,ipy);
    elbow1b = geom.Point.mk(x1,ipy + (e1down?-ew1:ew1));
    if (this.depth === undefined) {
      this.depth = -15 // for the catalog
    }
  }
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



item.middlePoint =  function () {
  let e0 = this.end0;
  let e1 = this.end1;
  let x0 = e0.x;
  let x1 = e1.x;
  let y0 = e0.y;
  let y1 = e1.y;
  return(this.vertical)?geom.Point.mk(x0+this.depth,(y0+y1)/2):
                                    geom.Point.mk((x0+x1)/2,y0+this.depth);
}



item.controlPoints = function () {
  return [this.end0,this.end1,this.middlePoint()];
}


item.updateControlPoint = function (idx,rpos) {
  switch (idx) {
    case 0:
       if (this.end0vertex) {
        graph.mapEndToPeriphery(this,this.end0,this.end0vertex,'end0connection',rpos);
      } else {
        let delta = this.vertical?0: rpos.y - this.end0.y;
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
      if (this.vertical) {
        let x = rpos.x;
        let x0 = this.end0.x;
        this.depth = x - x0;
      } else {
        let y = rpos.y;
        let y0 = this.end0.y;
        this.depth = y - y0;
        break;
      }
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

