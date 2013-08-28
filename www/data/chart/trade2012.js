
(function () {
  var chart = __pj__.setIfMissing("chart");
  var om = __pj__.om;
  var geom = __pj__.geom;
  
   
om.install(["http://s3.prototypejungle.org/pj/repo0/chart/Arrow"],function () {

  var flow = chart.set("Flow",om.DNode.mk()).namedType();
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
  flow.arrowTemplate.lengthFactor = 1.2;
  flow.externalArrowCaptionOffset = 7.5;
  flow.set("magCaptionOffset",geom.Point.mk(0,15));
  flow.set("circleTemplate",geom.Circle.mk({style:{strokeStyle:null,"fillStyle":"green",lineWidth:2}})).hide();
  flow.set("circleCaptionTemplate", geom.Text.mk({style:{hidden:1,fillStyle:"black",align:"center",font:"arial bold",height:12}}));
   flow.set("magCaptionTemplate", geom.Text.mk({style:{hidden:1,fillStyle:"black",align:"center",font:"arial bold",height:8}}));
  flow.set("arrowCaptionTemplate", geom.Text.mk({style:{hidden:1,fillStyle:"black",align:"left",font:"arial",height:9}}));
  flow.set("externalArrowCaptionTemplate", geom.Text.mk({style:{hidden:1,fillStyle:"black",align:"left",font:"arial",height:12}}));

  
 flow.set("data",om.lift(
           {"Spain":{magnitude:1100,color:"rgb(200,0,0)",flows:{"Germany":238,Britain:114,France:220}},
            "Italy":{magnitude:1400,color:"green",flows:{"Germany":190,Britain:77,France:511}},
            "Ireland":{magnitude:867,color:"orange",flows:{Germany:184,Britain:188,France:60}},
            "Portugal":{magnitude:286,color:"red",flows:{Spain:286,Germany:47,Britain:24,France:45}},
            "Greece":{magnitude:236,color:"red",flows:{Germany:45,Britain:15,France:75}},
           "Germany":{magnitude:2000,color:"grey",flows:{}},
            "Britain":{magnitude:2000,color:"grey",flows:{}},
            "France":{magnitude:2000,color:"grey",flows:{}}}));
  
  // euro = 1/0.78 = 1.28 collars during 2012
  var euro = 1.28;
  
 flow.set("data",om.lift(
          {"order":["US","China","Europe","Japan"],
           flows:
            {"US":{magnitude:15000,color:"brown",flows:{"China":1 * 110,"Europe":1 * 265,Japan:1 * 70}},
            "China":{magnitude:7320,color:"orange",flows:{"US":1 * 426,"Europe":euro * 260,Japan:euro * 118}},
            "Europe":{magnitude:euro * 12000,color:"steelblue",flows:{"US":1 * 381,"China":euro * 165,Japan:euro * 55}},
            Japan:{magnitude:5900,color:"red",flows:{Europe:euro * 64,US:1 * 146,China:euro * 139}}
            }
          }));
  

  flow.set("circles",om.DNode.mk());
  flow.set("arrows",om.DNode.mk());
  flow.update = function () {
    debugger;
    var geom = __pj__.geom;
    var draw = __pj__.draw;
    var om = __pj__.om;
    if  (!this.dataSource){
      this.set("dataSource",om.DataSource.mk("http://prototypejungle.org/data/chart/trade2012.js"));
    }
 
    var dt = this.data;
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
        crcP = om.DNode.mk(); // contains the circle and caption
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
        //caption.translate(thisHere.circleCaptionOffset);
        console.log("sep",sep*cnt);
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
          a = om.DNode.mk();
          arrows.set(aname,a);
          a.draggable = 1;
          var aa = arrowTemplate.instantiate().show();
          aa.style.fillStyle = srcColor;
          a.set('arrow',aa);
          var aCaption = thisHere.arrowCaptionTemplate.instantiate().show();
          aCaption.draggable = 1;
          // wrap the caption in a dnode, so the user can adjust its postion
          var cC = om.DNode.mk();
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

  
  
  

  

    
    
    
