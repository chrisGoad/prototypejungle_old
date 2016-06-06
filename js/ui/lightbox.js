


(function (pj) { 
  
var html = pj.html;
 
 
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract

var lightbox = pj.Object.mk();
pj.lightbox = lightbox;

var Lightbox = lightbox.set("Lightbox",pj.Object.mk()).__namedType();
var box  = Lightbox.set("box",html.Element.mk('<div style="border:white black;position:absolute;z-index:5000;background-color:white;color:black"/>'));
        
var topLine = box.set("topLine",
  html.Element.mk('<div style="position:relative;width:100%;background-color:white;color:black;height:30px"></div>'));
              
topLine.set("closeX",
  html.Element.mk('<div style="position:absolute;right:0px;padding:3px;cursor:pointer;background-color:red;font-weight:bold;'+
                  'border:thin solid black;font-size:12pt;color:black">X</div>'));
topLine.set("content",html.Element.mk('<div/>'));
box.set("content",html.Element.mk('<div style="bbackground-color:red;z-index:1000"> This  should be replaced using setContent</div>'));

 
// replaced when popped
lightbox.shade =
  html.Element.mk('<div style="position:absolute;top:0px;left:0px;width:600px; height:100px;z-index:500;\
        opacity:0.8;background-color:rgba(0,0,0,0.5);color:white"/>');



lightbox.Lightbox.setTopline = function (ht) {
    this.topLine.html(ht);
}

lightbox.Lightbox.setContent = function (cn) {
  this.box.content.$empty();
  this.box.content.set("content",cn);
}


lightbox.Lightbox.setHtml = function (ht) {
  this.box.content.$css({"padding":"20px"});
  this.box.content.$html(ht);
}

lightbox.Lightbox.dismiss = function () {
  this.box.$hide();
  lightbox.shade.$hide();
}
  
lightbox.Lightbox.pop = function (dontShow,iht,withoutTopline) {
  debugger;
  this.render();
  var wd = $(document).width();
  var ht = $(document).height();
  var w = $(window);
  var stop = w.scrollTop();
  var bht = w.height();
  var bwd = w.width();
  var r = this.rect;
  var lwd = r.extent.x;
  var eht,cn,dims;
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
  this.box.$show();
  this.box.$css({'background-color':'white'});
  var cn = this.box.content;
  cn.$css({height:eht+"px"});
  var dims = {position:"absolute",width:lwd+"px",height:(eht+"px"),top:(stop+35)+"px",left:(lft+"px"),"z-index":3}
  this.box.$css(dims);
  lightbox.shade.$css({width:(wd+"px"),height:(ht+"px"),top:"0px",left:"0px","z-index":2});
  if (this.iframe) {
    this.iframe.attr("width",this.width-25);
  }
  if (!dontShow) {
    lightbox.shade.$show(); 
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
  var thisHere,wd,shade,b;
  if (bx.__element) {
    return; // already rendered 
  }
  var thisHere = this;
  var wd =this.container.offsetWidth;    
  var shade = lightbox.shade;
  if (pj.mainPage) {
    var b = pj.mainPage.__element;
  } else { 
    b = document.body;
  }
  if (!shade.__element) {
    shade.__addToDom(b);
  }
  bx.__addToDom(b);
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
  rs.set("rect",rect.instantiate());
  if (content) {
    rs.setContent(content);
  }
  rs.container = document.body;
  rs.activateClose();
  return rs;
}
  
//end extract

})(prototypeJungle);

