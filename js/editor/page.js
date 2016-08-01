(function (pj) {
  var actionHt; 
  
  var ui = pj.ui;
  var dom = pj.dom;
  var html = pj.html;
  var geom = pj.geom;
  var svg = pj.svg;
  var tree = pj.tree;
  var lightbox = pj.lightbox;
 
  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract


  var geom = pj.geom;
  var treePadding = 0;
  var bkColor = "white";
  var docDiv;
  var minWidth = 1000;
  var plusbut,minusbut;
  var flatInputFont = "8pt arial";
  var uiDiv,editDiv,topbarDiv,obDivTitle;
  var msgPadding = "5pt";
  var inspectDom = 0;
  var uiWidth;
  ui.fitMode = 0;
  ui.editMode = 0;
  ui.insertMode = 0;
  var unpackedUrl,unbuiltMsg;
  //ui.docMode = 1;
  ui.saveDisabled = 0; // true if a build no save has been executed.
  
  var buttonSpacing = "10px";
  var buttonSpacingStyle = "margin-left:10px";
   var jqp = pj.jqPrototypes;
   // the page structure
  var mainTitleDiv = html.wrap('mainTitle','div');
  // note that in a few cases, the new slightly more compact method of making a dom.El from a parsed string is employed. 
    var test=html.Element.mk('<div class="roundButton">Top</div>');
    
  var mpg = ui.mpg =  html.wrap("main",'div',{style:{position:"absolute","margin":"0px",padding:"0px"}}).addChildren([
    topbarDiv = html.wrap('topbar','div',{style:{position:"absolute",height:"10px",left:"0px","background-color":"bkColor",margin:"0px",padding:"0px"}}).addChildren([
    
    actionDiv =  html.Element.mk('<div id="action" style="position:absolute;margin:0px;overflow:none;padding:5px;height:20px"/>').addChildren([
        ui.fileBut = html.Element.mk('<div class="ubutton">File</div>'),
        ui.replaceBut = html.Element.mk('<div class="ubutton">Alternate Marks</div>'),
       ui.viewDataBut = html.Element.mk('<div class="ubutton">View/Change Data</div>'),
        //ui.saveSvgBut = html.Element.mk('<div class="ubutton">Save as SVG</div>'),
        ui.messageElement = html.Element.mk('<span id="messageElement" style="overflow:none;padding:5px;height:20px"></span>')

      ]),
      ui.ctopDiv = html.wrap('topbarInner','div',{style:{float:"right"}})
    ]),

    

    cols =  html.Element.mk('<div id="columns" style="left:0px;position:relative"/>').addChildren([
      ui.docDiv =  docDiv = html.Element.mk('<iframe id="docDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin green;display:inline-block"/>'),
      ui.svgDiv = html.Element.mk('<div id="svgDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin black;display:inline-block"/>').addChildren([
        tree.noteDiv = html.Element.mk('<div style="font:10pt arial;background-color:white;position:absolute;top:0px;left:90px;padding-left:4px;border:solid thin black"/>').addChildren([
          ui.noteSpan = html.Element.mk('<span>Click on things to adjust them. To navigate part/subpart hierarchy:</span>'),
          ui.upBut =html.Element.mk('<div class="roundButton">Up</div>'), 
          ui.downBut =html.Element.mk('<div class="roundButton">Down</div>'),
          ui.topBut =html.Element.mk('<div class="roundButton">Top</div>')
        ])
     ]),
    tree.objectContainer = uiDiv = html.Element.mk('<div id="uiDiv" style="position:absolute;margin:0px;padding:0px"/>').addChildren([
             tree.obDivRest = tree.obDiv = html.Element.mk('<div id="obDiv" style="position:absolute;background-color:white;border:solid thin blue;overflow:auto;vertical-align:top;margin:0px;padding:'+treePadding+'px"/>').addChildren([
                            html.Element.mk('<div style="margin-bottom:0px;border-bottom:solid thin black"/>').addChildren([
                              obDivTitle = html.Element.mk('<span style="margin-bottom:10px;border-bottom:solid thin black">Workspace</span>')
             ]),
        ])
      ]),
    ui.editContainer =  html.Element.mk('<div id="editContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').addChildren([
      html.Element.mk('<div style=";margin-bottom:10px"></div>').addChildren([
         ui.closeEditBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),
        ui.editTitle = html.Element.mk('<span style="font-size:8pt;margin-left:10px;margin-right:10px">Data source:</span>'),
        ui.editMsg =html.Element.mk('<span style="font-size:10pt">a/b/c</span>'),
     ]),
      ui.editButtons = html.Element.mk('<div id="editButtons" style="bborder:solid thin red;"></div>').addChildren([
         ui.changeDataSourceBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Change Source</div>'),
         ui.uploadBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Upload</div>'),
         
        //ui.updateFromDataBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Update</div>'),
      ]),
   /*    ui.dataSourceContainer = html.Element.mk('<div style = "display:none;border:solid thin green;position:absolute;top:40px"></div>').addChildren([
         ui.browseDataSourceBut =html.Element.mk('<div  class="roundButton">Browse...</div>'),
         html.Element.mk('<span style="margin-left:10px;margin-right:10px">New data source:</span>'),

         ui.dataSourceInput = html.Element.mk('<input type="input" style="font:8pt arial;margin-left:10px;width:200px"/>'),
         ui.closeDataSource = html.Element.mk('<span style="background-color:red;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),
       ]),*/
       ui.editDiv = html.Element.mk('<div id="editDiv" style="border:solid thin green;position:absolute;">Edit Div</div>')
    ]),
    ui.insertContainer =  html.Element.mk('<div id="insertContainer" style="border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').addChildren([
       ui.insertButtons = html.Element.mk('<div id="insertButtons" style="border:solid thin red;"></div>').addChildren([
         ui.doInsertBut =html.Element.mk('<div style = "margin-left:30px" class="roundButton">Insert</div>'),
        ui.closeInsertBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),

       ]),
       ui.insertDiv = html.Element.mk('<div id="insertDiv" style="border:solid thin green;position:absolute;"></div>').addChildren([
          ui.insertIframe = html.Element.mk('<iframe width="99%" style="overflow:auto" height="200" scrolling="yes" id="insertIframe" />')
      ])
    ]),
     ui.replaceContainer =  html.Element.mk('<div id="replaceContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').addChildren([
       ui.replaceButtons = html.Element.mk('<div id="replaceButtons" style="margin-left:10px"></div>').addChildren([
        html.Element.mk('<span>Click to replace the marks with:</span>'),
        // ui.doInsertBut =html.Element.mk('<div style = "margin-left:30px" class="roundButton">Insert</div>'),
        ui.closeReplaceBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),

       ]),
       ui.replaceDiv = html.Element.mk('<div id="replaceDiv" style="position:absolute;"></div>')
       .addChildren([
        ui.replaceDivCol1 = html.Element.mk('<div id="col1" style="cursor:pointer;borderr:thin solid black;position:absolute;margin-left:20px;margin-top:40px"></div>'),
        //ui.replaceDivCol2 = html.Element.mk('<div id="col2" style="cursor:pointer;border:thin solid green;position:absolute;left:200px;top:0px">COL2</div>')
        ui.replaceDivCol2 = html.Element.mk('<div id="col2" style="cursor:pointer;margin-right:20px;borderr:thin solid green;float:right;margin-top:40px"></div>')

       //   ui.replaceIframe = html.Element.mk('<iframe width="99%" style="overflow:auto" height="200" scrolling="yes" id="insertIframe" />')
     ])
    ])
  ])
  ])  
  
 
  
  var cnvht = "100%"

  
  ui.intro = 0;
   
   // there is some mis-measurement the first time around, so this runs itself twice at fist
  var firstLayout = 1;
  ui.layout = function(noDraw) { // in the initialization phase, it is not yet time to __draw, and adjust the transform
    // aspect ratio of the UI
    var bkg = "gray";
    var svgwd = 500;
    var svght = 500;
    var ar = 0.48//0.5;
    var pdw = 0;// minimum padding on sides
    var wpad = 0;
    var vpad = 0;//minimum sum of padding on top and bottom
    var cdims = geom.Point.mk(svgwd,svght);
    var awinwid = $(window).width();
    var awinht = $(window).height();
    var pwinwid = awinwid - 2 * wpad;
    var pwinht = awinht - 2 * vpad;
    if (pwinht < ar * pwinwid) { // the page is bounded by height 
      var pageHeight = pwinht;
      var pageWidth = pageHeight/ar;
      var lrs = (awinwid - pageWidth)/2;  
    } else { // the page is bounded by width
      var pageWidth = pwinwid;
      var pageHeight = ar * pageWidth;
    }
    if (ui.includeDoc) {
      var docTop = pageHeight * 0.8 - 20;
      var docHeight = awinht - pageHeight - 30;
    }
    var  twtp = 2*treePadding;
    //uiWidth = pageWidth/2;
    var actionWidth  = 0.5 * pageWidth;
    var docwd = 0;
   // ui.panelWidth = uiWidth; // for the various panels that pop on the right
    if (ui.intro) {
      var docwd = 0.25 * pageWidth;
      uiWidth = 0.25 * pageWidth;
      //svgwd - 
      //var svgwd = (0.5 * pageWidth);
    } else if (ui.replaceMode) {
      docwd = 0;
      //svgwd = 0.5 * pageWidth;
      uiWidth = pageWidth/3;
      //ui.panelWidth = uiWidth;
      //svgwd = pageWidth - uiWidth;
    } else if (ui.editMode) {
      uiWidth = pageWidth/2;
    } else {
      docwd = 0;
      uiWidth = 0.25 * pageWidth;
      svgwd = 0.75 * pageWidth;
    }
    svgwd = pageWidth - docwd - uiWidth;
    ui.uiWidth  = uiWidth; //debugging
    var treeOuterWidth = uiWidth;///2;
    var treeInnerWidth = treeOuterWidth - twtp;
    mpg.$css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-0)+"px"});
    var topHt = 20+topbarDiv.__element.offsetHeight;
    cols.$css({left:"0px",width:pageWidth+"px",top:topHt+"px"});
   
    ui.ctopDiv.$css({"padding-top":"0px","padding-bottom":"20px","padding-right":"10px",left:svgwd+"px",top:"0px"});
    var actionLeft = ui.includeDoc?docwd +10 + "px":"200px";
    actionDiv.$css({width:(actionWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:actionLeft,top:"0px"});
    var actionHt = actionDiv.__element.offsetHeight;//+(isTopNote?25:0);
    topbarDiv.$css({height:actionHt,width:pageWidth+"px",left:"0px","padding-top":"10px"});
    var svght = pageHeight - actionHt -0;
    var panelHeaderHt = 26; // the area above the object/code/data/component panels 
    var treeHt = svght;
    tree.myWidth = treeInnerWidth;
    var tabsTop = "20px";
    tree.obDiv.$css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
    ui.svgDiv.$css({id:"svgdiv",left:docwd+"px",width:svgwd +"px",height:svght + "px","background-color":bkg});
    ui.svgHt = svght;
    if (ui.editMode) {
      ui.editContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
      ui.editDiv.$css({top:"80px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-20)+"px"});
      ui.editContainer.$show();
      uiDiv.$hide();
      ui.insertContainer.$hide();
      ui.replaceContainer.$hide();
    } else if (ui.insertMode) {
      ui.insertContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
      ui.insertDiv.$css({top:"20px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-20)+"px"});
      ui.insertContainer.$show();
      uiDiv.$hide();
      ui.editContainer.$hide();
      ui.replaceContainer.$hide();
    } else if (ui.replaceMode) {
      var rwd = (2/3) * uiWidth;
      ui.replaceContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth+ "px"),height:(svght-0)+"px"});
      ui.replaceDiv.$css({top:"20px",left:"0px",width:(uiWidth+ "px"),height:(svght-20)+"px"});
      ui.insertContainer.$hide();
      ui.replaceContainer.$show();
      uiDiv.$hide();
      ui.editContainer.$hide();
    } else {
      uiDiv.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth + "px")});
      uiDiv.$show();
      ui.editContainer.$hide();
      ui.insertContainer.$hide();
      ui.replaceContainer.$hide();

    }
  docDiv.$css({left:"0px",width:docwd+"px",top:docTop+"px",height:svght+"px",overflow:"auto"});
   svg.main.resize(svgwd,svght); 
    svg.main.positionButtons(svgwd);
    tree.noteDiv.$css({"width":(svgwd - 140)+"px"});
    if (firstLayout) {
      firstLayout = 0; 
      ui.layout();
    }
    if (!noDraw) {
      svg.main.fitContents();
    }
  }
  

