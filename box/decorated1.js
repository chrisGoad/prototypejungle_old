
core.require('/line/line.js',function (linePP,textItemP) {

let item = svg.Element.mk('<g/>');

/*adjustable parameters  */

item.width = 35;
item.height = 35;
item.horizontalInset = 5;
item.verticalInset = 5;
item.minDimension = 10;
/* end adjustable parameters */

item.role = 'vertex';
item.resizable = true;
item.text = '';
item.lineP = core.installPrototype('line',linePP);
//item.lineP['stroke-linejoin'] = 'miter';
item.innerLineP = core.installPrototype('line',linePP);

// so that the container will know how much space to allocate for the border
item.topSize = item.bottomSize = function () {
  return this.verticalInset; 
}


item.sideSize = function () {
  return this.horizontalInset;
}



const drawRectangleWithMiter = function ({topLine,rightLine,bottomLine,leftLine,width,height,strokeWidth}) {
  let hw = width/2;
  let hh = height/2;
  let hsw = 0.5 * strokeWidth;
  let topLeftV = Point.mk(-hw,-hh-hsw); // top left for the vertical line; we need to go up past half a stroke width for mitering
  let topLeftH = Point.mk(-hw-hsw,-hh); // top left for the horizontal  line; ditto
  let topRightV = Point.mk(hw,-hh-hsw);
  let topRightH = Point.mk(hw+hsw,-hh);
  let bottomLeftH = Point.mk(-hw-hsw,hh);
  let bottomLeftV = Point.mk(-hw,hh+hsw);
  let bottomRightH = Point.mk(hw+hsw,hh);
  let bottomRightV = Point.mk(hw,hh+hsw);
  if (topLine) {
    topLine.setEnds(topLeftH,topRightH);
    topLine.update();
  }
  if (rightLine) {
    rightLine.setEnds(topRightV,bottomRightV);
    rightLine.update();
  }
  if (bottomLine) {
    bottomLine.setEnds(bottomRightH,bottomLeftH);
    bottomLine.update();
  }
  if (leftLine) {
    leftLine.setEnds(bottomLeftV,topLeftV);
    leftLine.update();
  }
}


item.update = function () {
  let proto = Object.getPrototypeOf(this);
  if (this.topLine) {
    proto.lineP = Object.getPrototypeOf(this.topLine); // in case the prototype has been swapped 
    proto.innerLineP = Object.getPrototypeOf(this.innerTopLine); // in case the prototype has been swapped 
  }
  const newLine = (inner) => {
    let rs = inner?this.innerLineP.instantiate():this.lineP.instantiate();
    rs.unselectable = true;
    rs.role = 'line';
    rs.undraggable = true;
    rs.show();
    return rs;
  }
  let topLine,rightLine,bottomLine,leftLine;
  let innerTopLine, innerRightLine, innerBottomLine, innerLeftLine;
  if (!this.topLine) { 
  
    this.set("topLine",newLine(false));
    this.set("rightLine",newLine(false));
    this.set("bottomLine",newLine(false));
    this.set("leftLine",newLine(false));
     this.set("innerTopLine",newLine(true));
    this.set("innerRightLine",newLine(true));
    this.set("innerBottomLine",newLine(true));
    this.set("innerLeftLine",newLine(true));
    
  }
  ({topLine,rightLine,bottomLine,leftLine} = this);
  ({innerTopLine,innerRightLine,innerBottomLine,innerLeftLine} = this);
  
  let oproto =  Object.getPrototypeOf(this.topLine);
  let osrc = oproto.__sourceUrl;
  let needsMiter = osrc === '/line/line.js';
  let width = this.width;
  let height = this.height;
  let strokeWidth  = needsMiter? Object.getPrototypeOf(this.topLine)['stroke-width']:0;
  let innerLine = innerTopLine||innerRightLine||innerBottomLine||innerLeftLine; // so that some inner lines can be deleted
  let innerStrokeWidth = needsMiter? Object.getPrototypeOf(innerLine)['stroke-width']:0;

  drawRectangleWithMiter({topLine,rightLine,bottomLine,leftLine,width,height,strokeWidth});
  let innerWidth = this.width-2*this.horizontalInset;
  let innerHeight = this.height-2*this.verticalInset;
  drawRectangleWithMiter({topLine:innerTopLine,rightLine:innerRightLine,bottomLine:innerBottomLine,leftLine:innerLeftLine,
                          width:innerWidth,height:innerHeight,strokeWidth:innerStrokeWidth});

}

graph.installRectanglePeripheryOps(item);


ui.hide(item,['topLine','rightLine','bottomLine','leftLine',
              'topLeftCorner','topRightCorner','bottomLeftCorner','bottomRightCorner']);

                    
return item;
});

