//var smudge = __pj__.set("smudge",om.mkDNode());

(function () {
  var lib = __pj__.setIfMissing("chart");
  var om = __pj__.om;
 
 
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
    cv.__mfrozen__ = 1;
    console.log("cv",mx,cv);
    this.set("coverage",cv);
  }
  
  lib.Linear.mk = function () {
    var rs = Object.create(this);
    return rs;
  }
 om.done(lib.Linear);//,"replicators/ArcSmudge2");
    

})();
  
  
  
  

  

    
    
    
