(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  var jqp = __pj__.jqPrototypes;

  // support for setting up the canvas and its zoom buttons. Used in inspect,edit and view
   
   
      // when inspecting dom, the canvas is a div, not really a canvas
  dom.addCanvas = function (canvasDiv) {
    var theCanvas,plusbut,minusbut,navbut;
    var draw = prototypeJungle.draw;
    var inspectDom = false;
    if (inspectDom) { // this code is not in use, but may come back
      var cnv = dom.El({tag:"div",attributes:{border:"solid thin green",width:"200",height:"220"}});  //TAKEOUT replace by above line
      canvasDiv.addChild("canvas", cnv);
      draw.enabled = false;
    } else {
      var cnv = dom.El({tag:"canvas",attributes:{border:"solid thin green",width:"200",height:"220"}});  //TAKEOUT replace by above line
      canvasDiv.addChild("canvas", cnv);
      var hitcnv = dom.El({tag:"canvas",attributes:{border:"solid thin blue",width:200,height:200}});
      //mpg.addChild("hitcanvas", hitcnv);
      canvasDiv.addChild("hitcanvas", hitcnv);
      //var htmlDiv = canvasDiv; //dom.El({tag:"div",style:{position:"absolute",border:"solid red",width:"10px",height:"10px",top:"0px",left:"0px"}});
      //canvasDiv.addChild("html",htmlDiv);
      theCanvas = draw.Canvas.mk(cnv,hitcnv,canvasDiv);
      // container for things in the dom
      var domCon = dom.El({tag:"div",id:"domCon"});
      canvasDiv.addChild(domCon);
      theCanvas.domContainer = domCon;
      theCanvas.isMain = 1;
      theCanvas.dragEnabled = 1;
      theCanvas.panEnabled = 1;
      //theCanvas.contents = contents;
      prototypeJungle.draw.addCanvas(theCanvas);
      
      theCanvas.plusbut = plusbut = jqp.button.instantiate().set({html:"+",style:{position:"absolute",top:"0px"}}),
      theCanvas.minusbut = minusbut = jqp.button.instantiate().set({html:"&#8722;",style:{position:"absolute",top:"0px"}})
      theCanvas.navbut = navbut = jqp.button.instantiate().set({html:"Inspect",style:{position:"absolute",top:"0px"}})
      canvasDiv.addChild(plusbut);
      canvasDiv.addChild(minusbut);
      canvasDiv.addChild(navbut);
      theCanvas.positionButtons = function (wd) {
         this.plusbut.css({"left":(wd - 50)+"px"});
         this.minusbut.css({"left":(wd - 30)+"px"});
         this.navbut.css({"left":"0px"});
      };
      theCanvas.initButtons = function (navTo) {
        this.plusbut.__element__.mousedown(function () {
          draw.startZooming();
          });
        //plusbut.__element__.mousedown(draw.startZooming);
        this.plusbut.__element__.mouseup(draw.stopZooming);
        this.plusbut.__element__.mouseleave(draw.stopZooming);
        this.minusbut.__element__.mousedown(draw.startUnZooming);
        this.minusbut.__element__.mouseup(draw.stopZooming);
        this.minusbut.__element__.mouseleave(draw.stopZooming);
        this.navbut.__element__.html(navTo);
      }
 
      //draw.addCanvas(theCanvas);
      return theCanvas;
    }
    
  }
  /*
  
  plusbut.__element__.mousedown(draw.startZooming);
    plusbut.__element__.mouseup(draw.stopZooming);
    plusbut.__element__.mouseleave(draw.stopZooming);
    minusbut.__element__.mousedown(draw.startUnZooming);
    minusbut.__element__.mouseup(draw.stopZooming);
    minusbut.__element__.mouseleave(draw.stopZooming);
    */
})(prototypeJungle);