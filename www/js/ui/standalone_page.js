/* generates common elements of the html pages 
if (typeof prototypeJungle === "undefined") {
  var prototypeJungle = {};
}
*/
// for all pages except inspect and view, which need lighbox management etc

(function (pj) {
   var om = pj.om;
   var ui = pj.ui;
   
   
// This is one of the code files assembled into pjtopobar.js. //start extract and //end extract indicate the part used in the assembly
//start extract

  ui.useMinified = !(ui.isDev || ui.devAtProd);
   // lightboxes without dependencies
  var lightBoxWidth = 500;
  var lightBoxHeight = 400;
  var atMain  = location.href.indexOf("http://prototypejungle.org")===0;
  debugger;
  var signedIn =  om.signedIn();;
  var releaseMode = 1; // until release, the signin and file buttons are hidden 
  var content,shade;          
  var lightbox,shade,content;
  ui.createLightbox = function () {
    lightbox = $('<div class="lightbox"/>');
    lightbox.css({
      border:"white black",
      position:"absolute",
      "z-index":5000,
      "background-color":"white",
      "color":"black",
      overflow:"none"
    });
    content  = $('<div/>');
    lightbox.append(content);
    shade = $('<div/>');
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
  }




ui.messageCallbacks.dismissChooser = function () {
    lightbox.hide();
    shade.hide();
  }



    
    
  var lightboxAdded = false;
  
  ui.popLightbox = function () {
    if (!lightboxAdded) {
      $('body').append(lightbox);
      $('body').append(shade);
      lightboxAdded = true;
    }
    ui.theLightbox = lightbox;
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
    var eht = Math.min(bht -  100,lht);
    content.css({height:eht+"px"});
    var dims = {width:lwd+"px",top:(stop+35)+"px",left:(lft+"px")};
    lightbox.css(dims);
    shade.css({width:(wd+"px"),height:(ht+"px"),top:"0px",left:"0px"});
    shade.show();
    lightbox.show();
  }
  
  ui.setLighboxHtml = function (ht) {
    content.html(ht);
  }
  
  
  ui.popChooser = function (mode) {
    ui.popLightbox();
    var ch =  (ui.useMinified)?"/chooser.html":"/chooserd.html";
    content.html('<iframe id="lightbox" width="100%" height="100%" scrolling="no" id="chooser" src="'+ch+'?mode='+mode+'"/>');
  }
   

   var fileBut;
   /* redefines version defined in page. Unify someday */
    ui.genButtons = function (container,options) {
      var signedIn = om.signedIn();
      if (signedIn) {
        var domain = 'http://prototype-jungle.org';
        if (ui.isDev) {
          domain += ":8000";
        }
        var wp = ui.useMinified?"/worker.html":"/workerd.html";
        $('#workerIframe').attr('src',domain+wp);
      }
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
          });
        }
        return rs;
      }
     
      if (signedIn||releaseMode) fileBut = addButton('file',"File");
      if (fileBut) {
        fileBut.click(function () {
          filePD.popFromButton(container,fileBut);
        });
      }
      addButton('github','GitHub','https://github.com/chrisGoad/prototypejungle/tree/svg');
      addButton('tech','Docs','/doc/choosedoc.html');
      addButton('about','About','/doc/about.html');
      if (signedIn || releaseMode) { //(atTest || atInspect || !atMain) && !down && (!toExclude || !toExclude['sign_in'])) {
        ui.signInButton = addButton('sign_in',"Sign in","http://"+ui.liveDomain+"/sign_in");
        if (ui.signInButton) {
          ui.logoutButton = addButton('logout','logout',"http://"+ui.liveDomain+"/logout");
          if (signedIn) {
            ui.signInButton.hide();
            ui.logoutButton.show();
          } else{
            ui.logoutButton.hide();
            ui.signInButton.show();
          }
        }
        ui.nowLoggedOut = function () {
          localStorage.signedIn=0;
          ui.signInButton.show();
          ui.logoutButton.hide();
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
  
   PDSel.popFromButton = function (container,button) {
    var signedIn =  om.signedIn();;

    var pr = this.parent;
    if (!pr) {
      this.render(container);
      pr = this.parent;
    }
    debugger;
    var pof = pr.offset();
    var ht = button.height();
    var ofs = button.offset();
    var rofL = ofs.left-pof.left;
    var rofT = ofs.top-pof.top;
    this.container.css({"display":"block","left":20+rofL+"px","top":20+(rofT+ht)+"px",
                       "padding-left":"5px","padding-right":"5px","padding-bottom":"15px"});
  }
  var filePD = Object.create(PDSel);
  filePD.disabled = (signedIn)?[0,0]:[1,0];
// new item will come back
  filePD.options = ["New Build","Open Item"];
  filePD.optionIds = ["new","open"];
  filePD.selector = function (opt) {
    
    if (opt === "newItem") { // check if an item save is wanted
      debugger;
      var inspectPage = ui.useMinified?"/inspect":"/inspectd";
      location.href = inspectPage + "?newItem=1"
      return;
    }
    filePD.container.hide();ui.popChooser(opt);
  };
  ui.filePD = filePD;
  
  
ui.deleteItem = function (path,cb) {
  var dt = {path:path};
  om.ajaxPost("/api/deleteItem",dt,function (rs) {
    if (cb) {
      cb(rs);
    }
  });
}
  
  
  ui.genTopbar  = function (container,options) {
    ui.createLightbox();
    ui.addMessageListener();

    signedIn = om.signedIn();//(!!localStorage.sessionId) || (localStorage.signedIn==="1"); // signedIn will have changed in index.html#logout=1
    $('.mainTitle').click(function () {location.href = "/"})
    var lc = location.href;
    if (lc.indexOf('down=1')>0) {
      options.down = 1;
    }
    filePD.disabled = (signedIn)?[0,0]:[1,0];
    filePD.render(container);
    var inr = $('#topbarInner');
    debugger;
    ui.genButtons(inr,options);
    
    
  }
  
  
  ui.errorMessages = {timedOut:'Your session has timed out. Please log in again.',
                      noSession:'You need to be logged in to save or build items.',
                      systemDown:"The storage system is down for maintainence (sorry). Please try again later.",
                      busy:'The site is too busy to do the save. Please try again later',
                      collision: 'An unlikely name collision took place. Please try your save again.'
  }
  ui.checkForError = function (rs) {
    if (rs.status === "ok") {
      return 0;
    } else {
      ui.nowLoggedOut();
      ui.setFselDisabled();
      var msg = ui.errorMessages[rs.msg];
      msg = msg?msg:"Operation failed. (Internal error)";
      mpg.chooser_lightbox.dismiss();
      alert(msg); // improve on this
      return 1;
    }
  }
  
  var newItemPath;
  
  ui.messageCallbacks.newItemFromChooserStage2 = function (rs) {
    if (ui.checkForError(rs)) {
      return;
    }
    var ins = ui.useMinified?"/inspect":"/inspectd";
    var url = ins + "?item=/"+newItemPath;
    location.href = url;
  }
  
  ui.messageCallbacks.newItemFromChooser = function (pAd) {
    debugger;
    var path = pAd.path;
    var frc = pAd.force;
    var p = om.stripInitialSlash(path);
    newItemPath = p;
    var dt = {path:p};
    if (frc) {
      dt.force=1;
      
    }
    ui.sendWMsg(JSON.stringify({apiCall:"/api/newItem",postData:dt,opId:"newItemFromChooserStage2"}));
  }
  
//end extract
  
})(prototypeJungle);


