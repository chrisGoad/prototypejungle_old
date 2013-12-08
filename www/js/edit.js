
    
(function (__pj__){
 
  var om = __pj__.om;
  var draw = __pj__.draw;
  var page = __pj__.page
  var dom  = __pj__.dom;
 

var cb;
var editor;
var itemPath;
//var theItemPath = '/pj/repoTest2/examples/Nested';
var buildTimeout = 3000;// does not  include load time, just the computation of the bnuild itself
var buildDone;
//var editor;
// var itemPath;
  page.elementsToHideOnError = [];

  
var theCanvas;

  function layout() {
   
    var awinwid = $(window).width();
    var awinht = $(window).height();
    var topht = 30;//$('#topbarOuter').height();
    var eht = awinht - 50 - topht;
    var sidePadding = 30;
    var centerGap = 10;
    var topGap = 20;
    var bottomGap = 30;
    var ptop = topht + topGap;
    var pwd = 0.5 * (awinwid - 2*sidePadding - centerGap);
    var cleft = pwd + centerGap;
    var owd = 2*pwd+centerGap;
    var pht  = awinht - topht - topGap - bottomGap;
    $('#standalone').css({'margin-left':(pwd-180)+"px"});
    $('#err').css(om.pxify({'width':owd-100,"margin-top":20,"color":"red","text-align":"center"}));
                    
     $('#execBut').css(om.pxify({"margin-top":ptop-20}));
    $('#editor').css(om.pxify({left:0,top:ptop,width:pwd,height:pht}));
    $('#canvas').css(om.pxify({left:cleft,top:ptop,width:pwd,height:pht}));
    $('#aouterContainer').css(om.pxify({left:sidePadding,width:owd}));
    $('#topbarOuter').css(om.pxify({"margin-left":0,left:0,width:owd}));
    if (theCanvas) {
      theCanvas.div.attr({width:pwd,height:pht});
      if (theCanvas.contents) {
         theCanvas.fitContents();
      }
    }
  }

function checkAuth() {
  if (!itemPath) {
    return "No item path; the url should include ?item=/handle/repo ...";
  }
// strip off the handle and repo
  var ip = om.stripInitialSlash(itemPath);
  var spl = ip.split("/");
  var h = localStorage.handle;
  if (spl.length<3) {
    return "The item path must include at least /handle/repo/name";
  }
  if (spl[0] !== h) {
     return "You cannot build items outside of your tree /"+h;
  }
}

function pathForItem() {
 // strip off the handle and repo
  var ip = om.stripInitialSlash(itemPath);
  var spl = ip.split("/");
  spl.shift();
  spl.shift();
  return "/"+spl.join("/");
}



function exampleText1() {
   var ipth =pathForItem();
   //var spth = om.pathExceptLast(ipth);
   //var pth = ipth + "/NestedArcs";
   var rs = '\
\n\
//a collection of nested arcs \n\
//see http://prototypejungle.org/tech.html#update for explanations\n\
(function (pj) {\n\
  var om = pj.om; \n\
  var geom = pj.geom;\n\
\n\
  var item = pj.set("'+ipth+'",geom.Shape.mk());\n\
\n\
  //The arc prototype. \n\
  var arcP=item.set("arcP",geom.Arc.mk({radius:100,startAngle:0,endAngle:2*Math.PI})).hide();\n\
  item.radiusFactor = 0.9;\n\
  item.count = 10;\n\
  item.update = function () {\n\
    var om = prototypeJungle.om;\n\
    var arcs = om.LNode.mk().computed();\n\
    this.set("arcs",arcs);\n\
    var crad = this.arcP.radius;\n\
    var cnt = this.count;\n\
    for (var i=0;i<this.count;i++) {\n\
      var ca = this.arcP.instantiate().show();\n\
      arcs.pushChild(ca);\n\
      ca.setf("radius",crad);  // freeze the radius\n\
      crad = crad * this.radiusFactor;\n\
    }\n\
  };\n\
  om.save(item);\n\
})(prototypeJungle);\n\
';
  return rs;

}


function exampleText0() {
   var ipth =pathForItem();
   //var spth = om.pathExceptLast(ipth);
   //var pth = ipth + "/NestedArcs";
   var rs = '\
\n\
//Two Rectangles with a common prototype.\n\
(function (pj) {\n\
    var om = pj.om;\n\
    geom = pj.geom;\n\
    // the item being built \n\
    var item=pj.set("/examples/TwoR",geom.Shape.mk()); \n\
    // A rectangle prototype \n\
    var rectP=item.set("rectP",\n\
        geom.Rectangle.mk(\n\
            {corner:[0,0],extent:[100,100],\n\
             style:{hidden:1,strokeStyle:"black",fillStyle:"green",lineWidth:4}}).hide());\n\
    item.set("r1",rectP.instantiate().show());\n\
    item.set("r2",rectP.instantiate().show());\n\
    item.r2.corner.x = 140;\n\
    item.r2.style.fillStyle = "blue";\n\
    item.r1.draggable = 1;\n\
    item.r2.draggable = 1;\n\
    om.save(item); \n\
})(prototypeJungle);\n\
';
  return rs;

}

function initialText() {
  var rp = om.pathExceptFirst(itemPath);
  if (rp === 'repo0/examples/NestedArcs') {
    return exampleText1();
  }
  if (rp === 'repo0/examples/TwoRectangles') {
    return exampleText0();
  }
  var ipth =pathForItem();
  return  '\n\
// The code that defines the item \n\
(function (pj) {\n\
  pj.om.restore([], // insert dependencies here \n\
    function () {\n\
      // handy variables\n\
      var om = pj.om; \n\
      var geom = pj.geom;\n\
\n\
      // the item being built \n\
      var item = pj.set("'+ipth+'",geom.Shape.mk());  \n\
\n\
      // the code to construct the item goes here \n\
      // for example: item.set("circle",geom.Circle.mk({radius:100})) \n\
\n\
      om.save(item); \n\
    }\n\
  )\n\
})(prototypeJungle)\n\
';

}


function setError(txt,errOnly) {
  if (!errOnly) {
    $('#nowBuilding').hide();
    $('#saving').hide();
     $('#editor').hide();
  }
   $('#error').html(txt);
   layout();
}
var nowSaved = true;

function setSaved(v) {
  if (v === nowSaved) {
    return;
  }
  nowSaved = v;
  if (v) {
    //$('#saved').html('Saved');
    $('#itemkind').html('Item ');
    $('#stale').html('');
  } else {
    $('#saved').html('');
    $('#stale').html('*');
   
  }
  layout();
  if (v) {
    window.removeEventListener("beforeunload",onLeave);
  } else {
    window.addEventListener("beforeunload",onLeave);
 }
}
function buildError(url) {
  if (!buildDone) {
   __pj__.page.genError("<span style='color:red'>Error</span>: the build from <a href='"+url+"'>"+url+"</a> failed, either because the file is missing, or because there was a JavaScript error. \
                        JavaScript debuggers are available in all modern browsers. Edit, and try again.");
  }
}

function saveSource(cb) {
    $('#error').html('');
    var dt = {path:itemPath,source:editor.getValue(),kind:"codebuilt"};
    $('#saving').show();
    om.ajaxPost("/api/toS3",dt,function (rs) {
       $('#saving').hide();
       if (rs.status !== "ok") {
        setError("Save failed. (Internal error)");
      } else {
        setSaved(true);
        if (cb) {
          cb();
        }
      }
    });
  }
  
function getSource(src,cb) {
    // I'm not sure why, but the error call back is being called, whether or not the file is present
    function scb(rs) {
      if (rs.statusText === "OK") {
        cb(rs.responseText);
      } else {
        cb(undefined);
      }
    }
   
    var opts = {url:src,cache:false,contentType:"application/javascript",dataType:"string",type:"GET",success:scb,error:scb};
    $.ajax(opts);
    //code
  }
  
var src = "/scratch/tworectangles.js";
var src = "/scratch/barchart.js";
/*
 http://prototypejungle.org:8000/scratchd.html?source=tworectangles
 */
function showSource(src) {
    getSource(src,function (txt) {
      editor.setValue(txt);
      editor.clearSelection();
    });
}

function evalCode() {
  try {
    om.customSave = function (item) {
        debugger;
      om.root = item;
      var ds = item.dataSource;
      var cb = function () {
        theCanvas.contents = item;
        theCanvas.init();
        layout();
        theCanvas.fitContents();
      }
      if (ds) {
        om.loadData(ds,function (err,dt) {om.afterLoadData(err,dt,cb);});
      } else {
        om.afterLoadData(null,null,cb);
      }
    };
    eval(editor.getValue());
  } catch(e) {
    $('#err').html(e);
    return;
  }
  $('#err').html(' ');
    //code
}


  var getDataSourceFromHref = function () {
    var ash = om.afterChar(location.href,"#");
    if (ash && om.beginsWith(ash,"data=")) {
      var ds = om.afterChar(ash,"=");
      if (om.beginsWith(ds,"/")) {
        return "http://s3.prototypejungle.org"+ds
      }
      return ds;
    }
  }
      
var editor;
var itxt = "// hello ";
page.whenReady = function () {
      $('#saving').hide();
    $('#nowBuilding').hide();
    $('#building').hide();
    om.disableBackspace();
    page.genTopbar($('#topbar'),{includeTitle:1});//,toExclude:{'file':1}});
    $('#execBut').click(evalCode);
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/TextMate");
    editor.getSession().setMode("ace/mode/javascript");
    
    var q = om.parseQuerystring();
    var src = q.item + "/source.js";//"/examples/"+q.source+".js";
    //var sa = "/examples/"+q.source+".html";
    //$('#standalone').attr("href",sa);
    showSource(src);
    var canvasDiv = dom.wrapJQ('#canvas');
    theCanvas = dom.addCanvas(canvasDiv);
    canvasDiv.install();
   // var cnv = draw.initCanvas('#canvas');
    theCanvas.bkColor = "white";
    theCanvas.fitFactor = 0.7;
    layout();
    //var ds = getDataSourceFromHref();
    //if (ds) {
      
   

    //theCanvas = cnv;
}
  
$(window).resize(layout);



})(prototypeJungle);


    