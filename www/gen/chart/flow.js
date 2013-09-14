
(function () {
  var chart = __pj__.setIfMissing("chart");
  var om = __pj__.om;
  var geom = __pj__.geom;
  
   
om.install(["http://s3.prototypejungle.org/pj/repo0/chart/Arrow"],function () {

  var item=__pj__.set("/chart/Flow",geom.Shape.mk());
  
  item.__about__ = '<p>This is a good example of combining algoritmic construction and hand adjustment.  The algorithms place the circles, arrows, \
  and captions in approximately the right places, and set  widths, sizes, and captions to exactly reflect the data, \
  but a process of hand-dragging of captions and arrows is needed to achieve acceptable final placement.  Adjustment can take place at \
  the prototype level as well, for example,  this allows the systematic alteration of  the appearance of all arrows, or changing the font of all arrow captions.</p>';
  
  item.diagramDiameter = 300;
  item.arrowCaptionAlong = 30;
  item.arrowWidthFactor = 0.05;
  item.arrowMinWidth = 1;
  item.magnitudeFactor = 0.8;
  item.set("arrowTemplate",chart.Arrow.instantiate()).hide();
  item.arrowTemplate.headOuterFactor =2;
  item.arrowTemplate.headLengthFactorByLength = 0.3;
  item.arrowTemplate.headLengthFactorByWidth = 2;
  item.arrowTemplate.lengthFactor = 1.1;
  
  item.set("magnitudeCaptionOffset",geom.Point.mk(0,15));
  
  item.set("mainCaptionTemplate", geom.Text.mk({style:{hidden:1,fillStyle:"black",align:"left",font:"arial",height:12}}));

  item.set("circleWithCaptionsTemplate",geom.Shape.mk()).namedType();
  item.circleWithCaptionsTemplate.set("circle",geom.Circle.mk({style:{hidden:1,strokeStyle:null,"fillStyle":"green",lineWidth:2}}));
  item.circleWithCaptionsTemplate.set("nameCaption",geom.Text.mk({style:{hidden:1,fillStyle:"black",align:"center",font:"arial bold",height:12}}));
  item.circleWithCaptionsTemplate.set("magnitudeCaption",geom.Text.mk({style:{hidden:1,fillStyle:"black",align:"center",font:"arial bold",height:8}}));

  
  item.circleWithCaptionsTemplate.init = function () {
    this.circle.show();
    this.draggable = 1;
    this.nameCaption.show();
    this.nameCaption.draggable = 1;
    this.magnitudeCaption.show();
    this.magnitudeCaption.draggable = 1;
    return this;
  }
  

  item.set("circles",geom.Shape.mk());
  item.set("arrows",geom.Shape.mk());
  
  
  item.set("arrowWithCaptionTemplate",geom.Shape.mk()).namedType();
  item.arrowWithCaptionTemplate.set("arrow",item.arrowTemplate.instantiate());
  // a container is needed for the caption, so that its position can be set algoritmically, and the user can add an adjustment by dragging the caption itself
  item.arrowWithCaptionTemplate.set("captionContainer",geom.Shape.mk());
  item.arrowWithCaptionTemplate.captionContainer.set("caption",geom.Text.mk({style:{hidden:1,fillStyle:"black",align:"left",font:"arial",height:9}}));

  item.arrowWithCaptionTemplate.init = function () {
    this.draggable = 1;
    this.captionContainer.caption.show();
    this.arrow.show();
    this.captionContainer.caption.draggable = 1;
    return this;
  }
  
  item.arrowWithCaptionTemplate.mk = function () {
    var rs = this.instantiate();
    rs.init();
    return this;
  }
  
  item.update = function () {
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
  
    var sep = 100; // to initialize positions; dragging by user expected!
    var cnt = order.length;
    var initialCenter = geom.Point.mk(500,500);
    var dCenter = geom.Point.mk(0,0);//computed center of the diagram
    var n = 0;
    // allocate the circles.
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
        crcP = thisHere.circleWithCaptionsTemplate.instantiate().init();
        circles.set(id,crcP);
        // initial circle and caption positions are set here, but the circles are draggable thereafter
         crcP.translate(cCenter);
         crcP.magnitudeCaption.translate(thisHere.magnitudeCaptionOffset);

      }
      var crc = crcP.circle;
      var area = thisHere.magnitudeFactor * cd.magnitude;
      crc.radius = Math.sqrt(area/Math.PI);
      crc.style.fillStyle=cd.color;
      crcP.nameCaption.set("text",id);
      crcP.magnitudeCaption.set("text","$"+Math.floor(mag/1000)+" TRILLION");
      // a step in finding the diagram center
      var ccenter  =  crc.center.toGlobalCoords(crc.center,draw.wsRoot);
      dCenter = dCenter.plus(ccenter);

    };
    dCenter = dCenter.times(1/cnt);
    if (newMainCaption) {
      this.mainCaption.translate(dCenter);
    }
    //  allocate and set up the  arrows
    fdt.iterTreeItems(function (cd) {
      var srcName = cd.__name__;
      srcCirc = circles[srcName].circle;
      var srcColor = cd.color;
      var flows=cd.flows;
      var destNames = flows.properties();
      destNames.forEach(function (destName) {
        var destCircP = circles[destName];
        if (!destCircP) return;
        var destCirc = destCircP.circle;
        var fl = flows[destName];
        var aname = srcName+"_"+destName;
        var awc = arrows[aname];
        if (!awc) {
          // allocate and initialize the arrow
          awc = thisHere.arrowWithCaptionTemplate.instantiate().init();
          arrows.set(aname,awc);
        }
        awc.arrow.style.fillStyle = srcColor;
        awc.captionContainer.caption.set("text","$"+Math.floor(fl));
        // set the width from the flow
        var wd = Math.max(thisHere.arrowWidthFactor * fl,thisHere.arrowMinWidth);
        awc.arrow.baseWidth = awc.arrow.headInnerWidth = wd;
        // now compute the start and end points of the arrow
        var scenter  =  srcCirc.toGlobalCoords(srcCirc.center,draw.wsRoot);
        var dcenter  = destCirc.toGlobalCoords(destCirc.center,draw.wsRoot);
        var dir = dcenter.difference(scenter).normalize();
        var asp = scenter.plus(dir.times(srcCirc.radius));
        var aep =  dcenter.difference(dir.times(destCirc.radius));
        awc.arrow.startPoint.setTo(asp);
        awc.arrow.endPoint.setTo(aep);
        // and the position of the caption
        var capPos = aep.difference(dir.times(thisHere.arrowCaptionAlong));
        awc.captionContainer.translate(capPos);
        var dird = dir.direction();
        if ((Math.PI/2  < dird) && (dird < 1.5 * Math.PI)) {
          dird = dird-Math.PI; // no upside down labels
        }
      });

  
    });
  }
  
  om.save(item);
  
})
})();

    
