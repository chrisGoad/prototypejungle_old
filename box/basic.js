  
core.require('/line/line.js','/shape/circle.js','/shape/rectangle.js',function (linePP,cornerPP,backgroundPP) {

core.standsAlone(['/shape/circle.js','/shape/rectangle.js','/line/line.js']);  // suitable for loading into code editor

let item = svg.Element.mk('<g/>');

/*adjustable parameters  */

item.width = 40;
item.height = 30;
item.extraRight = 0;
item.extraLeft = 0;
item.stroke = 'black';
item.fill = 'transparent';
item['stroke-width'] = 2;


/* end adjustable parameters */

item.role = 'vertex';
item.resizable = true;
item.text = '';
item.lineP = core.installPrototype('line',linePP);
item.cornerP = core.installPrototype('corner',cornerPP);
item.backgroundP = core.installPrototype('line',backgroundPP);
item.cornerOffset = -5;
item.cornerP.dimension = 3;



const drawRectangleWithMiter = function ({topLine,rightLine,bottomLine,leftLine,width,height,strokeWidth}) {
  let hw = width/2;
  let hh = height/2;
  let hsw = strokeWidth/2;
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
  const newLine = () => {
    let rs = this.lineP.instantiate();
    rs.unselectable = true;
    rs.role = 'line';
    rs.undraggable = true;
    rs.show();
    return rs;
   }
   const newCorner = () => {
    let rs = this.cornerP.instantiate();
    rs.unselectable = true;
    rs.role = 'spot'; //for now
    rs.undraggable = true;
    rs.show();
    return rs;
  };
  const newBackground = () => {
    let rs = this.backgroundP.instantiate();
    rs.stroke = 'transparent';
    rs.unselectable = true;
    rs.role = 'background';
    rs.undraggable = true;
    rs.show();
    
    return rs;
  }
  const updateCorner = (corner,pos) => {
    if (corner) {
      corner.moveto(pos);
      corner.update();
    }
  }
  // stroke is brought down from above unless some individual stroke has been changed
 
  
  let topLine,rightLine,bottomLine,leftLine;
  
  if (!this.top) {
    this.set('background',newBackground());
    this.set("top",newLine());
    this.set("right",newLine());
    this.set("bottom",newLine());
    this.set("left",newLine());
    
    //this.background.moveto(geom.Point.mk(0,0));
    this.top.unselectable = true;
    this.right.unselectable = true;
    this.bottom.unselectable = true;
    this.left.unselectable = true;
  }
  if ((this.cornerOffset !== 0) && !this.topRightCorner) {
     this.set("topLeftCorner",newCorner());
    this.set("topRightCorner",newCorner());
    this.set("bottomLeftCorner",newCorner());
    this.set("bottomRightCorner",newCorner());
  } else if ((this.cornerOffset === 0) && this.topRightCorner) {
    this.topLeftCorner.hide();
    this.topRightCorner.hide();
    this.bottomLeftCorner.hide();
    this.bottomRightCorner.hide();
  } else if (this.topRightCorner) {
    this.topLeftCorner.show();
    this.topRightCorner.show();
    this.bottomLeftCorner.show();
    this.bottomRightCorner.show();    
  }
  topLine = this.top;
  rightLine = this.right;
  bottomLine = this.bottom;
  leftLine = this.left;
  let lineProto = Object.getPrototypeOf(topLine);
  lineProto.stroke = this.stroke;
  lineProto['stroke-width'] = this['stroke-width'];

  if (ui.vars.unwrapAll)  {  // the background interferes with selecting the parts
    this.background.width = 4;
    this.background.height = 4;
  } else {
    this.background.show();
    this.background.width = this.width;
    this.background.height = this.height;
    this.background.fill = this.fill;

  }
  this.background.update();
  let hw = this.width/2;
  let hh = this.height/2; 
  let lowerRight = Point.mk(hw,hh);
  let upperLeft = Point.mk(-hw,-hh);
  let upperRight = Point.mk(hw,-hh);
  let lowerLeft = Point.mk(-hw,hh);
  if (this.cornerOffset !== 0) {
    let cornerX = hw + this.cornerOffset;
    let cornerY = hh + this.cornerOffset; 
    updateCorner(this.topLeftCorner,Point.mk(-cornerX,-cornerY));
    updateCorner(this.topRightCorner,Point.mk(cornerX,-cornerY));
    updateCorner(this.bottomLeftCorner,Point.mk(-cornerX,cornerY));
    updateCorner(this.bottomRightCorner,Point.mk(cornerX,cornerY));
  }
  if ((this.extraRight === 0) && (this.extraLeft === 0)) {
    drawRectangleWithMiter({topLine,rightLine,bottomLine,leftLine,width:this.width,height:this.height,strokeWidth:this['stroke-width']});
    return;
  }  
  let extraLeftH = Point.mk(this.extraLeft,0);
  let extraRightH = Point.mk(this.extraRight,0);
  let extraLeftV = Point.mk(0,this.extraLeft);
  let extraRightV = Point.mk(0,this.extraRight);
  this.top.setEnds(upperLeft.difference(extraLeftH),upperRight.plus(extraRightH));
  this.right.setEnds(upperRight.difference(extraLeftV),lowerRight.plus(extraRightV));
  if (this.bottom) {
    this.bottom.setEnds(lowerRight.plus(extraLeftH),lowerLeft.difference(extraRightH));
    this.bottom.update();
  }
  this.left.setEnds(lowerLeft.plus(extraLeftV),upperLeft.difference(extraRightV));
  this.top.update();
  this.right.update();
  this.left.update();
}
graph.installRectanglePeripheryOps(item);

ui.hide(item,['top','right','bottom','left']);
return item;
});