/* Begub data sectioon */

/*update the current item from data */

ui.updateFromData =function (dataString,url,cb) {
  debugger;
  var ds = dat.findDataSource();
  if (!ds) {
    return;
  }
  var dataContainer = ds[0];
  var data = JSON.parse(dataString);
  var dt = pj.lift(data);
  dt.__sourceRelto = undefined;
  dt.__sourcePath = url;
  dt.__requireDepth = 1; // so that it gets counted as a require on externalize
  dataContainer.__idata = undefined;
  dataContainer.setData(dt);
  svg.main.updateAndDraw();
  pj.tree.refreshValues();
  if (cb) {
    cb();
  }
}

ui.viewData  = function (dataString) {
  if (!ui.editMode) {
    ui.editMode = 1;
    ui.replaceMode = 0;
    ui.layout();
  }
  var htmlString = '<pre>'+dataString+'</pre>';
  ui.editDiv.$html(htmlString);
  

  
}

ui.viewAndUpdateFromData =  function (dataString,url,cb) {
  ui.viewData(dataString);
  ui.updateFromData(dataString,url,cb);
 
}

ui.getDataJSONP = function (url,initialUrl,cb,dontUpdate) {
  pj.returnData = function (dataString) {
      if (dontUpdate) {
         ui.viewData(rs,url);
        if (cb) {
          cb();
        }
      } else {
        ui.viewAndUpdateFromData(dataString,initialUrl,cb);
      }
    }
    pj.loadScript(url);
}

