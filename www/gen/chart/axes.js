//var smudge = __pj__.set("smudge",om.mkDNode());

(function () {
  //var lib = draw.emptyWs("smudge");
  var lib = __pj__.setIfMissing("chart");
    var erefs = ["/chart/Linear","/chart/Ordinal"];
  var om = __pj__.om;
  var geom = __pj__.geom;

  
om.install(erefs,function () {
  lib.installType("Axes");
  lib.Axes.assertExternalReferences(erefs);
  lib.Axes.set("tick",geom.Line.mk({e0:[-10,0],e1:[0,10],hidden:1,style:{lineWidth:2,strokeStyle:"rgb(0,0,0)"}}));
 // lib.Axes.set("text", geom.newText({__isPrototype__:1,html:"Ho",style:{color:"black","width":"8px","background-color":"white","font-size":"9pt"}}));
  lib.Axes.set("text", geom.Text.mk({__isPrototype__:1,hidden:1,text:"",style:{fillStyle:"black",align:"center",font:"arial",height:10}}));
  lib.Axes.setN("data",[{x:1,y:6},{x:20,y:100}]);
  lib.Axes.set("line", geom.Line.mk({e0:[0,0],e1:[0,0],style:{lineWidth:2,strokeStyle:"rgb(0,0,0)"}}));
  lib.Axes.update = function () {
    var om = __pj__.om;
    var geom = __pj__.geom;
    var sc = this.scale;
    sc.data = this.data;
    sc.update();
    var ornt = this.orientation;
    var horizontal = ornt == "horizontal";
    //var sctp = sc.typeName();
    var lb = sc.coverage.lb;
    var ub = sc.coverage.ub;
    var xt = sc.extent;
    //if (sc.hasTypeName("Ordinal")) {
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
    // we want the prototype to be in the workspace
    //var textp = this.text.instantiate();
    //this.set("text",textp);
    var htwd = 0.5*tick.style.lineWidth;
    var e0 = this.line.e0;
    var e1 = this.line.e1;
    if (horizontal) {
      e0.setCoords(-htwd,0);
      e1.setCoords(xt+htwd,0);
      text.style.setc('align','center');

      //var ln = geom.mkLine([-htwd,0],[xt+htwd,0],this.style); /* so that the tick lines up right */
    } else {
      //var ln = geom.mkLine([0,htwd],[0,-(xt+htwd)],this.style); /* so that the tick lines up right */
      //var ln = geom.mkLine([0,xt+htwd],[0,-htwd],this.style); /* so that the tick lines up right */
      e0.setCoords(0,xt+htwd);
      e1.setCoords(0,-htwd);
      text.style.setc('align','left');

    }
    var rs = om.mkDNode();
    var ticks = this.ticks;
    var captions = this.captions;
    if (!ticks) {
      var ticks = om.mkLNode();
      var captions = om.mkLNode();
      this.set("ticks",ticks);
      this.set("captions",captions);
    }
    var ct = ft;
    //console.log("dt",dt);
    var cnt = 0;
    while (ct  <= ub) {
      var lb = sc.label(ct);
      //console.log("ct",ct);
      var tck = ticks[cnt];
      if (!tck){
        var tck = tick.instantiate();
        tck.hidden = 0;
        ticks.pushChild(tck);
     }
      var ip = sc.eval(ct);  /* tick in image space, rather than data space */
      if (horizontal) {
        tck.e0.setc("x",ip);
        tck.e1.setc("x",ip);
      } else {
        tck.e0.setc("y",xt-ip);
        tck.e1.setc("y",xt-ip);
     }
      var txt = captions[cnt]
      if (!txt) {
        txt = text.instantiate();
        txt.hidden = 0;
        captions.pushChild(txt);
      }
      //txt.__isPrototype__ = 0;
      txt.text = lb;
      if (horizontal) {
        txt.set('pos',geom.Point.mk(0,22));
        txt.pos.setc('x',ip);
      } else {
        txt.set('pos',geom.Point.mk(-22,0));
        txt.pos.setc('y',xt-ip);
      }
      ct += iv;
      cnt++;
   }
    //om.setval(this,"value",rs);
  }

  lib.Axes.contract = function () {
    delete this.ticks;
    delete this.captions;
  }
  
  lib.Axes.mk = function () {
    return Object.create(this);
  }
 

 om.save(lib.Axes);//,"replicators/ArcSmudge2");
});
})();
  
  
  
  

  

    
    
    
