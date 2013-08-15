//var smudge = __pj__.set("smudge",om.mkDNode());

(function () {
  var lib = __pj__.setIfMissing("chart");
  var om = __pj__.om;
 
  /* Scales have to do with mapping data space to image/pixel space. Each scale has a coverage (in data space), and an extent (in image space).
    
    For ordinal scales the coverage is not needed (it is just the set of data values). 
    
  */
  
  
  lib.set("Ordinal",om.DNode.mk()).namedType();
  //lib.Ordinal.setN("data", [{x:"a"},{x:"b"},{x:"c"}]);
  
  lib.Ordinal.extent = 100;
  
  
  
  lib.Ordinal.update = function () { 
    var dt = this.data.eval();
    var ln = dt.length;
    
    var fld = this.field;
    var mx = dt.max(fld);
    var mn = dt.min(fld);
    var cv = __pj__.geom.mkInterval(0,ln-1);
    cv.__mfrozen__ = 1;
    this.set("coverage",cv);
  }
  
  lib.Ordinal.eval = function (o) {
    var xt = this.extent;
    var cv = this.coverage;
    var ln = cv.ub+1;
    var rs = xt * (o+0.5)/ln;
    return rs;
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
  

})();
  
  
  
  

  

    
    
    
