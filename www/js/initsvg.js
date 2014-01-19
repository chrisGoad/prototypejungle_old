(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  var jqp = __pj__.jqPrototypes;
  var svg = __pj__.svg;
  // support for setting up the canvas and its zoom buttons. Used in inspect,edit and view
   
   
      // when inspecting dom, the canvas is a div, not really a canvas
  svg.Root.addButtons = function () {
    var plusbut,minusbut,navbut;
    var div = $(this.container);
    this.plusbut = plusbut = jqp.button.instantiate().set({html:"+",style:{position:"absolute",top:"0px"}});
    this.minusbut = minusbut = jqp.button.instantiate().set({html:"&#8722;",style:{position:"absolute",top:"0px"}});
    this.navbut = navbut = jqp.button.instantiate().set({html:"Inspect",style:{position:"absolute",top:"0px"}});
    plusbut.install(div);
    minusbut.install(div);
    navbut.install(div);
    //this.positionButtons();
    this.initButtons();
}

svg.Root.positionButtons = function (wd) {
    this.plusbut.css({"left":(wd - 50)+"px"});
    this.minusbut.css({"left":(wd - 30)+"px"});
    this.navbut.css({"left":"0px"});
}
  
  svg.Root.initButtons = function (navTo) {
    this.plusbut.__element__.mousedown(svg.startZooming);;
  
    //plusbut.__element__.mousedown(draw.startZooming);
    this.plusbut.__element__.mouseup(svg.stopZooming);
    this.plusbut.__element__.mouseleave(svg.stopZooming);
    this.minusbut.__element__.mousedown(svg.startUnZooming);
    this.minusbut.__element__.mouseup(svg.stopZooming);
    this.minusbut.__element__.mouseleave(svg.stopZooming);
    this.navbut.__element__.html(navTo);
  }
 
      //draw.addCanvas(theCanvas);
  
})(prototypeJungle);