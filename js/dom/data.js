// Copyright 2019 Chris Goad
// License: MIT

let data = codeRoot.set("data",core.ObjectNode.mk());
  data.__builtIn = true;

/* utilities for data
* A scale desaibes a mapping from data space to image space. The coverage of a scale is an interval
* in data space, and its extent an interval in image space
*/


    
data.set("LinearScale",core.ObjectNode.mk()).__namedType();
data.LinearScale.set("coverage",geom.Interval.mk(0,100));
data.LinearScale.set("extent",geom.Interval.mk(0,100));



data.LinearScale.setExtent = function (xt) {
  this.set("extent",(typeof xt ==="number")?geom.Interval.mk(0,xt):xt);
}

data.LinearScale.mk = function (cv,xt) {
  let rs = data.LinearScale.instantiate();
  if (cv) {
    rs.set("coverage",cv);
  }
  if (xt) {
    rs.setExtent(xt);
  }
  return rs;
}
  
data.LinearScale.eval = function (v) {
  let cv = this.coverage;
  let xt = this.extent;
  let sc = (xt.ub - xt.lb)/(cv.ub - cv.lb);
  return (this.isY)?xt.ub - sc * (v - cv.lb):xt.lb + sc * (v - cv.lb); // Y up 
}


data.LinearScale.dtToImScale = function () {
   let cv = this.coverage;
   let xt = this.extent;
   return (xt.ub-xt.lb)/(cv.ub - cv.lb);
}


data.LinearScale.label = function (dv) {
  return core.nDigits(dv,3);
}
