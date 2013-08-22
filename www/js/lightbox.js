

// common elements for neo pages



(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  
  var jqp = __pj__.jqPrototypes;
  var lightbox = __pj__.set("lightbox",om.DNode.mk());

  lightbox.set("template",dom.newJQ({
    tag:"div",
    style:{
      border:"white black",
      position:"absolute",
      "z-index":5000,
      "background-color":"white",
      "color":"black",

    }
  }));
  
  
    var topLine = lightbox.template.addChild("topLine",dom.newJQ({"tag":"div",html:"&nbsp;",
      style:{
      width:"100%",
      "z-indexx":2000,
      "background-color":"white",
      "color":"black",
      height:"30px"

    }}));
                               
    topLine.addChild("content",dom.newJQ({tag:"span"}));
    
    topLine.addChild("closeX",dom.newJQ({
      tag:"div",
      html:"X",
      style:{
        padding:"3px",
        cursor:"pointer",
        "background-color":"red",
        "font-weight":"bold",
        border:"thin solid black",
        "font-size":"12pt",
        color:"black",
        "float":"right"
      }
      }));
    
    
    
    lightbox.template.addChild("content",dom.newJQ({
      tag:"div",
      style:{
        "padding-left":"30px",
        "padding-right":"30px",
        overflow:"auto"

      }
      }));
    
  // file explorer
  
    
   lightbox.set("dialog",lightbox.template.instantiate());
  
  
   var inf  =  jqp.textInput.instantiate();
   var dcn = lightbox.dialog.selectChild("content");
   dcn.addChild("inputField",inf);
   
   var okbut = jqp.button.instantiate();
   okbut.html = "OK";
   dcn.addChild("ok",okbut);
   lightbox.dialog.setOkClick = function (c) {this.cssSelect("#content>#ok").click = c;};
   lightbox.dialog.inputValue = function () {
     var iel = this.cssSelect("#content>#inputField");
     var jel = iel.__element__;
     return jel.prop("value");
   }
   okbut.click = lightbox.dialog.okClick;
 
   var cancelbut = jqp.button.instantiate();
   cancelbut.html = "Cancel";
   dcn.addChild("Cancel",cancelbut);
  
  lightbox.shade =  dom.newJQ({
    tag:"div",
    style:{
      position:"absolute",
      top:"0px",
      left:"0px",
      width:"600px", // replaced when popped
      height:"100px",
      "z-index":500,
      opacity:0.8,
      "background-color":"black",
      "color":"white"
    }
  });


  lightbox.installType("Lightbox");

  
  lightbox.newLightbox =  function (container,rect,el) {
    var rs = Object.create(lightbox.Lightbox);
    rs.set("shade",lightbox.shade.instantiate());
    rs.set("element",el);
    rs.set("box",rect);
    
    rs.closeX = el.cssSelect("#topLine>#closeX");
    rs.topLine = el.cssSelect("#topLine>#content");
    rs.content = el.selectChild("content");
    rs.container = container;
    return rs;
  }
  
  
  lightbox.Lightbox.setTopline = function (ht) {
      this.topLine.html(ht);
  }
  
  lightbox.Lightbox.dismiss = function () {
    var el = this.element;
    el.hide();
    this.shade.hide();
    if (navigator.userAgent.match('Firefox'))  __pj__.mainPage.show();
    $('body').css('background-color','rgb(238,238,238)');

  }
  
  lightbox.Lightbox.pop = function (dontShow,iht) {
    this.render();
    var wd = $(document).width();
    var ht = $(document).height();
    var w = $(window);
    var stop = w.scrollTop();
    var bht = w.height();
    var bwd = w.width();
    var box = this.box;
      var lwd = box.extent.x;
    /* center the fellow */
    var lft = Math.max((bwd - lwd)/2,50);
    if (iht) {
      var eht = iht;
    } else {
      eht = Math.max(bht - (box.extent.y) - 50,50);
    }
    var cn = this.content;
    cn.__element__.css({height:eht+"px"});
    var dims = {width:lwd+"px",height:(eht+"px"),top:(stop+35)+"px",left:(lft+"px")}
      var dims = {width:lwd+"px",top:(stop+35)+"px",left:(lft+"px")}
  this.element.__element__.css(dims);
    this.shade.__element__.css({width:(wd+"px"),height:(ht+"px"),top:"0px",left:"0px"});
    if (this.iframe) {
      this.iframe.attr("width",this.width-25);
    }
    if (!dontShow) {
      if (navigator.userAgent.match('Firefox')) {
        __pj__.mainPage.hide(); // the z-index fails on firefox; I have no idea why
        $('body').css('background-color','#444444');
      } else {
        this.shade.show();
    }
      this.element.show();

    } else {
      this.dismiss();
    }
  }
  
  
  
  lightbox.Lightbox.empty  = function () {
      this.content.empty();
      this.topLine.empty();
  }
  
  // clears out the topLine
  lightbox.Lightbox.setHtml  = function (html) {
      var e = this.content.__element__;
      this.empty();
      e.html(html);
  }
  
  // does not clear out the topLine
  lightbox.Lightbox.setContent  = function (html) {
      var e = this.content.__element__;
      e.empty();
      e.html(html);
  }
  
  lightbox.Lightbox.installContent  = function (jq) {
    var e = this.content.__element__;
    jq.install(e);
  }
  
  
  lightbox.Lightbox.setTextArea  = function (txt) {
      var e = this.content.__element__;
      e.empty();
      var ta = $('<textarea disabled="1" cols="100" rows="100"/>');
      ta.prop('value',txt);
      e.append(ta);
      ta.click(function () {ta.select();});
  }
 

  lightbox.Lightbox.afterClose = function () {
    if (this.afterCloseCallback) {
      this.afterCloseCallback();
    }
  }
  
  
  lightbox.Lightbox.addClose = function (whenClosed) {
    var thisHere = this;
    this.close = $(lightbox.closeX);
    this.close.click(function () {
      thisHere.dismiss();thisHere.afterClose();if (whenClosed) whenClosed();});
    this.__element__.append(this.close);
  }

  lightbox.Lightbox.render = function (dontDismiss) {
    if (this.element.__element) {
      return; // already rendered
    }
    var thisHere = this;
     var element = this.element;
     var wd =this.container.width();
    if (this.window) {
      var ht = this.window.height();
    } else {
      var ht = $('window').height();
    }
       
    var shade = this.shade;
    //shade.install(this.container);
    shade.install($('body'));
    element.install($('body'));
    var thisHere = this;
    this.closeX.__element__.click(function () {thisHere.dismiss();});
    element.hide();
    this.shade.hide();
    
  }
  
  
  
  // msg might be a string or an element
  
  lightbox.Lightbox.popMessage = function (msg,centerIt) {
    this.pop();
    this.element.empty();
    this.addClose();
    if (typeof(msg) == 'string') {
      var msgdiv = $('<div/>');
      msgdiv.css({"margin":"20px"});
      if (centerIt)  msgdiv.css({'text-align':'center'});
      msgdiv.html(msg);
    } else {
      msgdiv = msg;
    }
    this.element.append(msgdiv);
   
  }
  
 
 
  lightbox.setRect = function (el,rect,canvas,ocanvas,noHeight) {
    var c = rect.corner;
    var ex = rect.extent;
    var css = {left:(c.x)+"px",top:(c.y)+"px",width:(ex.x)+"px"};
    if (!noHeight) css.height = (ex.y)+"px";
    el.css(css);
    if (canvas) {
      canvas.attr("width",rect.extent.x);
      canvas.attr("height",rect.extent.y);
    }
    if (ocanvas) {
      ocanvas.attr("width",rect.extent.x);
      ocanvas.attr("height",rect.extent.y);
    }
  }
  


})(__pj__);

