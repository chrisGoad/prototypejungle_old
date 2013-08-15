
(function () {
  var lib = __pj__.setIfMissing("chart");
  var om = __pj__.om;
  var geom = __pj__.geom;
  
  lib.set("Marks",om.DNode.mk()).namedType();
  
  lib.Marks.set("template",geom.Rectangle.mk({style:{fillStyle:"blue",hidden:1}}));
  lib.Marks.template.extent.x = 4;
  lib.Marks.padding = 4;
  lib.Marks.setInputF('padding',om,'checkNumber');
  lib.Marks.setNote('padding','The spacing between the bars');
  lib.Marks.template.extent.mfreeze();
  lib.Marks.updateOne = function (tm,idx,dv) {
    var yxt = this.yScale.extent;
    tm.corner.setCoords(this.xScale.eval(idx) - 0.5 * tm.extent.x,yxt - this.yScale.eval(dv));
    tm.extent.setf("y",this.yScale.eval(dv));
  }
  lib.Marks.update = function () {
    var om = __pj__.om;
    var d = this.data.eval();
    var ln = d.length;
    var m = this.set("marks",om.LNode.mk()).computed();
    var xext = this.xScale.extent;
    var wd = (xext/ln)-(2* this.padding);
    this.template.extent.setf("x",wd);
    var fld = this.yScale.field;
    for (var i=0;i<ln;i++) {
      var dv = d[i][fld];
      var tm = this.template.instantiate();
      tm.show();
      tm.corner.mfreeze();
      m.pushChild(tm);
      tm.datum = d[i];
      this.updateOne(tm,i,dv);
    }    
  }
  
 om.save(lib.Marks);
    

})();
  
  
  
  

  

    
    
    
