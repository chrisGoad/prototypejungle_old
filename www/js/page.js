/* generates common elements of the html pages */
if (typeof __pj__ == "undefined") {
  var __pj__ = {};
}
(function (__pj__) {
   var om = __pj__.om;
   var page = __pj__.page;
   
   // lightboxes without dependencies
  var lightBoxWidth = 500;
  var lightBoxHeight = 400;
  
  var lightbox = $('<div class="lightbox"/>');
  lightbox.css({
      border:"white black",
      position:"absolute",
      "z-index":5000,
      "background-color":"white",
      "color":"black",
      overflow:"none"
    });

 
  
  var content  = $('<div/>');
  //content.css({width:'90%'});
 
  lightbox.append(content);
 // topline.append(content);

  

    
  var shade = $('<div/>');
  shade.css({
      position:"absolute",
      top:"0px",
      left:"0px",
      width:"600px", // replaced when popped
      height:"100px",
      "z-index":500,
      opacity:0.8,
      "background-color":"black",
      "color":"white"
    });
 

 
  page.dismissLightbox = function () {
    // the lightbox from __pj__.dom
    if (__pj__.mainPage && __pj__.mainPage.lightbox) {
      __pj__.mainPage.lightbox.dismiss();
    }
    lightbox.hide();
    shade.hide();
  }
  
  var lightboxAdded = false;
  
  page.popLightbox = function () {
    if (!lightboxAdded) {
      $('body').append(lightbox);
      $('body').append(shade);
      lightboxAdded = true;
    }
    page.theLightbox = lightbox;
    var wd = $(document).width();
    var ht = $(document).height();
    var w = $(window);
    var stop = w.scrollTop();
    var bht = w.height();
    var bwd = w.width();
    var lwd = lightBoxWidth;
    var lht = lightBoxHeight;
    /* center the fellow */
    var lft = Math.max((bwd - lwd)/2,50);
    eht = Math.min(bht -  100,lht);
    content.css({height:eht+"px"});
    var dims = {width:lwd+"px",top:(stop+35)+"px",left:(lft+"px")};
    lightbox.css(dims);
    shade.css({width:(wd+"px"),height:(ht+"px"),top:"0px",left:"0px"});
    shade.show();
    lightbox.show();
  }
  
  page.setLighboxHtml = function (ht) {
    content.html(ht);
  }
  
  page.popChooser = function (mode) {
    page.popLightbox();
    content.html('<iframe id="lightbox" width="100%" height="100%" scrolling="no" id="chooser" src="/chooser2d.html?mode='+mode+'"/>');
  }
   
   var fileBut;
    page.genButtons = function (container,options) {
      var toExclude = options.toExclude;
      var down = options.down;
      function addButton(id,text,url) {
        if (down && (id=="file" || id=="sign_in")) return;
       
        if (toExclude && toExclude[id]) return;
        var rs = $('<div class="button">'+text+'</div>');
        container.append(rs);
        if (url) {
          rs.click(function () {location.href = url+(down?"?down=1":"")});
        }
        return rs;
      }
     
      fileBut = addButton('file',"File");
      addButton('github','GitHub','https://github.com/chrisGoad/prototypejungle');
      addButton('tech','Tech Docs','/tech');
      addButton('about','About','/about');
      if (!down && (!toExclude || !toExclude['sign_in'])) {
        page.logoutButton = addButton('logout','logout',"/logout");
        page.signInButton = addButton('sign_in',"Sign in","/sign_in");
        var sid = om.storage?om.storage.sessionId:null;
        if (sid) {
          page.signInButton.hide();
          //addButton("logout","/logout");
        } else {
          page.logoutButton.hide();
          //addButton("Sign in","/sign_in");
        }
      }
  }
  
  /* pulldown selection */
  
  var PDSel = {};

  PDSel.addLine = function (optionId,option,disabled) {
    var rs = $('<div class="pulldownEntry"></div>');
    var selector = this.selector;
    rs.html(option);
    if (disabled) {
      rs.css({'color':'grey'});
    } else {
      rs.click(function () {
        selector(optionId);
      });
    }
    this.container.append(rs);
  }
  
  
  
  PDSel.addLines = function () {
    var c = this.container;
    var options = this.options;
    var optionIds = this.optionIds;
    var disabled = this.disabled;
    var ln = options.length;
    
    for (var i=0;i<ln;i++) {
      this.addLine(optionIds[i],options[i],disabled?disabled[i]:0);
    }
  }
  
  
  PDSel.render = function (pr) {
    var cn = $('<div class="pulldownBox"></div>');
    this.container = cn;
    cn.mouseleave(function () {cn.hide();});
    this.parent  = pr;
    pr.append(cn);
    this.addLines();
    cn.hide();
  }
  
   PDSel.popFromButton = function (button) {
    var pr = this.parent;
    var pof = pr.offset();
    var ht = button.height();
    var ofs = button.offset();
    var rofL = ofs.left-pof.left;
    var rofT = ofs.top-pof.top;
    this.container.css({"display":"block","left":rofL+"px","top":(rofT+ht)+"px",
                       "padding-left":"5px","padding-right":"5px","padding-bottom":"15px"});
  }
  

  
  var filePD = Object.create(PDSel);
  filePD.options = ["New","Rebuild","Open"];
  filePD.optionIds = ["new","rebuild","open"];
  if (!localStorage.sessionId) {
    filePD.disabled = [1,1,0];
  }
  filePD.selector = function (opt) {filePD.container.hide();page.popChooser(opt);};
  
  
  
  
  page.genTopbar  = function (container,options) {
    $('.mainTitle').click(function () {location.href = "/"})
    var lc = location.href;
    if (lc.indexOf('down=1')>0) {
      options.down = 1;
    }
   
    var inr = $('#topbarInner');
    //if (options.includeTitle) page.genMainTitle($('#topbarOuter'),'Prototype Jungle');
    page.genButtons(inr,options);
    if (fileBut) {
      filePD.render($('#outerContainer'));
      fileBut.click(function () {filePD.popFromButton(fileBut)});
    }
  }
  page.genMainTitle = function (container,text) {
    var rs = $('<span class="mainTitle">'+text+'</span>');
    rs.css({'cursor':'pointer'});
    container.append(rs);
    rs.click(function () {location.href = "/"})
  }
  
  page.logout = function () {
    om.log("util","page.logout");
    page.logoutButton.hide();
    page.signInButton.show();
    om.clearStorageOnLogout();
  }
  
})(__pj__);


