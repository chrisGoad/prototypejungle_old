


core.require('/shape/oneBend.js','/arrow/solidHead.js','/text/attachedText.js',function (shaftPP,arrowHeadPP,textItemPP) {
  
core.standsAlone(['/shape/oneBend.js','/arrow/solidHead.js']);  // suitable for loading into code editor

let item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.vertical = true; // the arrow is vertical (ie at end1)
item.includeArrow = true;
item.stroke = "black";
item['stroke-width'] = 2;
item.headLength = 10;
item.headWidth = 8;
item.elbowWidth = 10;
item.width = 19; // fraction of along the way where the elbow appears
item.set("end0",Point.mk(-20,12));
item.set("end1",Point.mk(20,-12));
//item.text = '';
/* end adjustable parameters */


// put the arrow on end1 if vertical, end0 if not

item.set('direction0',geom.Point.mk(0,1));
item.set('direction1',geom.Point.mk(0,1));

item.update = function () {
  let vertical = this.vertical;
  let includeArrow = this.includeArrow;
  if (includeArrow && (!this.head)) {
    let proto = Object.getPrototypeOf(this);
    if (!proto.arrowHeadP) {
      proto.arrowHeadP = core.installPrototype('arrowHead',arrowHeadPP);
    }
    this.set('head',this.arrowHeadP.instantiate()).show();
    this.head.neverselectable = true;
  }
  if ((!this.includeArrow) && (this.head)) {
    this.head.remove();
    this.head = undefined;
  }
  if (!this.shaft) {
    let proto = Object.getPrototypeOf(this);
    if (!proto.shaftP) {
      proto.shaftP = core.installPrototype('shaft',shaftPP);
    }
    this.set('shaft',this.shaftP.instantiate()).show();
    this.shaft.neverselectable = true;
  }
  let e0 = this.end0;
  let e1 = this.end1;
  let x0 = e0.x;
  let x1 = e1.x;
  let y0 = e0.y;
  let y1 = e1.y;
  const pointsPositive = (end) => (end===0)?x1<x0:y1>y0;
  let pp0 = pointsPositive(0);
  let pp1 = pointsPositive(1);
      
  this.connectionType = 'UpDown';
  
  if (1 || vertical) {
    this.direction0.copyto(Point.mk(pp0?1:-1,0));
    this.direction1.copyto(Point.mk(0,pp1?1:-1));
  } else {
    this.direction0.copyto(Point.mk(pp0?1:-1,0));
    this.direction1.copyto(Point.mk(0,pp1?1:-1));
  }
  let arrowDirection = vertical?this.direction1:this.direction0;
  let shaftEnd;
  if (includeArrow && this.head.solidHead) {
    shaftEnd = vertical?e1.difference(this.direction1.times(this.headLength)):e0.difference(this.direction0.times(this.headLength));  
  } else {
    shaftEnd = vertical?e1:e0;
  }    
  if (vertical) {
    this.shaft.end0.copyto(e0);
    this.shaft.end1.copyto(shaftEnd);
  } else {
    this.shaft.end0.copyto(shaftEnd);
    this.shaft.end1.copyto(e1);
  }
  core.setProperties(this.shaft,this,['stroke-width','stroke','width','elbowWidth']);
  this.shaft.update();
  if (includeArrow) {
    this.head.headPoint.copyto(vertical?e1:e0);
    this.head.direction.copyto(arrowDirection);
    if (this.head.solidHead) {
      this.head.fill = this.stroke;
    } else {
      core.setProperties(this.head,this,['stroke','stroke-width']);
    }
    core.setProperties(this.head,this,['headLength','headWidth']);
    this.head.update();
  }
  if (this.text) {
    let textItem = this.textItem;
    if (!textItem) {
      textItem = this.set('textItem',textItemP.instantiate());
      textItem.neverselectable = true;
      textItem.sep = 7;
      textItem['font-size'] = 8;
      
    }
    let textPos = geom.Point.mk(cx+this.textItem.sep,(e0.y + e1.y)/2,);
    this.textItem.update(textPos);
  }
}


item.controlPoints = function () {
  let rs = [this.end0,this.end1];
  if (this.includeArrow) {
    rs.push(this.head.controlPoint());
  }
  return rs;
}

item.updateControlPoint = function (idx,rpos) {
  switch (idx) {
    case 0:
      if (this.end0vertex) {
        graph.mapEndToPeriphery(this,this.end0,this.end0vertex,'end0connection',rpos);
      } else {
        let delta = rpos.x - this.end0.x;
        this.end0.copyto(rpos);
        this.width = this.width - delta;
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
      this.head.updateControlPoint(rpos);
      ui.updateInheritors(ui.whatToAdjust);
      return;
  }
  this.update();
  this.draw();
}

item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,['stroke','stroke-width','headLength','headWidth'],own);
  if (src.textItem) {
    if (!this.textItem) {
      this.set('textItem',textItemP.instantiate());
      this.textItem.neverselectable = true;
    }
    this.textItem.transferState(src.textItem,own);
  }
 
}


graph.installEdgeOps(item);

item.connectionType = 'UpDown'; 

item.setFieldType('includeArrow','boolean');


ui.hide(item,['head','shaft','direction','elbowPlacement','end0','end1']);
item.setFieldType('solidHead','boolean');

return item;

});

