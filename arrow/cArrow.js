//cArrow

core.require('/shape/c.js','/arrow/solidHead.js','/text/attachedText.js',function (shaftP,arrowHeadP,textItemP) {

let item = svg.Element.mk('<g/>');

/* adjustable parameters */
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




item.set('head',arrowHeadP.instantiate());
item.set('shaft',shaftP.instantiate());

item.shaft.unselectable = true;
item.head.unselectable = true;


item.set('direction',geom.Point.mk(1,0));

item.computeEnd1 = function (deviation) {
 return this.end1.plus(this.direction.times(deviation));
}

item.update = function () {
  let e0 = this.end0;
  let e1 = this.end1;
  let x1 = e1.x;
  let cx = e0.x + this.width;
  let flip = cx > x1;
  let shaftEnd = this.head.solidHead ?this.computeEnd1((flip?0.5:-0.5)*this.headLength):e1;
  this.shaft.end0.copyto(e0);
  this.shaft.end1.copyto(shaftEnd);
  core.setProperties(this.shaft,this,['stroke-width','stroke','width','elbowWidth']);
  this.shaft.update();
  this.head.headPoint.copyto(e1);
  this.head.direction.copyto(this.direction.times(flip?-1:1));
  if (this.head.solidHead) {
    this.head.fill = this.stroke;
  } else {
    core.setProperties(this.head,this,['stroke','stroke-width']);
  }
  core.setProperties(this.head,this,['headLength','headWidth']);
  this.head.update();
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
  let shaftControlPoints = this.shaft.controlPoints();
  let headControlPoint = this.head.controlPoint();
  return [this.end0,this.end1,shaftControlPoints[2],headControlPoint];
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
      this.shaft.updateControlPoint(2,rpos);
      this.width = this.shaft.width;
      break;
   
    case 3:
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

item.connectionType = 'EastWest'; 

ui.hide(item,['head','shaft','direction','elbowPlacement','end0','end1']);
item.setFieldType('solidHead','boolean');

return item;

});