ui.getDataJSON = function (url,initialUrl,cb,dontUpdate) {
  debugger;
  pj.httpGet(url,function (erm,rs) {
      if (dontUpdate) {
         ui.viewData(rs);
        if (cb) {
          cb();
        }
      } else {
        ui.viewAndUpdateFromData(rs,initialUrl,cb);
      }
  });
}

ui.getData = function (ext,url,initialUrl,cb,dontUpdate) {
  if (ext === 'json') {
    ui.getDataJSON(url,initialUrl,cb,dontUpdate);
  } else if (ext === 'js') {
    ui.getDataJSONP(url,initialUrl,cb,dontUpdate);
  }
}


  ui.uploadBut.$click(function () {
    ui.editDiv.$html('<iframe width = "100%" height="100%" src="/upload.html"></iframe>');
  });
  
  
  ui.changeDataSourceBut.$click(function () {
     ui.getDirectory(function (list) {
    debugger;
          ui.popChooser(list,'dataSource');
  });

});
  
  

ui.viewDataBut.$click(function () {
  var ds = dat.findDataSource();
  if (ds) {
    debugger;;
   
    //ui.saveEditBut.$html('Save data');
    ui.editTitle.$html('Data source:')
    var url = ds[1];
    var iurl = pj.interpretUrl(url).url;
    pj.httpGet(iurl,function (erm,rs) {
                debugger;
                ui.getDataJSON(JSON.parse(rs),url,function () {
                  ui.editMsg.$html(url);
                });
    });
    //ui.getData(url,undefined,'dontUpdate');
    //ui.getDataForEditor(url);
  }
});

