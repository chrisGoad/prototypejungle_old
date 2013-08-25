
(function () {
  var lib = __pj__.setIfMissing("chart");
  var om = __pj__.om;
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var arrow = lib.set("Arrow",om.DNode.mk()).namedType();
  arrow.lengthFactor = 0.9;
  arrow.baseWidth = 10;
  arrow.endWidth = 10;
  arrow.set("startPoint",geom.Point.mk(0,0));
  arrow.set("endPoint",geom.Point.mk(100,0));
  arrow.headInnerWidth = 5;
  arrow.headWidth = 2;/// how much behond the inner width the head of the arrow protrudes
  arrow.headLength = 10;
  arrow.set("style",draw.Style.mk({fillStyle:"black",lineWidth:1}));
  arrow.draw = function () {
    var draw = __pj__.draw;
    var drawops = draw.drawOps;
    var dir = this.endPoint.difference(this.startPoint);
    var fc = this.lengthFactor;
    var dir1 = dir.normalize();
    var ln = dir.length();
    var sb = dir1.times(ln * (1-fc));// shorten by this much
    var startP = this.startPoint;
    var endP = this.endPoint.difference(sb);
    var headOuterWidth = this.headInnerWidth + this.headWidth;
    
    var dir1n = dir1.normal();
    var baseVec = dir1n.times(0.5*this.baseWidth);// the vector from the startPoint out to one base point 
    var b0 = startP.plus(baseVec);// one end of  base
    var b1 =startP.difference(baseVec);
    var headPos = endP.difference(dir1.times(this.headLength));
    var headInnerVec = dir1n.times(0.5*this.headInnerWidth);
    var headOuterVec = dir1n.times(0.5*headOuterWidth);
    var hInner0 = headPos.plus(headInnerVec);
    var hInner1 = headPos.difference(headInnerVec);
    var hOuter0 = headPos.plus(headOuterVec);
    var hOuter1 = headPos.difference(headOuterVec);
    // ok, those are the points making up the arrow. now, draw it
    var drawPath = function (doFill,doStroke) {
      drawops.beginPath();
      drawops.moveTo(b0);
      drawops.lineTo(hInner0);
      drawops.lineTo(hOuter0);
      drawops.lineTo(endP);
      drawops.lineTo(hOuter1);
      drawops.lineTo(hInner1);
      drawops.lineTo(b1);
      drawops.lineTo(b0);
      drawops.fill();
    }
    this.draw2d(undefined,drawPath);
  }

 
 om.save(arrow);
    

})();
  
  
  
  

  

    
    
    
