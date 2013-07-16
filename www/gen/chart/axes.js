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
  lib.Axes.set("line", geom.Line.mk({e0:[0,0],e1:[0,0],style:{lineWidth:2,strokeStyle:"rgb(0,0,0)"}}).mfreeze());
 // lib.Axes.line.e0.__mfrozen__ = 1;
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
      text.style.setf('align','center');
      text.set('pos',geom.Point.mk(0,22)).mthaw();
    } else {
      e0.setCoords(0,xt+htwd);
      e1.setCoords(0,-htwd);
      text.style.setf('align','left');
      text.set('pos',geom.Point.mk(-22,0)).mthaw();
    }
    text.pos.__computed__ = 1;
      
    var rs = om.DNode.mk();
    var ticks = this.ticks;
    var captions = this.captions;
    if (!ticks) {
      var ticks = om.LNode.mk();
      var captions = om.LNode.mk();
      this.set("ticks",ticks);
      this.set("captions",captions);
    }
    var ct = ft;
    //console.log("dt",dt);
    var cnt = 0;
    var numTicks = ticks.length;
    while (ct  <= ub) {
      var lb = sc.label(ct);
      //console.log("ct",ct);
      // there is some funny behavior with this code, arising from the fact that LNode inherits from an Array(), rather than being an ordinary array
      // tck is non null even if cnt>ticks.length, if at some time ticks was bigger
      // hence the alternative code
//      var tck = ticks[cnt];
//      if (!tck){
      if (cnt>=numTicks) {
        var tck = tick.instantiate();
        tck.hidden = 0;
        ticks.pushChild(tck);
        txt = text.instantiate();
        txt.hidden = 0;
        captions.pushChild(txt);
      } else {
        tck = ticks[cnt];
        txt = captions[cnt];
      }
      var ip = sc.eval(ct);  /* tick in image space, rather than data space */
      if (horizontal) {
        tck.e0.setf("x",ip);
        tck.e1.setf("x",ip);
      } else {
        tck.e0.setf("y",xt-ip);
        tck.e1.setf("y",xt-ip);
     }
      //txt.__isPrototype__ = 0;
      txt.setf("text",lb);
      if (horizontal) {
        txt.pos.setf('x',ip);
      } else {
        txt.pos.setf('y',xt-ip);
      }
      ct += iv;
      cnt++;
   }
   
   // get rid of left over ticks and captions, if any
     if ((ticks.length) > cnt) {
      ticks.length = cnt;
      captions.length = cnt;
     }
  //code
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
  
  
  
  

  

    
    
    