/* end data section */ 

/*begin chooser section */
   ui.closer = html.Element.mk('<div style="position:absolute;right:0px;padding:3px;cursor:pointer;background-color:red;'+
			     'font-weight:bold,border:thin solid black;font-size:12pt;color:black">X</div>');
  
  var chooserClose = ui.closer.instantiate();
  ui.chooserIframe = html.Element.mk('<iframe width="99%" height="99%" scrolling="no" id="chooser" />');
  var chooserDiv = html.Element.mk('<div style="position:relative;width:100%;height:100%"  id="chooserDiv" />').addChildren([
    chooserClose,
    ui.chooserIframe
  ]);
   var chooserBeenPopped = 0;
   
   ui.insertChartUrl = "insert_chart.html";
   
ui.loadAndViewData = function (path) {
  debugger;
  var ext = pj.afterLastChar(path,'.');
  if ((ext === 'js') || (ext === 'json')) {
    if (pj.beginsWith(path,'/')) {
       var rpath = path.replace('.',pj.dotCode);
       var uid = ui.currentUser.uid;
       var url = ui.firebaseHome+'/'+uid+'/directory'+rpath+'.json';
       var displayUrl = '['+uid+']'+path;
     } else {
       pj.error('CASE NOT HANDLED YET');
     }
     pj.httpGet(url,function (erm,rs) {
       var cleanUp = ui.removeToken(JSON.parse(rs));
       ui.getData(ext,cleanUp,displayUrl,function () {
             ui.editMsg.$html(displayUrl);
       });    
     });
  } else {
    pj.error('Data files should have extension js or json')
  }
}
   ui.chooserReturn = function (v) {
      debugger;
     mpg.chooser_lightbox.dismiss();
     switch (ui.chooserMode) {
       case'saveAs':
         ui.saveItem(v.path);
         break;
      case'saveAsSvg':
        debugger;
         ui.saveItem(v.path,undefined,1.25);
         break;
      case 'insertOwn':
         insertOwn(v);
         break;
       case 'open':
        if (pj.endsIn(v.path,'.svg')) {
          ui.svgUrl(v.path,function (err,svgPath) {
            debugger;
            location.href = '/svg.html?svg='+encodeURIComponent(svgPath);
          });
          return;
        }
        var storeRefString = ui.storeRefString();
         var url = '/' + storeRefString +  v.path;
         var page = pj.devVersion?'editd.html':'edit.html';
         var dst = '/'+page+'?'+(pj.endsIn(url,'.js')?'source=':'item=')+url;
         location.href = dst;
         break;
       case "viewSource":
         ui.getEditText("/"+v.path);
         break;
       case "dataSource":
        debugger;
         var path = v.path;
         ui.loadAndViewData(path);
         /*
         if (pj.beginsWith(path,'/')) {
            if (pj.endsIn(path,'.json')) {
              var rpath = path.replace('.',pj.dotCode);
              var uid = ui.currentUser.uid;
              var url = ui.firebaseHome+'/'+uid+'/directory'+rpath+'.json';
              var displayUrl = '['+uid+']'+path;
              pj.httpGet(url,function (erm,rs) {
                ui.getDataJSON(JSON.parse(rs),displayUrl,function () {
                  ui.editMsg.$html(displayUrl);
                });
              });
              return;
            }
            var url = ui.firebaseHome+'/'+ui.currentUser.uid+'/s'+path+'.json?callback=pj.returnData';
         } else {
           url = path;
         }
         */
         break;
     }
   }
   
   ui.popChooser = function(keys,operation) {
    debugger;
    if (operation === 'saveAsSvg') {
      ui.aspectRatio = svg.main.aspectRatio();
    }
    ui.chooserKeys = keys; // this is where the chooser gets its data
    ui.chooserMode = operation;
    //ui.chooserMode = 'open';
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.chooser_lightbox;
    var src =  (pj.devVersion)?"/chooserd.html":"/chooser.html";
    //ui.chooserIframe.src = src;
    if (!chooserBeenPopped) {
      lb.setContent(chooserDiv);
      chooserBeenPopped = 1;

    } else {
      ui.chooserIframe.__element.src = src;
    }
    window.setTimeout(function () {lb.pop(undefined,undefined,1);ui.chooserIframe.__element.src = src},300);
  }
  
   
  chooserClose.$click(function () {
    mpg.chooser_lightbox.dismiss();
  });
  
