
(function () {
  //var lib = draw.emptyWs("smudge");
  var lib = __pj__.setIfMissing("chart");
  var om = __pj__.om;
  var geom = __pj__.geom;

  lib.set("Axes",om.DNode.mk()).namedType();
   
   // SOME PROTOTYPES

  lib.Axes.set("tick",geom.Line.mk({e0:[-10,0],e1:[0,10],style:{hidden:1,lineWidth:2,strokeStyle:"rgb(0,0,0)"}}));
  lib.Axes.set("text", geom.Text.mk({style:{hidden:1,fillStyle:"black",align:"center",font:"arial",height:10}}));
  lib.Axes.set("line", geom.Line.mk({e0:[0,0],e1:[0,0],style:{lineWidth:2,strokeStyle:"rgb(0,0,0)"}}).mfreeze());
  lib.Axes.update = function () {
    var om = __pj__.om;
    var geom = __pj__.geom;
    var sc = this.scale;
    sc.data = this.data;
    sc.update();
    var ornt = this.orientation;
    var horizontal = ornt == "horizontal";
    var lb = sc.coverage.lb;
    var ub = sc.coverage.ub;
    var xt = sc.extent;
    if (__pj__.chart.Ordinal.isPrototypeOf(sc)) {
      var iv = 1;
      var dt = sc.data.eval();
      var fld = sc.field;

    } else {
      var iv = this.tickInterval;
    }
    var ft = lb % iv;
    var tick = this.tick;
    var  text = this.text;
    var htwd = 0.5*tick.style.lineWidth;
    var e0 = this.line.e0;
    var e1 = this.line.e1;
    if (horizontal) {
      e0.setCoords(-htwd,0);
      e1.setCoords(xt+htwd,0);
      text.style.setf('align','center');
      text.set('pos',geom.Point.mk(0,22));
    } else {
      e0.setCoords(0,xt+htwd);
      e1.setCoords(0,-htwd);
      text.style.setf('align','left');
      text.set('pos',geom.Point.mk(-22,0));
    }
      
    var rs = om.DNode.mk();
    var captions = this.captions;
    var ticks = om.LNode.mk().computed();
    var captions = om.LNode.mk().computed();
    this.set("ticks",ticks);
    this.set("captions",captions);
    var ct = ft;
    var cnt = 0;
    var numTicks = ticks.length;
    while (ct  <= ub) {
      var lb = sc.label(ct);
      var tck = tick.instantiate();
      tck.show();
      ticks.pushChild(tck);
      txt = text.instantiate();
      txt.show();
      captions.pushChild(txt);
      var ip = sc.eval(ct);  /* tick in image space, rather than data space */
      if (horizontal) {
        tck.e0.setf("x",ip);
        tck.e1.setf("x",ip);
      } else {
        tck.e0.setf("y",xt-ip);
        tck.e1.setf("y",xt-ip);
      }
      txt.setf("text",lb);
      if (horizontal) {
        txt.pos.setf('x',ip);
      } else {
        txt.pos.setf('y',xt-ip);
      }
      ct += iv;
      cnt++;
   }
  }


 om.save(lib.Axes);
 


})();
  
  
  
  

  

    
    
    
