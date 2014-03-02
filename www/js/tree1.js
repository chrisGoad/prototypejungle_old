// This code could use reorg/simplification, for clarity
(function (__pj__) {

  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom  = __pj__.geom;
  var svg = __pj__.svg;
  var draw = __pj__.draw;
  var page = __pj__.page;
  var tree =__pj__.set("tree",om.DNode.mk());
  om.inspectEverything = 1;
  tree.showFunctions = 0;
  tree.showNonEditable = 1;
  var showProtosAsTrees = 0;
  tree.installType("TreeWidget");
  tree.enabled = true; // turned off in flatMode up in inspect
  tree.fullyExpandThreshold = 20;
  tree.highlightColor = "rgb(100,140,255)"
  tree.viewableStringMaxLength = 45;
  tree.newTreeWidget = function (o) {
    this.setProperties(o,["textProto","rootPos"]);
  }
  // ground level operators
  
  var jqp = __pj__.jqPrototypes;
  var mpg = __pj__.mainPage;
  
  tree.set("WidgetLine",Object.create(dom.Element)).namedType();
  tree.set("valueProto",dom.El({tag:"span",style:{"padding-left":"20px"}}));//,style:{"font-weight":"bold"}});
  tree.set("inheritProto",dom.El({tag:"span",html:"inherited"}));
         
  tree.WidgetLine.mk = function (o) {
    return dom.El(o,tree.WidgetLine);
  }

  // prototype for widget lines
  var wline = tree.WidgetLine.mk({tag:"div",style:{"font-size":"10pt",color:"black",width:"100%"}});
  jqp.set("widgetLine", wline);
  var mline =  wline.addChild("main",dom.El({tag:"div",style:{}}));
    mline.addChild("toggle",dom.El({tag:"span",html:"&#9655;",style:{cursor:"pointer",color:"black"}}));
        
  mline.addChild("theName",dom.El({tag:"span",style:{"padding-right":"20px",color:"black"}}));
  om.mline = mline; // for debugging
  tree.wline = wline;
  
  tree.dpySelected = dom.El({tag:"div",style:{color:"black"}})

  tree.protoBut = jqp.set("protoButton", tree.WidgetLine.mk({tag:"span",html:"proto",style:{color:"black",width:"100px"}}));

  
  
  om.DNode.hasNodeChild = function () { // determines whether, in the item browser, this is a leaf
    var rs = false;
    this.iterTreeItems(function (ch) {
      rs = true;
    },true);
    return rs;
  }
  tree.WidgetLine.forNode = function () {
    return om.root.evalPath(this.nodePath);
  }
 
  tree.WidgetLine.forParentNode = function () {
    return om.root.evalPath(this.parentNodePath);
  }
  om.DNode.mkWidgetLine = function (options) { //ownp,clickFun,textFun,forProto,top) {
    if (tree.onlyShowEditable && this.__mfrozen__) return;
    //this.setProperties(options,["clickFun","forProto","noToggle","top","forLnode"]);
    var top = options.top;
    
    var ww = wline; // for debugging
    var rs = wline.instantiate();
    var m = rs.selectChild("main");
    var isLNode = om.LNode.isPrototypeOf(this);
    if (!isLNode && (this.forProto || this.noToggle)) {
      var tg = m.selectChild("toggle");
      tg.hide();
    }
    var pth = this.pathOf(om.root);

    if (top) {
      rs.__treeTop__ = 1;
     //var txt = pth?pth.join("."):"";
      var txt =pth?om.pathToString(pth,"."):"";
      txt = tree.withTypeName(this,txt);
    } else {
      txt = tree.withTypeName(this,this.__name__);
    }
    var thisHere = this;
    var tspan = m.selectChild("toggle");
    if (this.noToggle) {//  && (!forItems || this.hasNodeChild())) {
      tspan.hide();
    } else if (this.__leaf__) {
      tspan.html = " ";
    }  else {
      tspan.click = function (){rs.toggle();}
    }
    var nspan = m.selectChild("theName");
    nspan.html = txt;
    var hp = this.hasTreeProto();
    var clr = "black";
    nspan.style.color = clr;
    nspan.click =  function () {
      rs.selectThisLine("tree");
    }
    if (this.forProto) {
      this.hasWidgetLine = true;
    } else {
   //   this.__protoLine__ =rs;
    }
    rs.nodePath = pth;
    return rs;
  }
  
    om.LNode.mkWidgetLine = om.DNode.mkWidgetLine;

  
  // operations on the widget tree, as opposed to the dom tree
  tree.WidgetLine.treeChild = function (id) {
    var fc = this.selectChild("forChildren");
    if (fc) return fc.selectChild(id);
    return undefined;
  }
  
  tree.WidgetLine.treeParent = function() {
    var pr = this.parent();
    if (pr) {
      return pr.parent();
    }
    return undefined;
  }
  tree.WidgetLine.treePath = function () {
    var rs = [];
    var pr = this.treeParent();
    var cid = this.id;
    while (pr) {
      rs.push(cid);
      cid = pr.id;
      pr = pr.treeParent();
    }
    return rs.reverse();
  }
  
  tree.WidgetLine.addTreeChild = function (nm,ch) {
    var fc = this.selectChild("forChildren");
    if (!fc) {
      fc = dom.El({tag:"div",style:{"margin-left":"20px"}});
      this.addChild("forChildren",ch);
    }
    fc.addChild(nm,ch);
  }
 
  
  tree.WidgetLine.treeTop = function () {
    if (this.__treeTop__) return this;
    var pr = this.treeParent(); // the forChildren node intervenes in the ancestry chain
    return pr.treeTop();
  }
  
  tree.WidgetLine.treeChildren = function () {
    if (this.__prim__) return [];
    var fc = this.selectChild("forChildren");
    if (fc) {
      return fc.theChildren;
    }
    return [];
  }
  tree.WidgetLine.childrenNames = function () {
    var rs = [];
    var tc = this.treeChildren();;
    tc.forEach(function (c) {
      var id = c.id;
      if (id !== undefined) {
        rs.push(id);
      }
    });
    return rs;
  }
  // this finds widget lines whose nodes inherit from this fellow's node
 // method: Find the lines athe same path
  
  tree.WidgetLine.upOrDownChain = function (returnNodes,up) {
    var pth = this.treePath();
    //var frst = tree.mainTop.treeSelectPath(pth);
    var rs = [];
    //if (frst) rs.push(frst);
    var tops = tree.tops;
    if (!tops) {
      return [];
    }
    if (up) {
      var idx = 0;
    } else {
      var myTop = this.treeTop();
      idx = tops.indexOf(myTop)+1;
    } 
    var ln = tops.length;
    for (i=idx;i<ln;i++) {
      var ptop = tops[i];
      var cl =  ptop.treeSelectPath(pth);
      if (!cl) {
        return rs.reverse();
      }
      if (cl === this) { //done
        return rs.reverse(); // in order going up the chain
      } else  {
        if (returnNodes) {
          var topnode = ptop.forNode();
          var nd = topnode.evalPath(pth);
          rs.push(nd);
        } else {
          rs.push(cl);
        }
      }
    }
    return rs;
  }
  
  tree.WidgetLine.upChain = function (returnNodes) {
    return this.upOrDownChain(returnNodes,true);
  }

  
  
  tree.WidgetLine.downChain = function (returnNodes) {
    return this.upOrDownChain(returnNodes,false);
  }
  
  // now find the widget lines which represent the prim fields which inherit from the child named k of this
  tree.WidgetLine.inheritors = function (k) {
    var upc = this.upChain();
    var rs = [];
    var ln = upc.length;
    for (var i=0;i<ln;i++) {
      var u = upc[i];
      var und = u.forNode();
      if (!und.hasOwnProperty(k)) {
        var ch = u.treeSelect(k);
        if (ch) {
          rs.push(ch);
        }
      }
    }
    return rs;
  }
  
  tree.WidgetLine.fieldIsOverridden = function () {
    var k = this.forProp;
    var pr = this.treeParent();
    var upc  = pr.upChain(true);
    var ln = upc.length;
    for (var i=0;i<ln;i++) {
      if (upc[i].hasOwnProperty(k)) return 1;
    }
    return 0;
  }

// find the widget lines which are descendants of this and whose associated nodes inherit from nd
 /* tree.WidgetLine.inheritors = function (nd) {
    var rs = [];
    function r(wl) {// the recursor
      if (nd.isPrototypeOf(wl.forNode())) {
        rs.push(wl);
      }
      var ch = wl.treeChildren();
      ch.forEach(r);
    }
    r(root);
    return rs;
  }
  
   tree.WidgetLine.inheritors = function (nd,k) {
    var rs = [];
    function r(wl) {// the recursor
      if (nd.isPrototypeOf(wl.forNode())) {
        rs.push(wl);
      }
      var ch = wl.treeChildren();
      ch.forEach(r);
    }
    r(root);
    return rs;
  }
  */
 
  // selectChild is at the Element level. this is at the tree level
  tree.WidgetLine.treeSelect = function (nm) {
    if (this.__prim__) return undefined;
    var fc = this.selectChild("forChildren");
    if (fc) {
      var tc = fc.theChildren;
      var ln = tc.length;
      for (var i=0;i<ln;i++) {
        var c = tc[i];
        var id = c.id;
        if (id === nm) {
          return c;
        }
      };
    }
    return undefined;
  }
  
  tree.WidgetLine.treeSelectPath = function (path) {
    var ln = path.length;
    var idx = 0;
    var cw = this;
    for (var i=0;i<ln;i++) {
      var cpe = path[i];
      cw = cw.treeSelect(cpe)
      if (!cw) return undefined;
    }
    return cw;

  }

  tree.WidgetLine.selectedLine = function () {
    var tp = this.treeTop();
    return tp.__selectedLine__;
  }
  
  
  tree.WidgetLine.highlightedPart = function () {

    if (this.__prim__) {
      return this.cssSelect("#title");
    } else if (this.__ref__) {
      return this;
    } else {
      return this.selectChild("main");// this.cssSelect("#main>#theName");
    }
  }
  tree.WidgetLine.unselectThisLine = function () {
    this.__selected__ = 0;
    var nm = this.highlightedPart();
    var el = nm.__element__;
    el.css({"background-color":"white"});
  }
  
  
  tree.WidgetLine.selectChildLine = function (nm) {
    this.expand();
    var ch = this.treeChild(nm);
    if (ch) ch.selectThisLine('tree');
  }

  tree.cfButClick = function () {
    var sl = tree.selectedLine;
    var k = sl.forProp;
    var nd = sl.forParentNode();
    var cv = nd[k];
    var fnv;
    var fns = 'fnv=function(d){return 23;}';
    eval(fns);
    nd[k] = fnv;
    tree.adjust();
  }
  
  tree.WidgetLine.selectThisLine = function (src,forceRedisplay) { // src = "canvas" or "tree"
    //tree.adjust();
    if (this.__prim__) {
      
      var prnd = this.forParentNode();
      var selnd = prnd;
      var prp = this.forProp;
     // var nd  = prnd[prp];
    } else {
      var nd = this.forNode();
      selnd = nd;
      var isSelectable = nd.selectable; // a composite that will be box-surrounded
    }
    // var vse = []; //visible effects NOT IN USE
    tree.selectedLine = this;
    if (this.__selected__ && !forceRedisplay) return;
    tree.selectedNode = selnd;
    if (prnd) return;

    var tp = this.treeTop();
    var isProto = tp.protoTree; // is this the prototype panel?
    var isShapeTree = !(isProto);// the shape panel
    var drawIt =  (src === "tree");
    if (isShapeTree) tree.clearProtoTree();
    var ds = tp.dpySelected;
 
    if (isProto) {
      var p = om.pathOf(selnd,om.root)
      var ps = p.join(".");
     // if (drawIt) vse = nd.visibleProtoEffects();

    }
    /*else if (isShapeTree) { // determine which nodes to highlight
      var dan = selnd.drawnAncestor();
      if (dan) {
        vse = [dan];
      } else {
        vse = selnd.drawnDescendants();
      }
    }
    */
    var sl = tp.__selectedLine__;
    var cntr = tp.__element__.parent().parent();
    this.__selected__ = 1;
    if (sl) sl.unselectThisLine();
    var el = this.highlightedPart().__element__;
    el.css({"background-color":tree.highlightColor });
    tp.__selectedLine__ = this;
      
    // take  care of scrolling
    var cht = cntr.height();
    var coffy = cntr.offset().top;
    om.log("tree","SELECTION STAGE 0 offset ",el.offset());
    // now scroll the fellow into view if needed
    var ely = el.offset().top;
    var soff = cntr.scrollTop();
    var hiddenBy = ely - (coffy+cht); // how far is this element below the visible area?
    if (hiddenBy > -40) {
      cntr.scrollTop(soff + hiddenBy+40);
    } else {
      hiddenBy = coffy -ely;
      if (hiddenBy > -40) {
        cntr.scrollTop(soff-hiddenBy-40);
      }
    }
    om.log("tree","SELECTION STAGE 1");
    if (isShapeTree) { // show the prototype in its panel
      if (this.__ref__) {
        tree.showRef(this.refValue);
      } else {
        tree.showProtoChain(nd);
        //if (this.expanded) {
        //  this.expandProtoChain();
      }
    }
    if (drawIt) {
      selnd.select('tree');
      om.originalSelectionPath = undefined;
      tree.shownItem = selnd;

      __pj__.page.enableTreeClimbButtons();
    }
    //if (drawIt && !isSelectable) draw.mSelect(vse);
    
        om.log("tree","SELECTION DONE");

  }
  
  tree.WidgetLine.ancestorIsSelected = function () {
    if (this.__selected__) return 1;
    var pr = this.treeParent();
    if (!pr) return 0;
    return pr.ancestorIsSelected();
  }


  function showFunction(f,pth)  {
    
    //page.popEditor(f,pth);
    return;
  }
  
  var aa  = 22;

  
  tree.hiddenProperties = {__record__:1,__isType__:1,__record_:1,__external__:1,__selected__:1,__selectedPart__:1,
                          __notes__:1,__computed__:1,__descendantSelected__:1,__fieldStatus__:1,__source__:1,__about__:1,
                          __overrides__:1,__mfrozen__:1,__inputFunctions__:1,__outputFunctions__:1,__current__:1,__canvasDimensions__:1,
                          __beenModified__:1,__autonamed__:1,__origin__:1,__from__:1,__objectsModified__:1,__topNote__:1,
                          __saveCount__:1,__saveCountForNote__:1,__setCount__:1,__setIndex__:1,__doNotUpdate__:1,
                          dataSource:1,__currentXdata__:1,__listeners__:1,transform:1,noData:1,surrounders:1};
  
  
  tree.hiddenProperty = function (p) {
    if (typeof p !== "string") return 0;
    if (tree.hiddenProperties[p]) return 1;
    return (om.beginsWith(p,"__fieldType__")||om.beginsWith(p,"__inputFunction__"));
  }
  
  om.DNode.fieldIsEditable = function (k) {
    if (om.internal(k) || tree.hiddenProperty(k)) return false; // for now;
    var ch = this[k];
    var tp = typeof ch;
    if (k==="data") return (!this.__outsideData__) && (tp === "string");

    if (!this.inWs()) {
      return false;
    }
    
   
    if (tp === "function") return false;
   // if (overriden && overriden[k]) return false;
    return !this.fieldIsFrozen(k)
  }
  
  om.LNode.fieldIsEditable = function (k) {
    var ch = this[k];
    var tp = typeof ch;
    if (tp === "function") return false;
    return true;
  }
  
  
  tree.hasEditableField = function (nd,overriden) { // hereditary
    for (var k in nd) {
      if (nd.fieldIsEditable(k,overriden)) return true;
    
      var ch = nd[k];
      if (om.isNode(ch) && tree.hasEditableField(ch,chovr)) return true;
    }
    return false;
  }
  
  
  tree.WidgetLine.popNote= function () { // src = "canvas" or "tree"
    var prnd = this.forParentNode();
    if (prnd) {
      var nt = prnd.getNote(prp);
      if (nt) this.setNote(nt);
    }
  }
 
  var dontShowFunctionsFor = [geom];
    
    function externalizeString (s) {
      var t = tree.viewableStringMaxLength;
      if (s.length > t) {
        s = s.slice(0,t) +"...";
      }
      return '"'+s+'"';
    }
    function dataString(dt) {
      var tp = typeof dt;
      if ((tp === "string") || (tp === "number") ) return dt;
      if (om.DNode.isPrototypeOf(dt)) {
        var nms = Object.getOwnPropertyNames(dt);
        var a = [];
        nms.forEach(function (k) {
          if (!om.internal(k)) {
            var v = dt[k];
            if (v === null) v = "null";
            var c = "";
            var tp = typeof v;
            if (tp !== "object") {
              c += k+':';
              if (tp === "string") {
                c += externalizeString(v);
              } else if (tp === "number") {
                c += om.nDigits(v, 2);
              } else {
                c += v;
              }
              a.push(c);
            }
          }
          //code
        });
        if (a.length > 0) {
          return "{"+a.join(",")+"}";
        }
      }
    }
  
  /* the correspondence between widgetLines and nodes is represented on the widgetLine side by the paths of the associated
   node: nodePath of non-prim widget lines and parentNodePath for prims. Nodes that have a corresponding widget line have
   the hasWidgetLine property. To look this line up, follow the node's path. */
  
  om.DNode.widgetLineOf = function () {
    if (!this.hasWidgetLine) {
      return undefined;
    }
    var pth = this.pathOf(om.root);
    var wl = tree.mainTop.treeSelectPath(pth);
    return wl;
  }
  
  om.LNode.fieldIsThidden = function (k) { return false;}
  
  // should  property k of this be shown? Returns 0, "prim" "function" "ref" or "node"
  om.DNode.showInTreeP = function (k) {
    if (this.coreProperty(k)) return 0; // a property defined down in core modules of the proto chain.
    if (tree.hiddenProperty(k)) return 0;
   
    if (k === "data") {
      var dataValue = dataString(this.data);
      return dataValue?"prim":false;
    }
    var tHidden = this.fieldIsThidden(k); // hidden from this browser
    if (tHidden) return 0;
    var vl = this[k];
    var tp = typeof vl;
    var isFun = tp === "function";
  
    if (isFun) {
      if (!tree.showFunctions) return 0;
      if (dontShowFunctionsFor.indexOf(this.parent()) >= 0) return false;// excludes eg geom functions
      return "function";
      
    }
    var editable = this.fieldIsEditable(k);
     if (tree.onlyShowEditable && !editable ) {
        return 0;
    }
    var isnd = om.isNode(vl);
    
      
    if (isnd && !this.treeProperty(k)) {
      if (!this.hasOwnProperty(k)) return 0; // inherited references are not shown
      return "ref";
    }
    var isob = tp === "object";
    if (isob && !isnd) return 0;// Outside the tree
    return isnd?"node":"prim";
  }
 
  
 
  om.LNode.showInTreeP = om.DNode.showInTreeP;
  tree.inputFont = "8pt arial";

  tree.computeStringWd = function (s) {
     var wm = dom.measureText(s,tree.inputFont);
     return Math.max(50,wm+20)
   }
  om.DNode.mkPrimWidgetLine = function (options) { // for constants (strings, nums etc).  nd is the node whose property this line displays
  
    var nd = this;
    var clickFun = options.clickFun;
    var isProto = options.isProto;
    var overriden = options.overridden;
    var atFrontier = options.atFrontier;
    var k = options.property;

    var ownp = nd.hasOwnProperty(k);
    var prnd = nd;
    
   
    var frozen = nd.fieldIsFrozen(k);
  
    //var computed = nd.isComputed();
    //var v = tree.applyOutputF(nd,k,nd[k]);
    
    var rs = tree.WidgetLine.mk({tag:"div"});
    //rs.click = function () {
    //  rs.selectThisLine("tree");
   // }
    rs.atFrontier = atFrontier;
    rs.click = function () {
      rs.selectThisLine("tree");
    }
    rs.__prim__ = 1;
    rs.parentNodePath = nd.pathOf(om.root);
    rs.forProp = k;
    var isFun = typeof v === "function";
    var txt = k;
    var notePop;
    if (nd.getNote(k)) {
      var qm =  dom.El({tag:"span",html:"? ",style:{"cursor":"pointer","font-weight":"bold"}});
      rs.addChild("qm",qm);
      var notePop = function () {rs.popNote()};
      qm.click = notePop;
      var sp =  dom.El({tag:"span",html:txt,style:{cursor:"pointer",color:cl}});
      sp.click = notePop;
    } else {
      var sp =  dom.El({tag:"span",html:txt,style:{"padding-right":"5px"}});

    }
  
    rs.addChild("title",sp);
    var ftp = nd.getFieldType(k);
    // assumption: color and functino fields stay that way
    var vl = nd[k];
    var isFun = typeof vl === "function";
    
   

    if (isFun) {
     
      var funBut =  jqp.funbutton.instantiate();
      funBut.html = ownp?" Function ":" Inherited Function";
      rs.addChild("funb",funBut);
      var pth = om.pathToString(nd.pathOf(__pj__).concat(k),".");
      funBut.click = function () {showFunction(v,pth)};
      return rs;
    } 
    if ((!ownp) && (!atFrontier)) { // all properties at the frontier don't count as overriden; that's the last place they can be edited
      var inherited = 1;
    }
    var ovrEl = dom.El({tag:"span",html:" overridden "});
    ovrEl.hide();
    rs.addChild('ovr',ovrEl);
    var inhEl = dom.El({tag:"span",html:" inherited "});
    inhEl.hide();
    rs.addChild('inh',inhEl);
    
    var editable = this.fieldIsEditable(k);
    if (!editable) {
    //  var inp = tree.valueProto.instantiate();
      var inp =  dom.El({tag:"span",html:"zoob"});

      rs.addChild("valueField",inp);
      rs.kind = "value";
      return rs;
    } 
    
    var reinhEl = dom.El({tag:"span",html:" reinherit ",style:{cursor:"pointer","text-decoration":"underline"}});
    reinhEl.hide();
   
    rs.addChild('reinh',reinhEl);
      //  the input field, and its handler
    function onInput(chv) {
      if (typeof chv === "string") {
        page.alert(chv);
      } else if (chv) {
        page.setSaved(false);
        if (tree.autoUpdate && nd.getRequiresUpdate(k)) {
          om.performUpdate("tree");
          tree.adjust();
        } else {
          rs.selectChild("inh").hide(); // this field is no longer inherited, if it was before
          rs.selectChild("reinh").show();
          
          var dwc = rs.downChain();
          dwc.forEach(function (cm) {
            cm.selectChild("inh").hide();
            cm.selectChild("ovr").show();
          });
          var upc = rs.upChain();
          upc.forEach(function (cm) {
            cm.updateValue({});
          });

        }
        // redraw the whole thing, since effects may ripple up from styles, proto chains

        draw.refresh();

      }
    }
   
   
    function reinherit () {
      var prt = Object.getPrototypeOf(nd);
      delete nd[k];
      rs.updateValue({});
      var dwc = rs.downChain(); // @todo should apply this to the proto chain too
      dwc.forEach(function (cm) {
        cm.updateValue({});
      });
      svg.refresh();
    }
    reinhEl.click = reinherit;
 
   
      // put in a color picker
    if (ftp == "svg.Rgb") {
      var cp = dom.El({tag:"input",type:"input",attributes:{value:"CP"}});
      var cl = nd[k];
      cl = cl?cl:"black";
      cp.__color__ = cl; // perhaps the inherited value
      cp.__newColor__ = function (color) {
        var chv = dom.processInput(inp,nd,k,inherited,tree.computeStringWd,color);
        onInput(chv);
        var cls = color.toRgbString();
       // var inh = tree.mainTop.inheritors(nd,tree.mainTree); // @todo should apply this to the proto chain too
        // var inh = rs.treeParent().inheritors(k); // @todo should apply this to the proto chain too
        var inh = rs.upChain();
        inh.forEach(function (wlc) {
          var icp = wlc.selectChild("colorPicker");
          if (icp) {
            icp.__element__.spectrum("set",cls);
          }
        });
      }
      rs.addChild("colorPicker",cp);
      rs.kind = "colorPicker";
      return rs;
    }
      // the remaining case
      //put in a text input field
    var inpwd = 40;
    var inp = dom.El({tag:"input",type:"input",attributes:{value:""},style:{font:tree.inputFont,"background-color":"#e7e7ee",width:inpwd+"px","margin-left":"10px"}});
   
    var blurH = function () {
      var chv = dom.processInput(inp,nd,k,inherited,tree.computeStringWd);
      onInput(chv);
      return;
    }
    inp.blur = blurH;
    rs.addChild("inputField",inp);
    rs.kind = "input";
    /*
    var removeInherited = function () {
      var vl = inp.prop("value");
      if (vl==="inherited") {
        inp.prop("value","");
      }
    }
    inp.mousedown = removeInherited;
    */
    inp.enter = blurH;
    return rs;
  }
  
  om.LNode.mkPrimWidgetLine = om.DNode.mkPrimWidgetLine;
      //else {
      //  var inp = dom.El({tag:"span",style:{"padding-left":"10px","padding-right":"10px"}});
      //  rs.addChild("valueField");
      //  rs.kind = "value";
      //}
    
      // it is convenient to erase "inherited" when the user starts to type into the field
   

  // for prim widget lines only
  tree.WidgetLine.updateValue = function (options) {
    var ind = options.node;
    var nd=ind?ind:this.forParentNode();
    var atFrontier = 0;//this.atFrontier;
    var k = this.forProp;
    if (k === "data") {
      var ds = dataString(nd.data);
    }
    var ovr = this.fieldIsOverridden(k);
    var vl = nd[k];
    var ownp = nd.hasOwnProperty(k);
    var isFun = typeof vl === "function";
  //  rs.addChild("title",sp);
    var ftp = nd.getFieldType(k);
    // assumption: once a field is a color or function this remains true
    var editable = this.fieldIsEditable(k);
    var prt = Object.getPrototypeOf(nd);
    var canReinherit = prt[k] !== undefined;
    if (isFun) return; // assumed stable
    var inhEl = this.selectChild("inh");
    var reinhEl = this.selectChild("reinh");
    var ovrEl = this.selectChild("ovr");
    if (ovr) {
      ovrEl.show();
      inhEl.hide();
      if (reinhEl) reinhEl.hide();
    } else {
      if (!ovrEl) {
        debugger;
      }
      ovrEl.hide();
      if (inhEl) {
        if ((!ownp) && (!atFrontier)) { // all properties at the frontier don't count as overriden; that's the last place they can be edited
          inhEl.show();
          if (reinhEl) reinhEl.hide();
        } else {
          inhEl.hide();
          if (reinhEl && canReinherit) reinhEl.show();
        }
      }
    }
    //var pr = Object.getPrototypeOf(this);
    var proto =  Object.getPrototypeOf(nd);
    //proto.showOverrides(k);
    var knd = this.kind;
    var vts = ds?ds:nd.applyOutputF(k,vl); 
    if (knd === "input") {
      var inf = this.selectChild("inputField");
      inf.prop("value",vts);// I don't understand why this is needed, but is
      inf.attr("value",vts);
      var wdcss = {width:tree.computeStringWd(vts)};
      inf.css(wdcss);
    } else if (knd == "colorPicker") {
      var cp = this.selectChild("colorPicker");
      cp.__color__ = vl; // perhaps the inherited value
      var jel = cp.__element__;
      if (jel) jel.spectrum("set",vl);

    } else {
     
      this.selectChild("valueField").setHtml(vts);
    }
   // return rs;
  }

  
  tree.mkRangeWidgetLine = function (nd,lb,ub,increment) {
    // usually increment = (ub+1-lb) but not always for the last range
    var cl = "black";
    var rs = wline.instantiate();
    rs.__range__ = 1;
    var pth = nd.pathOf(om.root);
    rs.nodePath = pth;
    //rs.forNode = nd;
    rs.lowerBound = lb;
    rs.upperBound = ub;
    rs.increment = increment;
    var txt = "["+lb+"..."+ub+"]";
    var m = rs.selectChild("main");
    var nspan = m.selectChild("theName");
    nspan.html = txt;
    rs.id = txt;
    var tspan = m.selectChild("toggle");
    var cl = function () {
      rs.toggle();
    };
    tspan.click = cl;
   
    return rs;
  }
  
    
  tree.mkRefWidgetLine = function (top,nd,k,v) { // for constants (strings, nums etc).  nd is the node whose property this line displays
    var rf = om.refPath(v,top);
    if (!rf) return undefined;
    var cl = "black";
    var rs = tree.WidgetLine.mk({tag:"div",style:{color:cl}});
    //rs.forNode = v;
    var sp =  dom.El({tag:"span",html:k + " REF "+rf,style:{color:cl}});
    rs.addChild("ttl",sp);
    rs.click = function () {
      rs.selectThisLine("tree");
    }
    rs.__ref__ =1;
   // rs.forNode = nd;
    rs.refValue = v;
    return rs;
  }
  

  tree.WidgetLine.visible = function () {
    if (this.__treeTop__) return true;
    var pr = this.treeParent();
    return pr.visible() && pr.expanded;
  }
  
  // the workspace tree might have been recomputed or otherwise modified, breaking the two-way links between widgetlines
  // and nodes. This fixes them up, removing subtrees where there are mismatches. It also installs new values into primwidgetlines.
  
  // returns true if this line does not have a match in the workspace, that is, if the parent needs reexpansion
  
  // first parent which is not a range; that is, parent if ranges are passed through

  tree.WidgetLine.nonRangeParent = function () {
    var rs = this.treeParent();
    if ( !rs) return undefined;
    if (rs.__range__) {
      return rs.nonRangeParent();
    } else {
      return rs;
    }
  }
  
  
  // the corresponding operation going down the tree; goes past range nodes; accumulate in rs
  tree.WidgetLine.childrenPastRanges = function (rs) {
    if (!rs) {
       var frs = [];
       this.childrenPastRanges(frs);
       return frs;
    }
    var tch = this.treeChildren();
    if (!tch) return;
    tch.forEach(function (ch) {
      if (ch.__range__) {
        ch.childrenPastRanges(rs);
      } else {
        rs.push(ch);
      }
    });                 
  }
  
  
 
  
})(prototypeJungle);