/* end chooser section */
  // file options pulldown 
  
  var fsel = ui.fsel = dom.Select.mk();
  
  fsel.containerP = html.Element.mk('<div style="position:absolute;padding-left:5px;padding-right:5px;padding-bottom:15px;border:solid thin black;background-color:white"/>');
  
  fsel.optionP = html.Element.mk('<div class="pulldownEntry"/>');
          
  var fselJQ;
   
  ui.initFsel = function () {
    if (pj.developerVersion) {
      fsel.options = ["New Item","New Scripted Item","Open...","Insert Chart...","Add legend","Insert own item  ...","View source...","Save","Save As...","Save As SVG..."]; 
      fsel.optionIds = ["new","newCodeBuilt","open","insertChart","addLegend","insertOwn","viewSource","save","saveAs","saveAsSvg"];
    } else {
      fsel.options = ["New Item","Open...","Add Title","Add legend","Save","Save As...","Save As SVG..."]; 
      fsel.optionIds = ["new","open","addTitle","addLegend","save","saveAs","saveAsSvg"];
    }
   var el = fsel.build();
   el.__name = undefined;
    mpg.addChild(el);
    el.$hide();
  }
  
  
  ui.setFselDisabled = function () {
     // ui.setPermissions();
     if (!fsel.disabled) {
        fsel.disabled = {};
     }
     var disabled = fsel.disabled;
     disabled.new = disabled.insertOwn = disabled.save = disabled.saveAs = disabled.saveAsSvg  = !ui.currentUser;

     //fsel.disabled.editText =  !ui.textSelected();
     //fsel.disabled.addLegend = !ui.designatedChart();
     fsel.updateDisabled();
  }

