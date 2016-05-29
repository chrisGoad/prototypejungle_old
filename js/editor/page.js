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
        ui.insertBut = html.Element.mk('<div class="ubutton">Insert shape</div>'),
        ui.replaceBut = html.Element.mk('<div class="ubutton">Replace proto</div>'),
       ui.viewDataBut = html.Element.mk('<div class="ubutton">View/Edit Data</div>'),
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
    ui.editContainer =  html.Element.mk('<div id="editContainer" style="border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').addChildren([
      html.Element.mk('<div></div>').addChildren([
        ui.editTitle = html.Element.mk('<span style="margin-left:10px;margin-right:10px">Data source:</span>'),
        ui.editMsg =html.Element.mk('<span>a/b/c</span>'),
        ui.closeEditBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),
     ]),
      ui.editButtons = html.Element.mk('<div id="editButtons" style="border:solid thin red;"></div>').addChildren([
         ui.changeDataSourceBut =html.Element.mk('<div style = "float:right" class="roundButton">Change Source</div>'),
         ui.saveEditBut =html.Element.mk('<div style = "float:right" class="roundButton">Save Source</div>'),
        ui.updateFromDataBut =html.Element.mk('<div style = "float:right" class="roundButton">Update</div>'),
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
     ui.replaceContainer =  html.Element.mk('<div id="replaceContainer" style="border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').addChildren([
       ui.replaceButtons = html.Element.mk('<div id="replaceButtons" style="border:solid thin red;"></div>').addChildren([
        html.Element.mk('<span>Replace selected item with:</span>'),
        // ui.doInsertBut =html.Element.mk('<div style = "margin-left:30px" class="roundButton">Insert</div>'),
        ui.closeReplaceBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),

       ]),
       ui.replaceDiv = html.Element.mk('<div id="replaceDiv" style="border:solid thin red;position:absolute;"></div>')
       .addChildren([
        ui.replaceDivCol1 = html.Element.mk('<div id="col1" style="cursor:pointer;position:absolute;left:0px;top:0px">COL1</div>'),
        ui.replaceDivCol2 = html.Element.mk('<div id="col2" style="cursor:pointer;position:absolute;left:100px;top:0px">COL2</div>')

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
    if (ui.intro) {
      var docwd = 0.25 * pageWidth;
      var svgwd = (0.5 * pageWidth);
    } else if (ui.editMode || ui.insertMode || ui.replaceMode) {
      docwd = 0;
      svgwd = 0.5 * pageWidth;
    } else {
      docwd = 0;
      svgwd = 0.75 * pageWidth;
    }
    var uiWidth = pageWidth/2;
    var treeOuterWidth = uiWidth/2;
    var treeInnerWidth = treeOuterWidth - twtp;
    mpg.$css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-0)+"px"});
    var topHt = 20+topbarDiv.__element.offsetHeight;
    cols.$css({left:"0px",width:pageWidth+"px",top:topHt+"px"});
   
    ui.ctopDiv.$css({"padding-top":"0px","padding-bottom":"20px","padding-right":"10px",left:svgwd+"px",top:"0px"});
    var actionLeft = ui.includeDoc?docwd +10 + "px":"200px";
    actionDiv.$css({width:(uiWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:actionLeft,top:"0px"});
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
      ui.editDiv.$css({top:"40px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-20)+"px"});
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
      ui.replaceContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
      ui.replaceDiv.$css({top:"20px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-20)+"px"});
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
  
  //var editor;
  var editorInitialized; 
  ui.initEditor =    function () {
    var editor;
    if (!editorInitialized) {
      ui.editor = editor = ace.edit("editDiv");
      //editor.setTheme("ace/theme/monokai");
      editor.setTheme("ace/theme/textmate");
      editor.getSession().setMode("ace/mode/javascript");
      editor.renderer.setOption('showLineNumbers',false);
       editor.renderer.setOption('showFoldWidgets',false);
        editor.renderer.setOption('showGutter',false);
       // editor.renderer.setOption('vScrollBarAlwaysVisible',true);
    editorInitialized = 1;
      
    }
  }
  
  ui.editorValue = function () {
    return ui.editor.session.getDocument().getValue()
  }
  
  ui.rebuildItem = function () {
    debugger;
    pj.returnValue= function (err,item) {
      debugger;
      pj.root = item;
      ui.installNewItem();
    }
    var sc = ui.editorValue();
    eval(sc);
    
  }
  
  
  var getPathFromUrl = function (url) {
    if (url[0] === '/') {
      return url;
    } else if (pj.beginsWith(url,'http://prototypejungle.org')) {
      return url.substring(20);
    }
  }
  
  ui.grabText = function (url,cb) {
    debugger;
    $.ajax({url:url,//'/djs/chart-0.9.3.js',
   //$.ajax({url:'http://google.com',//prototypejungle.org/djs/chart-0.9.3.js',
            dataType:'text',
            success:function (rs,status) {
                      debugger;
                      cb(undefined,rs);
            },
            error:function (rs,status) {
              cb(status,rs);
            }
            });
  }
  /*
  ui.getEditText = function (url) {
    debugger;
    ui.editMode = 1;
    ui.layout();
    ui.initEditor();
    $.ajax({url:url,//'/djs/chart-0.9.3.js',
   //$.ajax({url:'http://google.com',//prototypejungle.org/djs/chart-0.9.3.js',
            dataType:'text',
            success:function (rs,status) {
                      debugger;
                      ui.editUrl = url;
                      ui.editMsg.$html(url);
                      ui.editor.setValue(rs);//rs
            },
            error:function (rs,status) {debugger}
            });
  }
  */
  
   ui.getDataForEditor= function (url,cb) {
  /*   ui.grabText(url,function (err,dataString) {
       ui.editMode = 1;
       ui.layout();
       ui.initEditor();
       ui.editUrl = url;
       ui.editMsg.$html(url);
       ui.editor.setValue(dataString);//rs
       //var data = JSON.parse(dataString);
     });
     return;*/
     pj.returnData = function (dataString) {
       debugger;
       ui.editMode = 1;
       ui.layout();
       ui.initEditor();
       ui.editUrl = url;
       ui.editMsg.$html(url);
       ui.editor.setValue(dataString);//rs
       if (cb) {
         cb(dataString);
       }
       
     }
    pj.loadScript(url);
   }

  var getPathFromUrl = function (url) {
    if (url[0] === '/') {
      return url;
    } else if (pj.beginsWith(url,'http://prototypejungle.org')) {
      return url.substring(20);
    }
  }
  
  ui.changeDataSourceBut.$click(function () {
     ui.getDirectory(function (list) {
    debugger;
          ui.popChooser(list,'dataSource');
  });

})
  
  /*ui.closeDataSource.$click(function () {
     ui.dataSourceContainer.$hide();
    ui.editDiv.$css({top:"40px"});
  })*/
  ui.saveEditBut.$click(function () {
    var path = getPathFromUrl(ui.editUrl);
    alert(path);
    var txt = ui.editor.getValue();
    debugger;
    pj.saveString(path,txt,"application/javascript",1,function (rs) { // 1 overwrite
      debugger;
    });
  });
  
   ui.closer = html.Element.mk('<div style="position:absolute;right:0px;padding:3px;cursor:pointer;background-color:red;'+
			     'font-weight:bold,border:thin solid black;font-size:12pt;color:black">X</div>');
  /*
  var insertClose = ui.closer.instantiate();
  ui.insertIframe = html.Element.mk('<iframe width="99%" height="99%" scrolling="no" id="insert" />');
  var insertDiv = html.Element.mk('<div style="position:relative;width:100%;height:100%"  id="insertDiv" />').addChildren([
    insertClose,
    ui.insertIframe
  ]);
   var insertsBeenPopped = 0;
   */
  var chooserClose = ui.closer.instantiate();
  ui.chooserIframe = html.Element.mk('<iframe width="99%" height="99%" scrolling="no" id="chooser" />');
  var chooserDiv = html.Element.mk('<div style="position:relative;width:100%;height:100%"  id="chooserDiv" />').addChildren([
    chooserClose,
    ui.chooserIframe
  ]);
   var chooserBeenPopped = 0;
   
   ui.insertChartUrl = "insert_chart.html";
   
  /*insertClose.$click(function () {
    mpg.insert_lightbox.dismiss();
  });
  
   ui.popInserts = function(icat) {
    debugger;
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.insert_lightbox;
    var fsrc = ui.config.insert_chart;
    //var ifrm = html.Element.mk('<iframe width="100%" height="100%" scrolling="no" id="chooser" src="'+fsrc+'"/>')
    //lb.setContent(ifrm);
    ui.insertIframe.src = fsrc;
    if (!insertsBeenPopped) {
      lb.setContent(insertDiv);
      insertsBeenPopped = 1;

    } else {
      ui.insertIframe.__element.src = fsrc;
    }
    window.setTimeout(function () {lb.pop(undefined,undefined,1);},300);
  }
  */
  
  
  
   ui.chooserReturn = function (v) {
     debugger;
     mpg.chooser_lightbox.dismiss();
     switch (ui.chooserMode) {
       case'saveAs':
         ui.saveItem(v.path);
         break;
      case'saveAsSvg':
        debugger;
         ui.saveItem(v.path,v.force,1);
         break;
      case 'insertOwn':
         insertOwn(v);
         break;
       case 'open':
        if (pj.endsIn(v.path,'.svg')) {
          ui.svgUrl(v.path,function (err,svgPath) {
            debugger;
            location.href = svgPath;
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
         var url = '/' + v.path;
         ui.getDataForEditor(url,function (dataString) {
          var ds = dat.findDataSource();
          if (ds) {
            ui.updateFromData(ds[0],dataString,url);
          }
         });
         break;
     }
   }
   
   ui.popChooser = function(keys,operation) {
    debugger;
    ui.chooserKeys = keys; // this is where the chooser gets its data
    ui.chooserMode = operation;
    //ui.chooserMode = 'open';
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.chooser_lightbox;
    var src =  (pj.devVersion)?"/chooserd.html":"/chooser.html";
    ui.chooserIframe.src = src;
    if (!chooserBeenPopped) {
      lb.setContent(chooserDiv);
      chooserBeenPopped = 1;

    } else {
      ui.chooserIframe.__element.src = src;
    }
    window.setTimeout(function () {lb.pop(undefined,undefined,1);},300);
  }
  
   
  chooserClose.$click(function () {
    mpg.chooser_lightbox.dismiss();
  });
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
      fsel.options = ["New Item","Open...","Add legend","Save","Save As...","Save As SVG..."]; 
      fsel.optionIds = ["new","open","addLegend","save","saveAs","saveAsSvg"];
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
      case "addLegend":
        ui.insertItem('http://prototypejungle.org/sys/repo1/chart/component/legend2.js','legend',undefined,1);
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
      //ui.popChooser();
      //ui.itemName.$html("Saving ...");
      //dom.unpop();
      //ui.anonSave();
      //ui.saveAsVariant(); 
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
 /*
 var repofy = function (path) {
  if (path.indexOf("|")>=0) {
    return path;
  }
  var sp = path.split("/");
  if (sp[0] === '') { // if path starts with /
    sp.shift();
  }
  return '/'+sp.shift()+'/'+sp.shift()+'|'+sp.join('/');

 }
 */
  var whereToInsert,positionForInsert;
  var afterInsert = function (e,rs) {
    debugger;
    var irs = rs.instantiate();
    pj.root.set(whereToInsert,irs);
    if (positionForInsert) {
      irs.__moveto(positionForInsert);
    }
    if (insertAsLegend) {
      var  ds = dat.findDataSource();
      irs.forChart = ds[0];
      irs.__newData = 1;
      irs.__update();
      irs.setColorsFromChart();
    }
    ui.refresh();//ui.fitMode);
    if (ui.nowInserting) {
      //ui.closeSidePanel();
      irs.__select('svg');
      ui.nowInserting = undefined;
    }
  }
  
  var insertAsLegend;
  ui.insertItem = function (path,where,position,asLegend) {
 // ui.messageCallbacks.insertOwn = function (v) {
    insertAsLegend = asLegend;
    positionForInsert = position;
    whereToInsert = where;
    pj.install(path,afterInsert);
   /* if (pj.endsIn(path,'.js')) {
      //var fpath = fullRepoForm(path);
      debugger;
      //pj.main(fpath,afterInsert)
       pj.main(path,afterInsert)
   
    } else {
      //var spath = path.split('/');
      //var repo = 'http://prototypejungle.org'+spath.shift()+'/'+spath.shift();
      //path = spath.join('/');
      debugger;
      pj.install(repo,path,afterInsert); 
     
    }*/
  }
  
  var installSettings;
  var doReplacement = function (e,rs) {
    var selnd = pj.selectedNode;
    var spread = pj.ancestorThatInheritsFrom(selnd,pj.Spread);
    var irs = rs.instantiate();
    if (installSettings) {
      irs.set(installSettings);
    }
    if (spread) {
      irs.__hide();
      spread.replacePrototype(irs);
    } else {
      pj.replacePrototype(selnd,irs);
    }
  }
  ui.replaceItem = function (path,settings) {
    debugger;
    installSettings = settings;
   // path = '/sys/repo1/doodle/bowedlines1.js';
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
  
  
  /*
  ui.popChooser = function (mode) {
    ui.popLightbox();
    var ch =  (pj.devVersion)?"/chooserd.html":"/chooser.html";
    content.html('<iframe id="lightbox" width="100%" height="100%" scrolling="no" id="chooser" src="'+ch+'?mode='+mode+'"/>');
  }
*/
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
    tree.showItem(itm,'auto');
    tree.showProtoChain(itm);
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

   
  
/*
  ui.workerIsReady = 0;
  ui.messageCallbacks.workerReady = function (msg) {
    if (msg.name) {
      localStorage.signedInAs = msg.name;
      localStorage.handle = msg.handle;
    } else {
      localStorage.removeItem('signedInAs');
      localStorage.removeItem('handle');
    }
    ui.workerIsReady = 1;
    if (ui.whenWorkerIsReady) {
      ui.whenWorkerIsReady();
    }
 }
*/
/*
ui.messageCallbacks.list = function (msg) {
  if (ui.whenListIsReady) {
    ui.whenListIsReady(msg.value);
  }
}


ui.signOut =   function () {
  ui.sendWMsg(JSON.stringify({apiCall:"/api/signout",postData:'none',opId:"signOut"}));
}
*/
/*
ui.messageCallbacks.signOut = function () {
  console.log('Sign out done');
  localStorage.removeItem('signedInAs');
  localStorage.removeItem('handle');
  ui.setSignInOutButtons();
}
*/
   ui.saveItem = function (path,cb) {
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
        var loc = path;
      } else {
        var loc = (pj.devVersion?'/editd.html':'/edit.html')+'?item=/'+path;
      }
        //var loc = 'https://prototypejungle.org'+ destPage +"?item="+path;
        //alert(1);
      //window.location.assign(loc);
      location.href = loc;

    });
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
    ui.saveItem(fullPath,1,0,doneSaving);
  } else {
  }
}
/*
ui.saveSvg = function () {
    ui.unselect();
    var str = svg.main.svgString(400,20);
    var doTheSave = function () {
      pj.saveString(str,'image/svg+xml',function (srs) {
        if (srs.status==='fail') {
          var msgKind = pj.beforeChar(srs.msg,' ');
          if (msgKind === 'maxPerIPExceeded') {
            var errmsg = "The save rate is throttled for now to 10 saves per 5 minutes.";
          } else if (msgKind === 'SizeFail') {
            errmsg = "Temporary cap on size ("+pj.maxSaveLength+") exceeded";// this should be caught before sending, but just in case
          } else {
            errmsg = "The site is busy. Please try again later";
          }
          ui.displayTemporaryError(ui.messageElement,errmsg,5000);
          return;
        } else {
          var path = srs.value;
          var loc = 'http://prototypejungle.org'+path;
          location.href = loc;
        }
      });
    }
    if (ui.workerIsReady) {
      doTheSave();
    } else {
      ui.whenWorkerIsReady = doTheSave;
      ui.loadWorker();
    }
  }
  */
  function prototypeSource(x) {
    var p = Object.getPrototypeOf(x);
    return pj.pathExceptLast(p._pj_source);// without the /source.js
  }
    
ui.insertBut.$click(function () {
  debugger;
    ui.insertIframe.__element.src = '/inserts.html';
    ui.insertMode = 1;
    ui.replaceMode = 0;
    ui.layout();
  });

   ui.replaceDivCol1

ui.getReplacements = function (selnd) {
  var spread = pj.ancestorThatInheritsFrom(selnd,pj.Spread);
  if (spread.replacements) {
    return spread.replacements();
  }
}
ui.replaceBut.$click(function () {
  debugger;
  var i;
  var replacements = ui.getReplacements(pj.selectedNode);
  /*
    [{svg:"http://prototypejungle.org/sys/repo1/svg/smudgedBar.svg",url:'/sys/repo1/doodle/bowedlines1.js'},
     {svg:'https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Frounded_rectangle.svg?alt=media&token=221121b3-bad8-4cda-afc5-77ef980dec76',
     url:'/sys/repo1/shape/rounded_rectangle1.js',
     settings:{roundOneEnd:1}}]
     */
  if (!replacements) {
    return;
  }
  ui.replaceDivCol1.$empty();
  var ln = replacements.length;
  var repEls1 = [];
  var repEls2 = [];
  var mkClick = function (dest,settings) {
    return function() {ui.replaceItem(dest,settings)};
  }
  for (i=0;i<ln;i++) {
    var replacement = replacements[i];
    //var repHtml = '<img width="150" src="'+replacement.svg+'"/>';
     var repHtml = '<img width="150"/>';
   var repEl = html.Element.mk(repHtml);
    repEl.src = replacement.svg;
    repEl.$click(mkClick(replacement.url,replacement.settings));
    if (i%2) {
      repEls1.push(repEl);
    } else {
      repEls1.push(repEl);
    }
  }
  ui.replaceDivCol1.addChildren(repEls1);
  ui.replaceDivCol2.addChildren(repEls2);

    //ui.replaceIframe.__element.src = '/replace.html';
    ui.insertMode = 0;
    ui.replaceMode = 1;
    ui.layout();
  });
  
ui.viewDataBut.$click(function () {
  var ds = dat.findDataSource();
  if (ds) {
    debugger;;
   
    ui.saveEditBut.$html('Save data');
    ui.editTitle.$html('Data source:')
    var url = ds[1];
    ui.getDataForEditor(url);
  }
});



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
/*
ui.browseDataSourceBut.$click(function () {
  doList(function (list) {
    debugger;
          ui.popChooser(list,'dataSource');
  });
});
*/


ui.updateFromData =function (dataContainer,dataString,url) {
  debugger;
  var data = JSON.parse(dataString);
  var dt = pj.lift(data);
  dt.__sourceRelto = undefined;
  dt.__sourcePath = pj.fullUrl(undefined,url);
  dt.__requireDepth = 1; // so that it gets counted as a require on externalize
  dataContainer.__idata = undefined;
  dataContainer.setData(dt);
  svg.main.updateAndDraw();
  pj.tree.refreshValues();  
}

ui.updateFromDataBut.$click(function () {
  var ds = dat.findDataSource();
  if (ds) {
    
    /*var dsplit = ds[1].split("|");
    var repo = dsplit[0];
    var path = dsplit[1];
    */
    var dts = ui.editor.getValue();
    ui.updateFromData(ds[0],dts,ds[1]);
  }
});

/*
var newDataSource = function () {
  var nv = ui.dataSourceInput.$prop("value");
  debugger;
}
var enterNewDataSource = function (e) {    
  if((e.key === 13)||(e.keyCode === 13)) {
    newDataSource();
  }
}

ui.dataSourceInput.addEventListener("keyup",enterNewDataSource);

  */
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
    debugger;
    enableButton(bt,0);
  }
  
pj.selectCallbacks.push(
  function (selnd) {
    var replacements = ui.getReplacements(selnd);
    enableButton(ui.replaceBut,!!replacements);
 });


  
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
 /*
 var loadWorkerTried = 0;

ui.loadWorker = function () {
  var domain = (pj.devVersion?'https://prototype-jungle.org':'http://prototype-jungle.org');
  var wp;
  if (!loadWorkerTried) {
    loadWorkerTried = 1;
    //if (pj.devVersion) {
    //  domain += ":8000";
    //}
    var wp = pj.devVersion?"/workerd.html":"/worker.html";
    $('#workerIframe').attr('src',domain+wp);
  }
} 
*/
//end extract


})(prototypeJungle);


