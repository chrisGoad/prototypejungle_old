//var smudge = __pj__.set("smudge",om.mkDNode());

(function () {
  var lib = __pj__.setIfMissing("chart");
  var om = __pj__.om;
 
  /* Scales have to do with mapping data space to image/pixel space. Each scale has a coverage (in data space), and an extent (in image space).
    
    For ordinal scales the coverage is not needed (it is just the set of data values). For linear scales, the coverage is an interval,
    and the extent is just a number (the width or height).
    
  */
  
  
  lib.installType("Ordinal");
  lib.Ordinal.setN("data", [{x:"a"},{x:"b"},{x:"c"}]);
  
  lib.Ordinal.extent = 100;
  
  
  
  lib.Ordinal.update = function () { 
    var dt = this.data.eval();
    var ln = dt.length;
    
    var fld = this.field;
    var mx = dt.max(fld);
    var mn = dt.min(fld);
    var cv = __pj__.geom.mkInterval(0,ln-1);
    console.log("cv",mx,cv);
    this.set("coverage",cv);
  }
  
  lib.Ordinal.eval = function (o) {
    var xt = this.extent;
    var cv = this.coverage;
    var ln = cv.ub+1;
    var rs = xt * (o+0.5)/ln;
    return rs;
//    return xt * (o+1)/(ln+1);
  }
  
  
  lib.Ordinal.label = function (dv) { /* dv = value in data space (ie ordinal for this case)*/
    var fld = this.field;
    var dt = this.data;
    var d =  dt[dv];
    return d[fld];
  }
  
  lib.Ordinal.mk = function () {
    var rs = Object.create(this);
    return rs;
  }
  
   om.save(lib.Ordinal);
  
  lib.installType("Linear");
  
  lib.Linear.setN("data",[{x:1,y:6},{x:100,y:100}]);
  lib.Linear.set("field","y");
  lib.Linear.extent = 200;
  
  lib.Linear.eval = function (dv) {
    //console.log("lineareval",this);
    var cv = this.coverage;
    var xt = this.extent;
    var fr = (dv - cv.lb)/(cv.ub - cv.lb);
    /*if ((fr < 0) || (fr > 1)) return undefined;*/
    return xt * fr;
 
  }
  
  
  lib.Linear.label = function (dv) {
    return dv;
  }
  
  lib.Linear.update = function () { 
    var dt = this.data.eval();
    var fld = this.field;
    var mx = dt.max(fld);
    /*var mn = dt.min(fld);*/
    var cv = __pj__.geom.mkInterval(0,mx);
    console.log("cv",mx,cv);
    this.set("coverage",cv);
  }
  
  lib.Linear.mk = function () {
    var rs = Object.create(this);
    return rs;
  }
 om.save(lib.Linear);//,"replicators/ArcSmudge2");
    

})();
  
  
  
  

  

    
    
    
