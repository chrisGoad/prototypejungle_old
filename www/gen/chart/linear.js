//var smudge = __pj__.set("smudge",om.mkDNode());

(function () {
  var lib = __pj__.setIfMissing("chart");
  var om = __pj__.om;
 
  /* Scales have to do with mapping data space to image/pixel space. Each scale has a coverage (in data space), and an extent (in image space).
    
    For linear scales, the coverage is an interval,
    and the extent is just a number (the width or height).
    
  */
  
  
    lib.set("Linear",om.DNode.mk()).namedType();

  lib.Linear.setN("data",[{x:1,y:6},{x:100,y:100}]);
  lib.Linear.set("field","y");
  lib.Linear.extent = 200;
  
  lib.Linear.eval = function (dv) {
    var cv = this.coverage;
    var xt = this.extent;
    var fr = (dv - cv.lb)/(cv.ub - cv.lb);
    return xt * fr;
 
  }
  
  
  lib.Linear.label = function (dv) {
    return dv;
  }
  
  lib.Linear.update = function () { 
    var dt = this.data.eval();
    var fld = this.field;
    var mx = dt.max(fld);
    var cv = __pj__.geom.mkInterval(0,mx);
    cv.__mfrozen__ = 1;
    this.set("coverage",cv);
  }
  
  lib.Linear.mk = function () {
    var rs = Object.create(this);
    return rs;
  }
 om.save(lib.Linear);
    

})();
  
  
  
  

  

    
    
    
