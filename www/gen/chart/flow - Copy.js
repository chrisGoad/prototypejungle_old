
(function () {
  var chart = __pj__.setIfMissing("chart");
  var om = __pj__.om;
  var geom = __pj__.geom;
  
   
om.install(["http://s3.prototypejungle.org/pj/repo0/chart/Arrow"],function () {

  var flow = chart.set("Flow",geom.Shape.mk()).namedType();
  flow.topNote = "Everything is draggable";
  flow.diagramDiameter = 300;
  flow.externalArrowCaptionAlong = 2;
  flow.arrowCaptionAlong = 30;
  flow.arrowCaptionLineHeight = 10;
  flow.arrowWidthFactor = 0.05;
  flow.arrowMinWidth = 1;
  flow.magnitudeFactor = 0.8;
  flow.externalArrowLength = 50;
  flow.set("arrowTemplate",chart.Arrow.instantiate()).hide();
  flow.arrowTemplate.headOuterFactor =2;
  flow.arrowTemplate.headLengthFactorByLength = 0.3;
  flow.arrowTemplate.headLengthFactorByWidth = 2;
  flow.arrowTemplate.lengthFactor = 1.1;
  flow.externalArrowCaptionOffset = 7.5;
  flow.set("magCaptionOffset",geom.Point.mk(0,15));
  flow.set("circleTemplate",geom.Circle.mk({style:{strokeStyle:null,"fillStyle":"green",lineWidth:2}})).hide();
  flow.set("circleCaptionTemplate", geom.Text.mk({style:{hidden:1,fillStyle:"black",align:"center",font:"arial bold",height:12}}));
   flow.set("magCaptionTemplate", geom.Text.mk({style:{hidden:1,fillStyle:"black",align:"center",font:"arial bold",height:8}}));
  flow.set("arrowCaptionTemplate", geom.Text.mk({style:{hidden:1,fillStyle:"black",align:"left",font:"arial",height:9}}));
  flow.set("externalArrowCaptionTemplate", geom.Text.mk({style:{hidden:1,fillStyle:"black",align:"left",font:"arial",height:12}}));
  flow.set("mainCaptionTemplate", geom.Text.mk({style:{hidden:1,fillStyle:"black",align:"left",font:"arial",height:12}}));

  

  flow.set("circles",geom.Shape.mk());
  flow.set("arrows",geom.Shape.mk());
  flow.update = function () {
    var geom = __pj__.geom;
    var draw = __pj__.draw;
    var om = __pj__.om;
    // data is loaded at runtime;  so it is installed at update time, not build time
    if  (!this.dataSource){
      this.set("dataSource",om.DataSource.mk("http://prototypejungle.org/data/chart/trade2012.js"));
    }
    var dt = this.dataSource.data;
    if (!dt) return; // data not ready
    if (!this.mainCaption) {
      this.set("mainCaption",this.mainCaptionTemplate.instantiate().show());
      this.mainCaption.text = "Trade Flows 2012";
      this.mainCaption.draggable = 1;
      var newMainCaption = 1;
    }
    var fdt  = dt.flows;
    var order = dt.order;
    var circles = this.circles;
    var arrows = this.arrows;
    var thisHere = this;
    var circleTemplate = this.circleTemplate;
    var arrowTemplate = this.arrowTemplate;
  
    // allocate the circles
    var sep = 100; // to initialize positions; dragging by user expected!
    var cnt = order.length;
    var initialCenter = geom.Point.mk(500,500);
    var dCenter = geom.Point.mk(0,0);//computed center of the diagram
    var n = 0;
    // allocate and position the circles
    for (var n=0;n<cnt;n++) {
      var id = order[n];
      var cd = fdt[id];  
      var mag = cd.magnitude;
      var cAngle = 1.5*Math.PI + n * (Math.PI*2)/cnt;
      var cdir = geom.Point.mk(Math.cos(cAngle),Math.sin(cAngle));
      var spoke = cdir.times(thisHere.diagramDiameter/2);
      var cCenter = initialCenter.plus(spoke);
      var id = cd.__name__;
      var crcP = circles[id];
      if (!crcP) {
        crcP = geom.Shape.mk(); // contains the circle and caption
        crcP.draggable = 1;
        circles.set(id,crcP);
        var crc = circleTemplate.instantiate().show();
        var area = thisHere.magnitudeFactor * cd.magnitude;
        crc.radius = Math.sqrt(area/Math.PI);
        crc.style.fillStyle=cd.color;
        crcP.set("circle",crc);
        
        var caption = thisHere.circleCaptionTemplate.instantiate().show();
        caption.set("text",id);
        crcP.set("caption",caption);
        caption.draggable = 1;
        crcP.translate(cCenter);
        var magCaption = thisHere.magCaptionTemplate.instantiate().show();
        magCaption.set("text","$"+Math.floor(mag/1000)+" TRILLION");
        crcP.set("magCaption",magCaption);
        magCaption.translate(thisHere.magCaptionOffset);
        magCaption.draggable=1;
       
       // crcP.translate(geom.Point.mk(sep*cnt,0));
      }
      var area = thisHere.magnitudeFactor * cd.magnitude;
      crc = crcP.circle;
      crc.radius = Math.sqrt(area/Math.PI);
      var ccenter  =  crc.center.toGlobalCoords(crc.center,draw.wsRoot);
      dCenter = dCenter.plus(ccenter);

    };
    dCenter = dCenter.times(1/cnt);
    if (newMainCaption) {
      this.mainCaption.translate(dCenter);
    }
    //  allocate and set up the internal arrows
    fdt.iterTreeItems(function (cd) {
      var srcName = cd.__name__;
      srcCirc = circles[srcName].circle;
      var srcColor = cd.color;
      var flows=cd.flows;
      var externalFlows=cd.externalFlows;
      var destNames = flows.properties();
      destNames.forEach(function (destName) {
        var destCircP = circles[destName];
        if (!destCircP) return;
        var destCirc = destCircP.circle;
        var fl = flows[destName];
        var aname = srcName+"_"+destName;
        var a = arrows[aname];
        if (!a) {
          a = geom.Shape.mk();
          arrows.set(aname,a);
          a.draggable = 1;
          var aa = arrowTemplate.instantiate().show();
          aa.style.fillStyle = srcColor;
          a.set('arrow',aa);
          var aCaption = thisHere.arrowCaptionTemplate.instantiate().show();
          aCaption.draggable = 1;
          // wrap the caption in a shape, so the user can adjust its postion
          var cC = geom.Shape.mk();
          //cC.draggable  = 1;
          aCaption.set("text","$"+Math.floor(fl));
          a.set("captionContainer",cC);
          cC.set("caption",aCaption);
        }
        var wd = Math.max(thisHere.arrowWidthFactor * fl,thisHere.arrowMinWidth);
        a.arrow.baseWidth = a.arrow.headInnerWidth = wd;

        var scenter  =  srcCirc.toGlobalCoords(srcCirc.center,draw.wsRoot);
        var dcenter  = destCirc.toGlobalCoords(destCirc.center,draw.wsRoot);
        var dir = dcenter.difference(scenter).normalize();
        var asp = scenter.plus(dir.times(srcCirc.radius));
        var aep =  dcenter.difference(dir.times(destCirc.radius));
        a.arrow.startPoint = asp;
        a.arrow.endPoint =aep;
        //var dir1 = dir.normalize();
        var capPos = aep.difference(dir.times(thisHere.arrowCaptionAlong));
        a.captionContainer.translate(capPos);
        var dird = dir.direction();
        if ((Math.PI/2  < dird) && (dird < 1.5 * Math.PI)) {
          dird = dird-Math.PI; // no upside down labels
        }
       // a.captionContainer.rotate(dird);
        // a.captionContainer.rotate(Math.PI/4);
        //a.captionContainer.caption.set("pos",asp.plus(dir1.times(thisHere.arrowCaptionAlong)));
      });
      //  allocate and set up the external arrows

  
    });
  }
  
  
  
  om.save(flow);
    

})
})();

  
  
  

  

    
    
    
