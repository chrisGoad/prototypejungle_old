(function () {
  var om = __pj__.om;
  var geom = __pj__.geom;
 
  /* Scales have to do with mapping data space to image/pixel space. Each scale has a coverage (in data space), and an extent (in image space).
    For linear scales, the coverage is an interval,
    and the extent is just a number (the width or height).
    
  */
  
  var item=__pj__.set("/chart/Linear",geom.Shape.mk()); 

  item.setN("data",[{x:1,y:6},{x:100,y:100}]);
  item.set("field","y");
  item.extent = 200;
  
  item.eval = function (dv) {
    var cv = this.coverage;
    var xt = this.extent;
    var fr = (dv - cv.lb)/(cv.ub - cv.lb);
    return xt * fr;
 
  }
  
  
  item.label = function (dv) {
    return dv;
  }
  
  item.update = function () { 
    var dt = this.data.eval();
    var fld = this.field;
    var mx = dt.max(fld);
    var cv = __pj__.geom.mkInterval(0,mx);
    cv.__mfrozen__ = 1;
    this.set("coverage",cv);
  }
  
  item.mk = function () {
    var rs = Object.create(this);
    return rs;
  }
 om.save(item);
    

})();
  
  
  
  

  

    
    
    
