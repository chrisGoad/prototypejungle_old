//var smudge = __pj__.set("smudge",om.mkDNode());

(function () {
  //var lib = draw.emptyWs("smudge");
  var lib = __pj__.setIfMissing("chart");
  var om = __pj__.om;
  var geom = __pj__.geom;
  
 // lib.installType("ArcSmudge2");
  lib.installType("Marks");
  //lib.Marks.xScale = lib.Ordinal.mk();
  //lib.Marks.yScale = lib.Linear.mk();
  
  lib.Marks.set("template",geom.Rectangle.mk({style:{fillStyle:"blue"}}));
  lib.Marks.template.extent.x = 4;
  lib.Marks.padding = 4;
  lib.Marks.template.hidden = 1;
  //lib.Marks.xform = lib.xforms.scale 
  lib.Marks.updateOne = function (tm,idx,dv) {
    var yxt = this.yScale.extent;
    tm.corner.setCoords(this.xScale.eval(idx) - 0.5 * tm.extent.x,yxt - this.yScale.eval(dv));
    tm.extent.setf("y",this.yScale.eval(dv));
  }
  lib.Marks.update = function () {
    var om = __pj__.om;
    var m = this.marks; // check if there is already a set of marks of the right length allocated
    var d = this.data.eval();
    var ln = d.length;
    var useExisting = m && (m.length == ln);
    var rs = om.LNode.mk();
    var xext = this.xScale.extent;
    var wd = (xext/ln)-(2* this.padding);
    this.template.extent.setf("x",wd);
    var fld = this.yScale.field;
    for (var i=0;i<ln;i++) {
      var dv = d[i][fld];
      if (useExisting) {
        var tm = m[i];
      } else {
        var tm = this.template.instantiate();
        tm.hidden = 0;
        tm.corner.__mfrozen__ = 1;
      }
      rs.pushChild(tm);
      tm.datum = d[i];
      this.updateOne(tm,i,dv);
    }
    this.set("marks",rs);
    
  }
  
  lib.Marks.contract = function () {
    delete this.marks;
  }
  
  lib.Marks.mk = function () {
    return Object.create(this);
  }
 
 om.save(lib.Marks);//,"replicators/ArcSmudge2");
    

})();
  
  
  
  

  

    
    
    
