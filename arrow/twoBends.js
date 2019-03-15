//cArrow

core.require('/shape/twoBends.js','/arrow/solidHead.js','/text/attachedText.js',function (shaftP,arrowHeadP,textItemP) {

let item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.vertical = false; // the middle segment is vertical
item.includeArrow = false;
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
//item.head.unselectable = true;

item.set('direction0',geom.Point.mk(1,0));

item.set('direction1',geom.Point.mk(1,0));


item.pointsPositive0 = function () { // end0 points positive
 let middle = this.shaft.middlePoint();
 let end = this.end0;
 return this.vertical? end.x  < middle : end.y < middle.y;
 
}

item.pointsPositive1 = function () { // end1 points positive
 let middle = this.shaft.middlePoint();
 let end = this.end1;
 return this.vertical? middle.x  < end.x : middle.y < end.y;
 
}

  

item.computeEnd1 = function (deviation) {
 return this.end1.plus(this.direction.times(deviation));
}

item.update = function () {
  let e0 = this.end0;
  let e1 = this.end1;
  let includeArrow = this.includeArrow;
  if (includeArrow) {
    if (!this.head) {
      this.set('head',arrowHeadP.instantiate());
      this.head.unselectable = true;
    }
  }  
 // let x1 = e1.x;
 // let cx = e0.x + this.width;
 // let flip = cx > x1;
  let shaft = this.shaft;
  let head = this.head;
  let vertical = this.vertical;
  this.connectionType = vertical?"EastWest":"UpDown"; 
  shaft.vertical = vertical;
  let positiveDir0 = this.pointsPositive0();
  let dir0 = (vertical?Point.mk(1,0):Point.mk(0,1)).times(positiveDir0?1:-1);
  this.direction0.copyto(dir0);
  let positiveDir1 = this.pointsPositive1();
  let dir1 = (vertical?Point.mk(1,0):Point.mk(0,1)).times(positiveDir1?1:-1);
  this.direction1.copyto(dir1);
  let shaftEnd = (includeArrow&&head.solidHead)?e1.plus(this.direction1.times(-this.headLength)):e1;
  this.shaft.end0.copyto(e0);
  this.shaft.end1.copyto(shaftEnd);
  core.setProperties(this.shaft,this,['stroke-width','stroke','width','elbowWidth']);
  this.shaft.update();
  //thhead.headPoint.copyto(e1);
  //this.head.direction.copyto(this.direction.times(flip?-1:1));
  if (includeArrow) {
    if (head.solidHead) {
      head.fill = this.stroke;
    } else {
      core.setProperties(head,this,['stroke','stroke-width']);
    }
    core.setProperties(head,this,['headLength','headWidth']);
    head.headPoint.copyto(e1);
    head.direction.copyto(dir1);
    head.update();
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
  let rs = this.shaft.controlPoints();
  if (this.includeArrow) {
    rs.push(this.head.controlPoint());
  }
  return rs;
  //let headControlPoint = this.head.controlPoint();
 // return [this.end0,this.end1,shaftControlPoints[2],headControlPoint];
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