var notSignedIn = function () {
  location.href = "https://prototype-jungle.org/sign_in.html"
}


ui.nowInserting = undefined;
ui.startInsert = function (url,name) {
  ui.points = [];
  ui.nowInserting = {name:name,url:url};
}

ui.completeInsert = function (svgPoint) {
  console.log('completing insert at ',JSON.stringify(svgPoint));
  ui.insertItem(ui.nowInserting.url,ui.nowInserting.name,svgPoint);
}
var listAndPop = function (opt) {
  ui.getDirectory(function (list) {
           debugger;
          ui.popChooser(list,opt);
        });
}

   fsel.onSelect = function (n) {
    var opt = fsel.optionIds[n];
    if (fsel.disabled[opt]) return;
    switch (opt) {
      case "delete":
        confirmDelete();
        break;
      case "new":
        var chartsPage = ui.useMinified?"/charts":"/chartsd";
        location.href = chartsPage;
        break;
      case "save":
        ui.resaveItem(pj.root);
        break;
      case "addTitle":
        ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title');
        break;
      case "addLegend":
        ui.insertItem('/repo1/chart/component/legend3.js','legend',undefined,'legend');
        break;
      case "open":
      case "insertOwn":
      case "saveAs":
      case "saveAsSvg":
      case "viewSource":
        ui.getDirectory(function (list) {
          debugger;
          ui.popChooser(list,opt);
        });
        break;
    case "insertShape":
      ui.popInserts('shapes');
      break;
    case "insertChart":
      ui.popInserts('charts');
      break;
    }
  }
 
 ui.describeAssembly = function () {
  return {};
 }
 
 var aboveOffset = geom.Point.mk(20,-10);
  var toRightOffset = geom.Point.mk(20,10);

  var whereToInsert,positionForInsert;
  var afterInsert = function (e,rs) {
    debugger;
    var irs = rs.instantiate();
    pj.root.set(whereToInsert,irs);
    if (positionForInsert) {
      irs.__moveto(positionForInsert);
    }
    if ((insertKind === 'legend') || (insertKind === 'title')) {
      var  ds = dat.findDataSource();
      irs.forChart = ds[0];
      irs.__newData = 1;
      irs.__update();
      var irsBounds = irs.__bounds();
      var chartBounds = irs.forChart.__bounds();
      debugger;
      if (insertKind === 'title') {
        var above = chartBounds.upperLeft().plus(
                    geom.Point.mk(0.5*irsBounds.extent.x,-0.5*irsBounds.extent.y)).plus(aboveOffset);
        irs.__moveto(above);
      } else {
        var toRight = chartBounds.upperRight().plus(
                    geom.Point.mk(0.5*irsBounds.extent.x,0.5*irsBounds.extent.y)).plus(toRightOffset);
        irs.__moveto(toRight);
      }
      svg.main.fitContents();
      if (insertKind === 'legend') {
        irs.setColorsFromChart();
      }
    }
   
    ui.refresh();//ui.fitMode);
    if (ui.nowInserting) {
      //ui.closeSidePanel();
      irs.__select('svg');
      ui.nowInserting = undefined;
    }
  }
  
  var insertAsLegend;
  ui.insertItem = function (path,where,position,kind) {
    insertKind = kind;
    positionForInsert = position;
    whereToInsert = where;
    pj.install(path,afterInsert);
  }
  
  var installSettings;
  var doReplacement = function (e,rs) {
    debugger;
    var irs = rs.instantiate();
    if (installSettings) {
      irs.set(installSettings);
    }
    irs.__hide();
    pj.replaceableSpread.replacePrototype(irs);
  }
  ui.replaceItem = function (path,settings) {
    installSettings = settings;
    pj.install(path,doReplacement);
  }
  
  var insertOwn = function (v) {
    debugger;
    ui.insertItem('/'+v.path,v.where);
  }
  
 
  ui.fileBut.$click(function () {
    ui.setFselDisabled();
    dom.popFromButton("file",ui.fileBut,fsel.domEl);
  });

   ui.addButtons = function (div,navTo) {
    var plusbut,minusbut,navbut;
    var divel = div.__element;
    ui.plusbut = plusbut = html.Element.mk('<div id="plusbut" class="button" style="position:absolute;top:0px">+</div>');
    ui.minusbut = minusbut = html.Element.mk('<div id="minusbut" class="button" style="position:absolute;top:0px">&#8722;</div>');
    ui.navbut = navbut = html.Element.mk('<div id="navbut" class="button" style="position:absolute;top:0px">'+navTo+'</div>');
    plusbut.__addToDom(divel);
    minusbut.__addToDom(divel);
    navbut.__addToDom(divel);
   // this.initButtons();
  }
  
  
  ui.positionButtons = function (wd) {
    if (ui.plusbut) {
      ui.plusbut.$css({"left":(wd - 50)+"px"});
      ui.minusbut.$css({"left":(wd - 30)+"px"});
      ui.navbut.$css({"left":"0px"});
    }
  }
  
  ui.setInstance = function (itm) {
    if (!itm) {
      return;
    }
    ui.topBut.$show();
    ui.upBut.$show();
    //tree.showItem(itm,itm.selectable?"expand":"fullyExpand",1);
    tree.showItemAndChain(itm,'auto');
    //tree.showProtoChain(itm);
    //ui.upBut.$show();
    enableTreeClimbButtons();
    return;
  }
  
