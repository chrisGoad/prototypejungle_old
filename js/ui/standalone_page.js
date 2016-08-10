OBSOLETE /* generates common elements of the html pages 
 * for all pages except inspect and view, which need lighbox management etc
 */

(function (pj) {
   
   var ui = pj.ui;
   
   
// This is one of the code files assembled into pjtopobar.js. //start extract and //end extract indicate the part used in the assembly
//start extract

  ui.useMinified = !(pj.devVersion);// || ui.devAtProd);
   // lightboxes without dependencies
  var lightBoxWidth = 500;
  var lightBoxHeight = 400;
  var atMain  = location.href.indexOf("http://prototypejungle.org")===0;
  var signedIn =  pj.signedIn();;
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
    shade.__show();
    lightbox.__show();
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
      var toExclude = options.toExclude;
      function addButton(id,text,url) {       
        if (toExclude && toExclude[id]) return;
        if (url) {
          var rs = $('<a href="'+url+'" class="ubutton">'+text+'</a>');
        } else {
          var rs = $('<div class="ubutton">'+text+'</div>');
        }
        container.append(rs);
        return rs;
      }
      addButton('github','GitHub','https://github.com/chrisGoad/prototypejungle/tree/r2');
      addButton('tech','Docs','/doc/choosedoc.html');
      addButton('about','About','/doc/about.html');
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
    this.__parent  = pr;
    pr.append(cn);
    this.addLines();
    cn.hide();
  }
  
   PDSel.popFromButton = function (container,button) {
    var pr = this.__parent;
    if (!pr) {
      this.render(container);
      pr = this.__parent;
    }
    var pof = pr.offset();
    var ht = button.height();
    var ofs = button.offset();
    var rofL = ofs.left-pof.left;
    var rofT = ofs.top-pof.top;
    this.container.css({"display":"block","left":20+rofL+"px","top":20+(rofT+ht)+"px",
                       "padding-left":"5px","padding-right":"5px","padding-bottom":"15px"});
  }
  
ui.deleteItem = function (path,cb) {
  var dt = {path:path};
  pj.ajaxPost("/api/deleteItem",dt,function (rs) {
    if (cb) {
      cb(rs);
    }
  });
}
  
  
  ui.genTopbar  = function (container,options) {
      $('.mainTitle').click(function () {
      location.href = "http://prototypejungle.org";
   })
    var inr = $('#topbarInner');
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
    var path = pAd.path;
    var frc = pAd.force;
    var p = pj.stripInitialSlash(path);
    newItemPath = p;
    var dt = {path:p};
    if (frc) {
      dt.force=1;
      
    }
    ui.sendWMsg(JSON.stringify({apiCall:"/api/newItem",postData:dt,opId:"newItemFromChooserStage2"}));
  }
  
//end extract
  
})(prototypeJungle);


