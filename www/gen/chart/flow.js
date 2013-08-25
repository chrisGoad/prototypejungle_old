
(function () {
  var chart = __pj__.setIfMissing("chart");
  var om = __pj__.om;
  var geom = __pj__.geom;
  
   
om.install(["http://s3.prototypejungle.org/pj/repo0/chart/Arrow"],function () {


  var flow = chart.set("Flow",om.DNode.mk()).namedType();
  flow.arrowCaptionAlong = 10;
  flow.arrowCaptionAlong0 = 15;
  flow.arrowCaptionAlong1 = 5;
  flow.arrowCaptionLineHeight = 10;
  flow.arrowWidthFactor = 0.1;
  flow.magnitudeFactor = 4;
  flow.externalArrowLength = 100;
  flow.set("arrowTemplate",chart.Arrow.instantiate()).hide();
  flow.arrowTemplate.headOuterFactor =2;
  flow.arrowTemplate.headLengthFactorByLength = 0.3;
  flow.arrowTemplate.headLengthFactorByWidth = 2;
  flow.set("circleTemplate",geom.Circle.mk({style:{strokeStyle:null,"fillStyle":"green",lineWidth:2}})).hide();
  flow.set("circleCaptionTemplate", geom.Text.mk({style:{hidden:1,fillStyle:"black",align:"center",font:"arial",height:10}}));
  flow.set("arrowCaptionTemplate", geom.Text.mk({style:{hidden:1,"background-color":"grey",fillStyle:"black",align:"center",font:"arial",height:10}}));

  
 flow.set("data",om.lift(
           {"Spain":{magnitude:1100,color:"rgba(200,0,0,0.5)",flows:{"Germany":238,Britain:114,France:220}},
            "Italy":{magnitude:1400,color:"green",flows:{"Germany":190,Britain:77,France:511}},
            "Ireland":{magnitude:867,color:"orange",flows:{Germany:184,Britain:188,France:60}},
            "Portugal":{magnitude:286,color:"red",flows:{Spain:286,Germany:47,Britain:24,France:45}},
            "Greece":{magnitude:236,color:"red",flows:{Germany:45,Britain:15,France:75}},
           "Germany":{magnitude:2000,color:"grey",flows:{}},
            "Britain":{magnitude:2000,color:"grey",flows:{}},
            "France":{magnitude:2000,color:"grey",flows:{}}}));
  
  
 flow.set("data",om.lift(
           {"Spain":{magnitude:1100,color:"brown",flows:{"Italy":31,"Ireland":30,"Portugal":28,"Greece":0.4},
                    externalFlows:{"Germany":238,Britain:114,France:220}},
            "Italy":{magnitude:1400,color:"green",flows:{"Portugal":5.2,"Spain":47,"Ireland":46,"Greece":0.7},
                     externalFlows:{"Germany":190,Britain:77,France:511}},
            "Ireland":{magnitude:867,color:"orange",flows:{"Portugal":22,"Spain":16,"Italy":18,"Greece":0.8},
                      externalFlows:{Germany:184,Britain:188}},
            "Portugal":{magnitude:286,color:"red",flows:{Spain:286,Italy:6.7,Greece:0.1,Ireland:5.4},
                       externalFlows:{Germany:47,Britain:24,France:45}},
            "Greece":{magnitude:236,color:"steelblue",flows:{"Portugal":9.7,"Spain":1.3,"Italy":6.9,Ireland:8.5},
                      externalFlows:{Germany:45,Britain:15,France:75}},
             }));
  

  flow.set("circles",om.DNode.mk());
  flow.set("arrows",om.DNode.mk());
  flow.update = function () {
    var geom = __pj__.geom;
    var draw = __pj__.draw;
    var om = __pj__.om;
    var dt = this.data;
    var circles = this.circles;
    var arrows = this.arrows;
    var thisHere = this;
    var circleTemplate = this.circleTemplate;
    var arrowTemplate = this.arrowTemplate;
  
    // allocate the circles
    var sep = 100; // to initialize positions; dragging by user expected!
    var cnt = 0;
    var dcenter = geom.Point.mk(0,0);
    dt.iterTreeItems(function (cd) {
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
        console.log("sep",sep*cnt);
        crcP.translate(geom.Point.mk(sep*cnt,0));
      }
      var area = thisHere.magnitudeFactor * cd.magnitude;
      crc = crcP.circle;
      crc.radius = Math.sqrt(area/Math.PI);
      var ccenter  =  crc.center.toGlobalCoords(crc.center,draw.wsRoot);
      dcenter = dcenter.plus(ccenter);
      cnt++;

    },true);
    dcenter = dcenter.times(1/cnt);
    //  allocate and set up the arrows
    dt.iterTreeItems(function (cd) {
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
          // wrap the caption in a dnode, so the user can adjust its postion
          var cC = om.DNode.mk();
          cC.draggable  = 1;
          aCaption.set("text",fl);
          a.set("captionContainer",cC);
          cC.set("caption",aCaption);
        }
        var wd = thisHere.arrowWidthFactor * fl;
        a.arrow.baseWidth = a.arrow.headInnerWidth = wd;

        var scenter  =  srcCirc.toGlobalCoords(srcCirc.center,draw.wsRoot);
        var dcenter  = destCirc.toGlobalCoords(destCirc.center,draw.wsRoot);
        var dir = dcenter.difference(scenter).normalize();
        var asp = scenter.plus(dir.times(srcCirc.radius));
        var aep =  dcenter.difference(dir.times(destCirc.radius));
        a.arrow.startPoint = asp;
        a.arrow.endPoint =aep;
        var dir1 = dir.normalize();
        a.captionContainer.caption.set("pos",asp.plus(dir1.times(thisHere.arrowCaptionAlong)));
      });
  
      destNames = externalFlows.properties();
      destNames.forEach(function (destName) {
        var fl = externalFlows[destName];
        var aname = srcName+"_"+destName;
        var a = arrows[aname];
        if (!a) {
          a = om.DNode.mk();
          arrows.set(aname,a);
          a.draggable = 1;
          var aa = arrowTemplate.instantiate().show();
          aa.style.fillStyle = srcColor;
          a.set('arrow',aa);
          var cC = om.DNode.mk();
          cC.draggable  = 1;
          a.set("captionContainer",cC);
          var aCaption0 = thisHere.arrowCaptionTemplate.instantiate().show();
          aCaption0.set("text",destName);
          aCaption0.draggable = 1;
          cC.set("caption0",aCaption0);
          var aCaption1 = thisHere.arrowCaptionTemplate.instantiate().show();
          aCaption1.set("text",fl);
          aCaption1.draggable = 1;
          cC.set("caption1",aCaption1);
        }
        var wd = thisHere.arrowWidthFactor * fl;
        a.arrow.baseWidth = a.arrow.headInnerWidth = wd;
        var scenter  =  srcCirc.toGlobalCoords(srcCirc.center,draw.wsRoot);
        var dir = scenter.difference(dcenter).normalize();
        var asp = scenter.plus(dir.times(srcCirc.radius));
        var aep =  scenter.plus(dir.times(srcCirc.radius+thisHere.externalArrowLength));
        a.arrow.startPoint = asp;
        a.arrow.endPoint =aep;
        a.arrow.lengthFactor = 1;
        var capPos = aep.plus(dir.times(thisHere.arrowCaptionAlong0));
                              
        a.captionContainer.caption0.set("pos",capPos);
         a.captionContainer.caption1.set("pos",capPos.plus(geom.Point.mk(0,thisHere.arrowCaptionLineHeight)));
     });
    });
  }
  
  
  
  om.save(flow);
    

})
})();

  
  
  

  

    
    
    
