/* generates common elements of the html pages */
if (typeof prototypeJungle === "undefined") {
  var prototypeJungle = {};
}
// for all pages except inspect and view, which need lighbox management etc


(function (__pj__) {
   var om = __pj__.om;
   var page = __pj__.page;
   // lightboxes without dependencies
  var lightBoxWidth = 500;
  var lightBoxHeight = 400;
  var atMain  = location.href.indexOf("http://prototypejungle.org")===0;
  var signedIn = localStorage.signedIn==="1";
  //var usePort8000 = 1;
  var releaseMode = 1; // until release, the signin and file buttons are hidden 
  var atTest = (location.href.indexOf("http://prototype-jungle.org:8000/tindex.html")===0) ||
               (location.href.indexOf("http://prototypejungle.org/tindex.html")===0) ||
               (location.href.indexOf("http://prototypejungle.org/inspectd.html")===0);
               
  //var atInspect = location.href.indexOf("inspect")>0;
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
 
  lightbox.append(content);

  

    
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
 

 /*
  page.dismissChooser = function () {
    // the lightbox from __pj__.dom
    if (__pj__.mainPage && __pj__.mainPage.chooser_lightbox) {
      __pj__.mainPage.chooser_lightbox.dismiss();
    }
    lightbox.hide();
    shade.hide();
  }
  */


    
    
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
    var ch =  "http://"+om.liveDomain+((om.useMinified)?"/chooser2.html":"/chooser2d.html");
    content.html('<iframe id="lightbox" width="100%" height="100%" scrolling="no" id="chooser" src="'+ch+'?mode='+mode+'"/>');
  }
   

   //var fileBut;
   /*
    page.genButtonss = function (container,options) {
      debugger;
      var toExclude = options.toExclude;
      var down = options.down;
      function addButton(id,text,url) {
        if (down && (id==="file" || id==="sign_in")) return;
       
        if (toExclude && toExclude[id]) return;
        if (url) {
          var rs = $('<a href="'+url+'" class="ubutton">'+text+'</a>');
        } else {
          var rs = $('<div class="ubutton">'+text+'</div>');
        }
        container.append(rs);
        if (0 && url) {
          rs.click(function () {
              location.href = url+(down?"?down=1":"");
          //    page.checkLeave(url+(down?"?down=1":""));
          });
        }
        return rs;
      }
     
      if (signedIn||releaseMode) fileBut = addButton('file',"File");
      addButton('github','GitHub','https://github.com/chrisGoad/prototypejungle');
      addButton('tech','Docs','http://prototypejungle.org/choosedoc.html');
      addButton('about','About','http://prototypejungle.org/about.html');
      if (signedIn || releaseMode) { //(atTest || atInspect || !atMain) && !down && (!toExclude || !toExclude['sign_in'])) {
        page.logoutButton = addButton('logout','logout',"http://"+om.liveDomain+"/logout");
        page.signInButton = addButton('sign_in',"Sign in","http://"+om.liveDomain+"/sign_in");
        if (localStorage.signedIn==="1") {
          page.signInButton.hide();
          page.logoutButton.show();
        } else{
          page.logoutButton.hide();
          page.signInButton.show();
        }
        page.nowLoggedOut = function () {
          localStorage.signedIn=0;
          page.signInButton.show();
          page.logoutButton.hide();
        }
      }
  }
  */
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
  filePD.disabled = (localStorage.sessionId)?[0,0,0]:[1,1,0];
// new item will come back
  filePD.options = ["New Build","New Data","Open Item"];
  filePD.optionIds = ["new","newData","open"];
  //filePD.options = ["New Item","New Build","New Data","Open Item"];
  //filePD.optionIds = ["newItem","new","newData","open"];
  filePD.selector = function (opt) {
    if (opt === "newItem") { // check if an item save is wanted
      var inspectPage = om.useMinified?"/inspect":"/inspectd";
      location.href = inspectPage + "?newItem=1"
      return;
    }
    filePD.container.hide();page.popChooser(opt);
  };
  page.filePD = filePD;
  
  
page.deleteItem = function (path,cb) {
  var dt = {path:path};
  om.ajaxPost("/api/deleteItem",dt,function (rs) {
    if (cb) {
      cb(rs);
    }
  });
}
  
  
  page.genTopbar  = function (container,options) {
    $('.mainTitle').click(function () {location.href = "/"})
    var lc = location.href;
    if (lc.indexOf('down=1')>0) {
      options.down = 1;
    }
   
    var inr = $('#topbarInner');
    page.genButtons(inr,options);
    
    
  }
  /*
  page.genMainTitle = function (container,text) {
    var rs = $('<span class="mainTitle">'+text+'</span>');
    rs.css({'cursor':'pointer'});
    container.append(rs);
    rs.click(function () {location.href = "http://prototypejungle.org"})
  }
  */
  /*
  page.logout = function () {
    om.log("util","page.logout");
    page.logoutButton.hide();
    page.signInButton.show();
    om.clearStorageOnLogout();
  }
  */
  
    
  
})(prototypeJungle);

