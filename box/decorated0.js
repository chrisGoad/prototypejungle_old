core.require('/line/line.js','/shape/circle.js','/shape/rectangle.js',function (linePP,cornerPP,backgroundPP) {

let item = svg.Element.mk('<g/>');
/*adjustable parameters  */

item.width = 35;
item.height = 35;
item.minDimension = 10;
item.stroke = 'black';
item.fill = 'transparent';
item['stroke-width'] = 2;
/* end adjustable parameters */

item.role = 'vertex';
item.resizable = true;
item.lineP = core.installPrototype('line',linePP);
item.cornerP = core.installPrototype('corner',cornerPP);
item.backgroundP = core.installPrototype('line',backgroundPP);

item.cornerP.dimension = 5;





item.update = function () {
  let proto = Object.getPrototypeOf(this);
  if (this.topLine) {
    proto.lineP = Object.getPrototypeOf(this.topLine); // in case the prototype has been swapped 
    proto.cornerP = Object.getPrototypeOf(this.topLeftCorner); // in case the prototype has been swapped 
  }
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
  };
  if (!this.topLine) {
     this.set('background',newBackground());
   this.set("topLine",newLine());
    this.set("rightLine",newLine());
    this.set("bottomLine",newLine());
    this.set("leftLine",newLine());
    this.set("topLeftCorner",newCorner());
    this.set("topRightCorner",newCorner());
    this.set("bottomLeftCorner",newCorner());
    this.set("bottomRightCorner",newCorner());
  }
  if (this.width < this.minDimension) {
    this.setActiveProperty('width',this.minDimension);
  }
  if (this.height < this.minDimension) {
    this.setActiveProperty('height',this.minDimension);
  }
  let hcornerDim = this.topLeftCorner.getWidth();
  let vcornerDim = this.topLeftCorner.getHeight();
  let hw = this.width/2;
  let hh = this.height/2;
  let ihw = (this.width-hcornerDim)/2;
  let ihh = (this.height-vcornerDim)/2;
  let topLeft = Point.mk(-hw,-hh);
  let topRight = Point.mk(hw,-hh);
  let bottomLeft = Point.mk(-hw,hh);
  let bottomRight = Point.mk(hw,hh);
  let innerTopLeft = Point.mk(-ihw,-hh);
  let innerTopRight = Point.mk(ihw,-hh);
  let innerBottomLeft = Point.mk(-ihw,hh);
  let innerBottomRight = Point.mk(ihw,hh);  
  let outerTopLeft = Point.mk(-hw,-ihh);
  let outerTopRight = Point.mk(hw,-ihh);
  let outerBottomLeft = Point.mk(-hw,ihh);
  let outerBottomRight = Point.mk(hw,ihh);   
  this.topLine.setEnds(innerTopLeft,innerTopRight);
  this.rightLine.setEnds(outerTopRight,outerBottomRight);
  this.bottomLine.setEnds(innerBottomRight,innerBottomLeft);
  this.leftLine.setEnds(outerBottomLeft,outerTopLeft);
  let lineProto = Object.getPrototypeOf(this.topLine);
  lineProto.stroke = this.stroke;
  lineProto['stroke-width'] = this['stroke-width'];
  /*const transferStrokeProps = (what) => {
    if (what) {
      what['stroke-width'] = this['stroke-width'];
      what.stroke = this.stroke;
      what.fill = this.fill;
    }
  };
   transferStrokeProps(this.topLine);
  transferStrokeProps(this.rightLine);
  transferStrokeProps(this.bottomLine);
  transferStrokeProps(this.leftLine);
  transferStrokeProps(this.topLeftCorner);
  transferStrokeProps(this.topRightCorner);
  transferStrokeProps(this.bottomLeftCorner);
  transferStrokeProps(this.bottomRightCorner);
  */
  this.topLine.update();
  this.rightLine.update();
  this.bottomLine.update();
  this.leftLine.update();
  this.background.width = this.width;
  this.background.height = this.height;
  this.background.fill = this.fill;
  this.background.update();
 // this.cornerP.dimension  = cornerDim;
 // this.cornerP['stroke-width'] =this.cornerStrokeWidth;
  this.topLeftCorner.update();
  this.topRightCorner.update();
  this.bottomLeftCorner.update();
  this.bottomRightCorner.update();
  this.topLeftCorner.moveto(topLeft);
  this.topRightCorner.moveto(topRight);
  this.bottomLeftCorner.moveto(bottomLeft);
  this.bottomRightCorner.moveto(bottomRight);
};

graph.installRectanglePeripheryOps(item);



ui.hide(item,['topLine','rightLine','bottomLine','leftLine',
              'topLeftCorner','topRightCorner','bottomLeftCorner','bottomRightCorner']);

              
item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}

return item;
});