pj.selectCallbacks.push(ui.setInstance); 

  
  ui.elementsToHideOnError = [];
  // a prototype for the divs that hold elements of the prototype chain
  tree.protoSubDiv = html.Element.mk('<div style="background-color:white;margin-top:20px;border:solid thin green;padding:10px"/>');
  ui.errorDiv =  html.wrap('error','div');
  
  ui.elementsToHideOnError.push(cols);
  ui.elementsToHideOnError.push(actionDiv);
  ui.elementsToHideOnError.push(docDiv);
  tree.obDiv.click = function () {
    dom.unpop();
  };
  
  
  tree.viewNote = function(k,note) {
    var h = k?'<b>'+k+':</b> '+note:note;
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(h)
    return;
  }
  
  function mkLink(url) {
     return '<a href="'+url+'">'+url+'</a>';
   } 

 
   ui.saveItem = function (path,cb,aspectRatio) { // aspectRatio is only relevant for svg, cb only for non-svg
    debugger;
    var needRestore = !!cb;
    var savingAs = 1;
    var isSvg = pj.endsIn(path,'.svg');
    ui.unselect();
    //pj.mkXItemsAbsolute(pj.root.__requires,pj.repo);
    pj.saveItem(path,pj.root,function (err,path) {
      debugger;
      // todo deal with failure
      if (err) {
        ui.displayTemporaryError(ui.messageElement,'the save failed, for some reason',5000);
        return;
      } else if (cb) {
        cb(null,path);
        return;
      }
      if (isSvg) {
        var loc = '/svg.html?svg='+encodeURIComponent(path);
      } else {
        var loc = (pj.devVersion?'/editd.html':'/edit.html')+'?item=/'+path;
      }
      location.href = loc;

    },aspectRatio);
  }

ui.canbeResaved = function (itm) {
   var path = itm.__sourcePath;
   var repo = itm.__sourceRepo;
   return path && !(pj.endsIn(path,'.js')) &&  ui.stripPrototypeJungleDomain(repo);
}


ui.resaveItem = function (itm) {
  debugger;
  var doneSaving = function () {ui.messageElement.$hide();};
  if (ui.canbeResaved(itm)) {
    var repo = ui.stripPrototypeJungleDomain(itm.__sourceRepo);
    var path = itm.__sourcePath;
    var fullPath = repo+"/"+path;
    ui.displayMessage(ui.messageElement,'Saving...');
    ui.saveItem(fullPath,doneSaving);
  } else {
  }
}

/* Replacement section */

ui.getReplacements = function (selnd) {
  var spread = pj.ancestorThatInheritsFrom(selnd,pj.Spread);
  if (spread && spread.replacements) {
    return spread.replacements();
  }
}


