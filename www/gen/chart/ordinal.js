//var smudge = __pj__.set("smudge",om.mkDNode());

(function () {
  var om = __pj__.om;
 
  /* Scales have to do with mapping data space to image/pixel space. Each scale has a coverage (in data space), and an extent (in image space).
    
    For ordinal scales the coverage is not needed (it is just the set of data values). 
    
  */
  
  var item=__pj__.set("/chart/Ordinal",geom.Shape.mk()); 

  item.extent = 100;
  
  
  
  item.update = function () { 
    var dt = this.data.eval();
    var ln = dt.length;
    
    var fld = this.field;
    var mx = dt.max(fld);
    var mn = dt.min(fld);
    var cv = __pj__.geom.mkInterval(0,ln-1);
    cv.__mfrozen__ = 1;
    this.set("coverage",cv);
  }
  
  item.eval = function (o) {
    var xt = this.extent;
    var cv = this.coverage;
    var ln = cv.ub+1;
    var rs = xt * (o+0.5)/ln;
    return rs;
  }
  
  
  item.label = function (dv) { /* dv = value in data space (ie ordinal for this case)*/
    var fld = this.field;
    var dt = this.data;
    var d =  dt[dv];
    return d[fld];
  }
  
  item.mk = function () {
    var rs = Object.create(this);
    return rs;
  }
  
   om.save(item);
  

})();
  
  
  
  

  

    
    
    
