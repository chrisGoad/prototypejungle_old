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
        ui.viewSourceBut = html.Element.mk('<div class="ubutton">View/Edit Source</div>'),
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
          ui.noteSpan = html.Element.mk('<span>Click on things to adjust them. Then to navigate part/subpart hierarchy:</span>'),
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
       ui.editDiv = html.Element.mk('<div id="editDiv" style="border:solid thin green;position:absolute;">Edit Div</div>'),
    // ui.edit= html.Element.mk('<pre scrolling="auto"/>'),
    //  ui.editIframe = html.Element.mk('<iframe width="99%" height="99%" scrolling="no" id="editIframe" />')
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
    } else if (ui.editMode) {
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
    } else {
      uiDiv.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth + "px")});
      ui.editContainer.$hide();
      uiDiv.$show();
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
     doList(function (list) {
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
  
  var insertClose = ui.closer.instantiate();
  ui.insertIframe = html.Element.mk('<iframe width="99%" height="99%" scrolling="no" id="insert" />');
  var insertDiv = html.Element.mk('<div style="position:relative;width:100%;height:100%"  id="insertDiv" />').addChildren([
    insertClose,
    ui.insertIframe
  ]);
   var insertsBeenPopped = 0;
   
  var chooserClose = ui.closer.instantiate();
  ui.chooserIframe = html.Element.mk('<iframe width="99%" height="99%" scrolling="no" id="chooser" />');
  var chooserDiv = html.Element.mk('<div style="position:relative;width:100%;height:100%"  id="chooserDiv" />').addChildren([
    chooserClose,
    ui.chooserIframe
  ]);
   var chooserBeenPopped = 0;
   
   ui.insertChartUrl = "insert_chart.html";
   
  insertClose.$click(function () {
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
  
   ui.chooserReturn = function (v) {
     debugger;
     mpg.chooser_lightbox.dismiss();
     switch (ui.chooserMode) {
       case'saveAs':
         ui.saveItem(v.path,v.force);
         break;
       case 'insertOwn':
         insertOwn(v);
         break;
       case 'open':
         var url = repofy(v.path);
         var page = pj.devVersion?'editd':'edit';
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
    fsel.options = ["New Item","New Scripted Item","Open...","Insert Chart...","Add legend","Insert own item  ...","View source...","Save","Save As..."]; 
    fsel.optionIds = ["new","newCodeBuilt","open","insertChart","addLegend","insertOwn","viewSource","save","saveAs"];
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
     disabled.new = disabled.insertOwn = disabled.save = disabled.saveAs = !localStorage.signedInAs;

     //fsel.disabled.editText =  !ui.textSelected();
     //fsel.disabled.addLegend = !ui.designatedChart();
     fsel.updateDisabled();
  }

var notSignedIn = function () {
  location.href = "https://prototype-jungle.org/sign_in.html"
}


var doList = function (cb) {
  var listcmd = JSON.stringify({apiCall:"/api/list",postData:'sys/repo1/',opId:"list"});//postdata = ui.handle later
  ui.whenListIsReady = cb;
  if (ui.workerIsReady) {
    if (localStorage.handle) {
      ui.sendWMsg(listcmd);
    } else {
      notSignedIn();
    }
  } else {
    ui.loadWorker();
    ui.whenWorkerIsReady = function () {
      if (localStorage.handle) {
        ui.sendWMsg(listcmd);
      } else {
        notSignedIn();
      }
    }
  }
}

var listAndPop = function (opt) {
  doList(function (list) {
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
        insertItem('http://prototypejungle.org/sys/repo1/chart/component/legend2.js','legend',1);
        break;
      case "open":
      case "insertOwn":
      case "saveAs":
      case "viewSource":
        doList(function (list) {
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
  var whereToInsert;
  var afterInsert = function (e,rs) {
    debugger;
    pj.root.set(whereToInsert,rs.instantiate());
    if (insertAsLegend) {
      var  ds = dat.findDataSource();
      rs.forChart = ds[0];
      rs.__newData = 1;
    }
    ui.refresh(ui.fitMode);
  }
  
  var insertAsLegend;
  var insertItem = function (path,where,asLegend) {
 // ui.messageCallbacks.insertOwn = function (v) {
    insertAsLegend = asLegend;
    
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
  
  var insertOwn = function (v) {
    debugger;
    insertItem(v.path,v.where);
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

 
ui.messageCallbacks.list = function (msg) {
  if (ui.whenListIsReady) {
    ui.whenListIsReady(msg.value);
  }
}


ui.signOut =   function () {
  ui.sendWMsg(JSON.stringify({apiCall:"/api/signout",postData:'none',opId:"signOut"}));
}

ui.messageCallbacks.signOut = function () {
  console.log('Sign out done');
  localStorage.removeItem('signedInAs');
  localStorage.removeItem('handle');
  ui.setSignInOutButtons();
}
  
   ui.saveItem = function (path,overwrite,cb) {
    debugger;
    var needRestore = !!cb;
    var savingAs = 1;
    ui.unselect();
    //pj.mkXItemsAbsolute(pj.root.__requires,pj.repo);
    pj.saveItem(path,pj.root,overwrite,function (srs) {
      // todo deal with failure
      if (srs.status==='fail') {
        if (srs.msg === 'maxPerIPExceeded') {
          var errmsg = "The save rate is throttled for now to 10 saves per 5 minutes.";
        } else {
          errmsg = "The site is busy. Please try again later";
        }
        ui.displayTemporaryError(ui.messageElement,errmsg,5000);
        return;
      } else if (cb) {
        cb();
      } else {
        var path = srs.value;
        var destPage = pj.devVersion?"/editd":"/edit";
        var loc = destPage +"?item="+path;
        location.href = loc;
      }
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
    ui.saveItem(fullPath,1,doneSaving);
  } else {
  }
}
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
  
  function prototypeSource(x) {
    var p = Object.getPrototypeOf(x);
    return pj.pathExceptLast(p._pj_source);// without the /source.js
  }
    
ui.viewSourceBut.$click(function () {
    var url = pj.repo + "/" + pj.path;
    ui.saveEditBut.$html('Save source');
    ui.getEditText(url);
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


ui.closeEditBut.$click(function () {
  ui.editMode = 0;
  ui.layout();
});
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

//end extract


})(prototypeJungle);