var repDiv = html.Element.mk('<div style="displayy:inline-block"/>');
repDiv.set('img',html.Element.mk('<img width="150"/>'));
repDiv.set('txt',html.Element.mk('<div style="text-align:center">TXT</div>')); 

ui.replaceBut.$click(function () {
  debugger;
  
  var i;
  var replacements =  pj.replaceableSpread.replacements();//ui.getReplacements(pj.selectedNode);
  if (!replacements) {
    return;
  }
    ui.insertMode = 0;
    ui.editMode = 0;
    ui.replaceMode = 1;
    ui.layout();
  ui.replaceDivCol1.$empty();
  ui.replaceDivCol2.$empty();
  var ln = replacements.length;
  var repEls1 = [];
  var repEls2 = [];
  var allEls = [];
  var highlightEl = function (el) {
    allEls.forEach(function (anEl) {
      if (anEl === el) {
        anEl.$setStyle('border','solid  red');
      } else {
        anEl.$setStyle('border','solid thin black');
      }
    });
  }
  var mkClick = function (el,dest,settings) {
    return function() {
      highlightEl(el);
      debugger;
      ui.unselect();
     // el.$setStyle('border','solid thin red');
      ui.replaceItem(dest,settings)};
  }
  for (i=0;i<ln;i++) {
    var replacement = replacements[i];
    //var repHtml = '<img width="150" src="'+replacement.svg+'"/>';
     //var repHtml = '<img width="150"/>';
   var repEl = repDiv.instantiate();// replacement.svg;
//   repEl.img.width = (ui.panelWidth/2 - 40)+'';
   repEl.img.width = (uiWidth/2 - 40)+'';
   //repEl.img.height = (uiWidth/4)+'';
   repEl.img.src = replacement.svg;

   repEl.txt.$html(replacement.title);

    repEl.$click(mkClick(repEl,replacement.url,replacement.settings));
    if (i%2) {
      repEls2.push(repEl);
    } else {
      repEls1.push(repEl);
    }
    allEls.push(repEl);
  }
  ui.replaceDivCol1.addChildren(repEls1);
  ui.replaceDivCol2.addChildren(repEls2);
  highlightEl(allEls[allEls.length-1]); // by convention the original proto is last

    //ui.replaceIframe.__element.src = '/replace.html';
  
  });
/* end Replacement section */


ui.closeSidePanel = function () {
  if (!ui.insertMode && !ui.editMode && !ui.replaceMode) {
    return;
  }
  ui.insertMode = 0;
  ui.editMode = 0;
  ui.replaceMode = 0;
  ui.layout();
}


ui.closeEditBut.$click(ui.closeSidePanel);

ui.closeInsertBut.$click(ui.closeSidePanel);
 


ui.closeReplaceBut.$click(ui.closeSidePanel);


  ui.alert = function (msg) {
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(msg);
  }
 
  var disableGray = "#aaaaaa";

  var enableButton = ui.enableButton = function (bt,vl) {
    bt.disabled = !vl;
    bt.$css({color:vl?"black":disableGray});
  }
  
  ui.disableButton = function (bt) {
    enableButton(bt,0);
  }


  
  function enableTreeClimbButtons() {
    var isc = tree.selectionHasChild();
    var isp = tree.selectionHasParent();
    ui.upBut.$show();
    ui.topBut.$show();
    ui.downBut.$show();
    enableButton(ui.upBut,isp);
    enableButton(ui.topBut,isp);
    enableButton(ui.downBut,isc);
  }
 
 ui.enableTreeClimbButtons = enableTreeClimbButtons;

  ui.topBut.$click(function () {
    if (ui.topBut.disabled) return;
    var top = tree.getParent(1);
    if (top) {
      top.__select('svg');
    }
    //tree.showTop();
    enableTreeClimbButtons();
  });
  
  ui.upBut.$click (function () {
    if (ui.upBut.disabled) return;
    var pr = tree.getParent();
    if (pr) {
      pr.__select('svg');
    }
    //tree.showParent();
    enableTreeClimbButtons();
  });
  
  
  ui.downBut.$click(function () {
    if (ui.downBut.disabled) return;
    tree.showChild();
    enableTreeClimbButtons();
  });

  
  ui.itemSaved = true; 
 
//end extract


})(prototypeJungle);


