


core.require('/shape/oneBend.js','/arrow/solidHead.js','/text/attachedText.js',function (shaftP,arrowHeadP,textItemP) {

let item = svg.Element.mk('<g/>');
debugger;
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
item.text = '';
/* end adjustable parameters */




//item.set('head',arrowHeadP.instantiate());
item.set('shaft',shaftP.instantiate());

item.shaft.unselectable = true;



item.set('direction0',geom.Point.mk(0,1));
item.set('direction1',geom.Point.mk(0,1));
item.set('arrowDirection',geom.Point.mk(0,1));

item.computeEnd0 = function (deviation) {
 return this.end0.plus(this.direction.times(deviation));
}


item.computeArrowEnd = function (deviation) {
 return this.vertical?this.end1.plus(this.arrowDirection.times(-deviation)):this.end0.plus(this.arrowDirection.times(-deviation))
}

item.update = function () {
  let vertical = this.vertical;
  let includeArrow = this.includeArrow;
  if (includeArrow) {
    if (!this.head) {
      this.set('head',arrowHeadP.instantiate());
      this.head.unselectable = true;
    }
  }
  let e0 = this.end0;
  let e1 = this.end1;
  let x0 = e0.x;
  let x1 = e1.x;
  let y0 = e0.y;
  let y1 = e1.y;
  this.connectionType = 'UpDown';
  
  if (vertical) {
    this.direction1.copyto(Point.mk(0,y1>y0?1:-1));
    this.direction0.copyto(Point.mk(x1>x0?-1:1,0));
  }
  if (includeArrow) {
    let positiveArrowDir = vertical?y1>y0:x0 > x1;
    this.arrowDirection.copyto(vertical?Point.mk(0,positiveArrowDir?1:-1):
                                     Point.mk(positiveArrowDir?1:-1,0));
  }
  //let cx = e0.x + this.width;
 // let flip = y1 > y0;
  let shaftEnd = includeArrow?this.computeArrowEnd(this.head.solidHead?this.headLength:0):e1;                               
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
    this.head.direction.copyto(this.arrowDirection);
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
      textItem.unselectable = true;
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
  /*if (this.head && src.head) {
    if ((this.head.__sourceUrl !== src.head.__sourceUrl)) {
      this.set('head',Object.getPrototypeOf(src.head).instantiate());
      this.head.transferState(src.head,own);
    }
  }*/
  if (src.textItem) {
    if (!this.textItem) {
      this.set('textItem',textItemP.instantiate());
      this.textItem.unselectable = true;
    }
    this.textItem.transferState(src.textItem,own);
  }
 
}


graph.installEdgeOps(item);

item.connectionType = 'UpDown'; 

ui.hide(item,['head','shaft','direction','elbowPlacement','end0','end1']);
item.setFieldType('solidHead','boolean');

return item;

});

