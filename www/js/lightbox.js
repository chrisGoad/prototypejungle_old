


(function (pj) {
  var om = pj.om;
 // var dom = pj.dom;
  var html = pj.html;
 // var jqp = pj.jqPrototypes;
 
 
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract

  var lightbox = pj.set("lightbox",om.DNode.mk());

  var Lightbox = lightbox.set("Lightbox",om.DNode.mk()).namedType();
  var box  = Lightbox.set("box",html.Element.mk('<div style="border:white black;position:absolute;z-index:5000;background-color:white;color:black"/>'));
          
    var topLine = box.set("topLine",
      html.Element.mk('<div style="width:100%;background-color:white;color:black;height:30px"></div>'));
                  
    topLine.set("content",html.Element.mk('<div/>'));
    topLine.set("closeX",
      html.Element.mk('<div style="padding:3px;cursor:pointer;background-color:red;font-weight:bold;\
                     border:thin solid black;font-size:12pt;color:black;float:right">X</div>'));
      box.set("content",html.Element.mk('<div> This should be replaced using setContent</div>'));
 
    /*topLine.closeX.$click(function () {
      this.dismiss();
    });
    */
  //  box.addChild("content",html.Element.mk('<div/>'));
  
  /*
   var dialog = lightbox.set("dialog",Lightbox.instantiate());
  
  
   var inf  =  html.Element.mk('<input class="tInput"/>');
   var dcn = lightbox.dialog.box.content;
   dcn.addChild("inputField",inf);
   
   var okbut =   html.Element.mk('<div class="button">OK</div>');

   dialog.box.content.addChild("ok",okbut);
   dialog.setOkClick = function (c) {this.cssSelect("#content>#ok").click = c;};
   dialog.inputValue = function () {
     var iel = this.cssSelect("#content>#inputField");
     var jel = iel.__element;
     return jel.prop("value");
   }
   okbut.click = dialog.okClick;
 
   var cancelbut = html.Element.mk('<div class="button">Cancel</div>');
   dialog.box.content.addChild("Cancel",cancelbut);
  */
  // replaced when popped
  lightbox.shade =
    html.Element.mk('<div style="position:absolute;top:0px;left:0px;width:600px; height:100px;z-index:500;\
          opacity:0.8;background-color:black;color:white"/>');
  

  
  lightbox.Lightbox.setTopline = function (ht) {
      this.topLine.html(ht);
  }
  
  lightbox.Lightbox.setContent = function (cn) {
    this.box.content.$empty();
    this.box.content.set("content",cn);
  }
  
  
  lightbox.Lightbox.setHtml = function (ht) {
   // this.box.content.$empty();
    this.box.content.$css({"padding":"20px"});
    this.box.content.$html(ht);
  }
  
  lightbox.Lightbox.dismiss = function () {
    this.box.$hide();
    lightbox.shade.$hide();
    if (navigator.userAgent.match('Firefox'))  pj.mainPage.show();
    //$('body').css('background-color','rgb(238,238,238)');

  }
  
  lightbox.Lightbox.pop = function (dontShow,iht,withoutTopline) {
    this.render();
  /*  if (rct) {
      var xt = rct.extent;
      var crn = rct.corner;
      var lwd = xt.x;
      var left = crn.x;
      var 
   }
   */
    var wd = $(document).width();
    var ht = $(document).height();
    var w = $(window);
    var stop = w.scrollTop();
    var bht = w.height();
    var bwd = w.width();
    var r = this.rect;
    var lwd = r.extent.x;
    /* center the fellow */
    var lft = Math.max((bwd - lwd)/2,50);
    if (iht) {
      var eht = iht;
    } else {
      eht = Math.max(bht - (r.extent.y) - 50,50);
    }
    if (withoutTopline) {//for the chooser
      eht = Math.min(bht -  100,400);
    }
    var cn = this.box.content;
    cn.$css({height:eht+"px"});
    var dims = {width:lwd+"px",height:(eht+"px"),top:(stop+35)+"px",left:(lft+"px")}
    //  var dims = {width:lwd+"px",top:(stop+35)+"px",left:(lft+"px")}
    this.box.$css(dims);
    lightbox.shade.$css({width:(wd+"px"),height:(ht+"px"),top:"0px",left:"0px"});
    if (this.iframe) {
      this.iframe.attr("width",this.width-25);
    }
    if (!dontShow) {
      if (navigator.userAgent.match('Firefox')) {
        pj.mainPage.hide(); // the z-index fails on firefox; I have no idea why
        $('body').css('background-color','#444444');
      } else {
        lightbox.shade.$show();
    }
      this.box.$show();
      if (withoutTopline) {
        this.box.topLine.$hide();
      } else {
        this.box.topLine.$show();
      }
    } else {
      this.dismiss();
    }
  }
  
  /*
  
  lightbox.Lightbox.empty  = function () {
      this.content.empty();
      this.topLine.empty();
  }
  
  // clears out the topLine
  lightbox.Lightbox.setHtml  = function (html) {
      var e = this.content.__element;
      this.empty();
      e.html(html);
  }
  
  // does not clear out the topLine
  
   *lightbox.Lightbox.setContent  = function (el) {
      var e = this.content.__element;
      e.empty();
      if (typeof el === "string") {
        e.html(el);
      } else {
        e.append(el);
      }
  }
  
  
  lightbox.Lightbox.installContent  = function (jq,emptyFirst) {
    var e = this.content.__element;
    if (emptyFirst) e.empty();
    jq.install(e);
  }
  
  
  lightbox.Lightbox.setTextArea  = function (txt) {
      var e = this.content.__element;
      e.empty();
      var ta = $('<textarea disabled="1" cols="100" rows="100"/>');
      ta.prop('value',txt);
      e.append(ta);
      ta.click(function () {ta.__select();});
  }
 
*/
  lightbox.Lightbox.afterClose = function () {
    if (this.afterCloseCallback) {
      this.afterCloseCallback();
    }
  }
  
  
  lightbox.Lightbox.activateClose = function (whenClosed) {
    var thisHere = this;
    this.box.topLine.closeX.$click(function () {
      thisHere.dismiss();thisHere.afterClose();if (whenClosed) whenClosed();});
  }

  lightbox.Lightbox.render = function (dontDismiss) {
    var bx = this.box;
    if (bx.__element) {
      return; // already rendered
    }
    var thisHere = this;
     //var element = this.element;
     var wd =this.container.offsetWidth;
    //if (this.window) {
    // var ht = this.window.height();
    //} else {
    //  var ht = $('window').height();
   // }
       
    var shade = lightbox.shade;
    var b = document.body;
    if (!shade.__element) {
      shade.__addToDom(b);
    }
    bx.__addToDom(b);
    //this.closeX.__element.click(function () {debugger;thisHere.dismiss();}); putback
  //  element.hide();
    shade.$hide();
    
  }
  
  
  
  // msg might be a string or an element
  
  lightbox.Lightbox.popMessage = function (msg,centerIt) {
    this.pop();
    this.element.empty();
    this.addClose();
    if (typeof(msg) === 'string') {
      var msgdiv = $('<div/>');
      msgdiv.css({"margin":"20px"});
      if (centerIt)  msgdiv.css({'text-align':'center'});
      msgdiv.html(msg);
    } else {
      msgdiv = msg;
    }
    this.element.append(msgdiv);
   
  }
  
 
 
  lightbox.Lightbox.setRect = function (rect) {
    this.rect  = rect;
    var c = rect.corner;
    var ex = rect.extent;
    var css = {left:(c.x)+"px",top:(c.y)+"px",width:(ex.x)+"px",height:(ex.y)+"px"};
    this.box.css(css);
    this.box.content.css({height:(ex.y-50)+"px",width:(ex.x-20)+"px"});
  }
  
  
  
  lightbox.newLightbox =  function (rect,content) {
    var rs = lightbox.Lightbox.instantiate();
    rs.set("rect",rect);
    if (content) {
      rs.setContent(content);
    }
    //rs.box.set("content",content);
    /*
    rs.closeX = el.cssSelect("#topLine>#closeX");
    rs.topLine = el.cssSelect("#topLine>#content");
    rs.wholeTopLine = el.cssSelect("#topLine");
    rs.content = el.selectChild("content");
    */
    rs.container = document.body;
    rs.activateClose();
    return rs;
  }
  
//end extract

})(prototypeJungle);

