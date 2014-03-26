// This code could use reorg/simplification, for clarity
(function (__pj__) {

  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom  = __pj__.geom;
  var draw = __pj__.draw;
  var page = __pj__.page;
  var tree =__pj__.set("tree",om.DNode.mk());
  om.inspectEverything = 1;
  tree.showFunctions = 0;
  tree.showNonEditable = 1;
  var showProtosAsTrees = 0;
  tree.installType("TreeWidget");
  tree.enabled = true; // turned off in flatMode up in inspect
  var fullyExpandThreshold = 20;
  tree.highlightColor = "rgb(100,140,255)"
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
  
  var dpySelected = dom.El({tag:"div",style:{color:"black"}})

  var protoBut = jqp.set("protoButton", tree.WidgetLine.mk({tag:"span",html:"proto",style:{color:"black",width:"100px"}}));

  
  
  om.DNode.hasNodeChild = function () { // determines whether, in the item browser, this is a leaf
    var rs = false;
    this.iterTreeItems(function (ch) {
      rs = true;
    },true);
    return rs;
  }
  tree.WidgetLine.forNode = function () {
    return om.top.evalPath(this.nodePath);
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
    var cf = om.ComputedField.isPrototypeOf(this);
    var isLNode = om.LNode.isPrototypeOf(this);
    if (!isLNode && (cf || this.forProto || this.noToggle)) {
      var tg = m.selectChild("toggle");
      tg.hide();
    }
    var pth = this.pathOf(om.root);

    if (top) {
      rs.__treeTop__ = 1;
     //var txt = pth?pth.join("."):"";
      var txt =pth?om.pathToString(pth,"."):"";
      txt = tree.withTypeName(this,txt);
    } else if (cf) {
      txt = this.__name__;
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
      this.__protoLine__ =rs;
    }
    rs.nodePath = pth;
    if (cf) {
      var funBut =  jqp.funbutton.instantiate();
      funBut.html = "Computed Value";
      nspan.addChild("funb",funBut);
      var pth = om.pathToString(this.pathOf(__pj__),".")+".fn";
      funBut.click = function () {showFunction(thisHere.fn,pth)};
    }
    return rs;
  }
  
    om.LNode.mkWidgetLine = om.DNode.mkWidgetLine;

  tree.WidgetLine.forNode = function () {
    return om.root.evalPath(this.nodePath);
  }
  
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
  
  tree.WidgetLine.upChain = function () {
    var pth = this.treePath();
    //var frst = tree.mainTop.treeSelectPath(pth);
    var rs = [];
    //if (frst) rs.push(frst);
    var tops = tree.tops;
    var ln = tops.length;
    for (i=0;i<ln;i++) {
      var ptop = tops[i];
      var cl =  ptop.treeSelectPath(pth);
      if (cl === this) { //done
        return rs.reverse(); // in order going up the chain
      } else  {
        rs.push(cl);
      }
    }
    return rs;
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
    }
    var vse = []; //visible effects
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
      if (drawIt) vse = nd.visibleProtoEffects();

    } else if (isShapeTree) { // determine which nodes to highlight
      var dan = selnd.drawnAncestor();
      if (dan) {
        vse = [dan];
      } else {
        vse = selnd.drawnDescendants();
      }
    }
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
    if (drawIt) draw.mSelect(vse);
    
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

  
  tree.hiddenProperties = {__record__:1,__isType__:1,__record_:1,__externalReferences__:1,__selected__:1,__selectedPart__:1,
                          __notes__:1,__computed__:1,__descendantSelected__:1,__fieldStatus__:1,__source__:1,__about__:1,
                          __overrides__:1,__mfrozen__:1,__inputFunctions__:1,__outputFunctions__:1,__current__:1,__canvasDimensions__:1,
                          __beenModified__:1,__autonamed__:1,__origin__:1,__from__:1,__changedThisSession__:1,__topNote__:1,
                          __saveCount__:1,__saveCountForNote__:1,__setCount__:1,__setIndex__:1,__doNotUpdate__:1,transform:1};
  
  
  tree.hiddenProperty = function (p) {
    if (typeof p !== "string") return 0;
    if (tree.hiddenProperties[p]) return 1;
    return (om.beginsWith(p,"__fieldType__")||om.beginsWith(p,"__inputFunction__")||
            om.beginsWith(p,"__requiresUpdate__")|| om.beginsWith(p,"__note__"));
  }
  
  om.DNode.fieldIsEditable = function (k,overriden) {
    if (om.internal(k) || tree.hiddenProperty(k)) return false; // for now;
    if (k==="data") return false;
    if (!this.inWs()) {
      return false;
    }
    var ch = this[k];
    var tp = typeof ch;
    if (tp === "function") return false;
    if (overriden && overriden[k]) return false;
    return !this.fieldIsFrozen(k)
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
  
    function dataString(dt) {
      var tp = typeof dt;
      if ((tp === "string") || (tp === "number")) return dt;
      if (om.LNode.isPrototypeOf(dt)) {
        var ln = dt.length;
        for (var i=0;i<ln;i++) {
          var d=dt[i];
          var tp = typeof d;
          if ((tp !== "string") &&  (tp !== "number")) return;
            
        }
        return "["+dt.join(",")+"]";
      }
      //code
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
  
  
  // should  property k of this be shown? Returns 0, "prim" "function" "ref" or "node"
  om.DNode.showInTreeP = function (k) {
    if (this.coreProperty(k)) return 0; // a property defined down in core modules of the proto chain.
    if (tree.hiddenProperty(k)) return 0;
   
    if (k === "data") {
      var dataValue = dataString(this.data);
      if (!dataValue) {
        return false;
      }
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
 
  om.LNode.showInTreeP = function (k) {
   return 1;
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
      var sp =  dom.El({tag:"span",html:txt});

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
   
    var editable = this.fieldIsEditable(k);
    if (!editable) {
      var inp = tree.valueProto.instantiate();
      rs.addChild("valueField",inp);
      rs.kind = "value";
      return rs;
    } 
    var inputFont = "8pt arial";
    
      //  the input field, and its handler
    function onInput(chv) {
      if (typeof chv === "string") {
        page.alert(chv);
      } else if (chv) {
        page.setSaved(false);
        if (tree.autoUpdate && nd.getRequiresUpdate(k)) {
          tree.updateAndShow("tree");
          tree.adjust();
        } else {
          rs.selectChild("inh").hide(); // this field is no longer inherited, if it was before
          draw.refresh();
          nd.showOverrides(k);

        }
      }
    }
    var computeWd = function (s) {
     var wm = draw.measureText(s,inputFont);
     return Math.max(50,wm+20)
   }
   var inhEl = dom.El({tag:"span",html:" inherited "});
   inhEl.hide();
    rs.addChild('inh',inhEl);
    var ovrEl = dom.El({tag:"span",html:" overridden "});
    ovrEl.hide();
    rs.addChild('ovr',ovrEl);
      // put in a color picker
    if (ftp == "draw.Rgb") {
      var cp = dom.El({tag:"input",type:"input",attributes:{value:"CP"}});
      cp.__color__ = nd[k]; // perhaps the inherited value
      cp.__newColor__ = function (color) {
        var chv = dom.processInput(inp,nd,k,inherited,computeWd,color);
        onInput(chv);
        var cls = color.toRgbString();
       // var inh = tree.mainTop.inheritors(nd,tree.mainTree); // @todo should apply this to the proto chain too
         var inh = rs.treeParent().inheritors(k); // @todo should apply this to the proto chain too
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
    var inp = dom.El({tag:"input",type:"input",attributes:{value:""},style:{font:inputFont,"background-color":"#e7e7ee",width:inpwd+"px","margin-left":"10px"}});
   
    var blurH = function () {
      var chv = dom.processInput(inp,nd,k,inherited,computeWd);
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
    var atFrontier = this.atFrontier;
    var k = this.forProp;
    if (k === "data") {
      var dataValue = dataString(nd.data);
    }
    
    var vl = nd[k];
    var ownp = nd.hasOwnProperty(k);
    var isFun = typeof vl === "function";
  //  rs.addChild("title",sp);
    var ftp = nd.getFieldType(k);
    // assumption: once a field is a color or function this remains true
    var editable = this.fieldIsEditable(k);
    if (isFun) return; // assumed stable
    var inhEl = this.selectChild("inh");
    if (inhEl) {
      if ((!ownp) && (!atFrontier)) { // all properties at the frontier don't count as overriden; that's the last place they can be edited
        inhEl.show();
      } else {
        inhEl.hide();
      }
    }
    //var pr = Object.getPrototypeOf(this);
    var proto =  Object.getPrototypeOf(nd);
    proto.showOverrides(k);
    var knd = this.kind;
    var vts = nd.applyOutputF(k,vl); 
    if (knd === "input") {
      this.selectChild("inputField").attr("value",vts);
    } else if (knd == "colorPicker") {
      var cp = this.selectChild("colorPicker");
      cp.__color__ = vl; // perhaps the inherited value
    } else {
      this.selectChild("valueField").setHtml(vts);
    }
    return rs;
  }

  
  tree.mkRangeWidgetLine = function (nd,lb,ub,increment) {
    // usually increment = (ub+1-lb) but not always for the last range
    var cl = "black";
    var rs = wline.instantiate();
    rs.__range__ = 1;
    rs.forNode = nd;
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
    rs.forNode = nd;
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
  
  
  // adjust version 2
  
  
  // fixup the correspondences between nodes and widgetlines; updates usually rebuild the node side, so this is needed
  // after each update
  
  // First, blow away all the pointers (forNode, and widgeDiv) in either direction.
  // Then walk the node trees in depth first order in parallel.
  //  for each node look for its corresponding fellow on the widget side
  // if it is missing, mark the widget parent with __mismatch__ =1
  // Finally walk the widget tree, rexpanding mismatches. In all of this we skip over the range nodes.
  
  om.DNode.removeWidgetPointers = function () {
    this.deepDeleteProp("widgetDiv");
  }
  
  tree.WidgetLine.removeNodePointers = function () {
    delete this.forNode;
    delete this.forParentNode;
    delete this.__mismatch__;
    var ch = this.childrenPastRanges();
    ch.forEach( function (c) {
      c.removeNodePointers();
    });
  }
  
  
  om.DNode.adjust2 = function(cw) { //cw is the corresponding widget
    cw.forNode = this;
    this.widgetDiv = cw;
    var tch = cw.treeChildren();
    if (!tch || (tch.length === 0)) { // never been expanded, can be ignored.
      return;
    }
    var mismatch = 0;
    // todo slightly dumb to keep going once a mismatch is detected
    this.iterTreeItems(function (ch) {
      var nm = ch.__name__;
      if (tree.hiddenProperty(nm)) return;
      var ccw = cw.treeSelect(nm);
      if (ccw && !mismatch) {
        ch.adjust2(ccw);
      } else {
        mismatch = 1;
      }
    },true);
    if (mismatch) {
      cw.__mismatch__ = 1;
    }
  }
  
  om.LNode.adjust2 = function (cw) { 
    cw.forNode = this;
    this.widgetDiv = cw;
    if (!cw.checkRanges()) {
      cw.__mismatch__ = 1;
      return;
    }
    var ch = cw.childrenPastRanges();
    var ln = ch.length;
    for (var i=0;i<ln;i++) {
      var c = ch[i];
      var nm = c.id;
      var nd = this[nm];
      if (nd) {
        if (typeof nd == "object") {
          nd.adjust2(c);
        }
      } else {
        cw.__mismatch__ = 1;
        return;
      }
    }
  }

  
  // and fix up forParentNodes while at it, and update prim values
  
  tree.WidgetLine.reexpandMismatches = function () {
    if (this.__mismatch__) {
      om.log("tree","found a mismatch at ",this.id);
      this.reExpand();
      return;
    }
    var pnd = this.forNode;
    if (!pnd) return;
    var ch =  this.childrenPastRanges();
    ch.forEach(function (ch) {
      ch.reexpandMismatches();
      if (ch.__prim__) {
        ch.forParentNode = pnd;
        var k = ch.forProp;
        if (pnd.hasOwnProperty(k)) { //|| pnd.atFrontier()) { // for reflecting update of data, not prototype structure, which, so far, updates will not affect
          //var vl =  tree.applyOutputF(pnd,k,pnd[k]); // value in the workspace
          var vl =  pnd.applyOutputF(k,pnd[k]); // value in the workspace
          var inp = ch.selectChild("val");
          if (inp) inp.prop("value",vl);// inp will not be present for function fields
        }
      }
      
    });
  }

  // top level
  
  tree.adjust = function () {
    return;
    var tm = Date.now();
    var topnd = om.root;
    topnd.removeWidgetPointers();
    if (tree.mainTop) {
      om.shapeTree.removeNodePointers();
      topnd.adjust2(om.shapeTree);
      om.shapeTree.reexpandMismatches();
    }
    var etm = Date.now()-tm;
    om.log("tree","adjust took ",etm," milliseconds");
  }

 
      
  // for widgetlines whose forNode is an LNode, check that counts match up on node and widget

  tree.WidgetLine.checkRanges = function () {
    var nd = this.forNode;
    var fsz = this.rangesForSize;
    if (fsz === undefined) {
      var tch = this.treeChildren();
      var rs = tch.length === nd.length;
    } else {
      var rs  = fsz === nd.length;
    }
    om.log("tree","checked range for",this.id," result=",rs);
    return rs;
  }
  
  // assumed that DNode is in the workspace
  om.DNode.atFrontier = function () {
    //console.log("INN",k);
    var proto = Object.getPrototypeOf(this);
    var rs = !proto.inWs();
    return rs;
  }
 
  //  only works and needed on the workspace side, not on protos, hence no ovr
  // showProto shows the values of children, as inherited
  
  
  tree.showRef = function (nd,dpysel) {
    var wl = tree.showProtoTop(nd,0);
    tree.setProtoTitle("Reference");
    tree.protoPanelShowsRef = 1;
    wl.expand();
    return wl;
  }
  
  // cause the tree below here to be expanded in the same places as src, when possible. For keeping the main and prototrees in synch NOT IN USE
  
  tree.WidgetLine.expandLike = function (src) {
    var nms = src.childrenNames();
    var ln = nms.length;
    if (ln) {
      this.expand();
    } else {
      return;
    }
    var thisHere = this;
    nms.forEach(function (nm) {
      var ch = src.treeSelect(nm);
      var mych = thisHere.treeSelect(nm);
      if (mych) {
        ch.__protoLine__ = mych;
        if (ch.expanded) {
          mych.expandLike(ch);
        }
      }
    });
  }
  
  tree.WidgetLine.reExpand = function (force) {
    var ch = this.selectChild("forChildren")
    if (!ch) {
      if (force) this.expand();
      return;
    }
    ch.removeChildren();
    ch.__reExpanding__ = 1;
    this.expanded = 0;
    this.expand();
    ch.__reExpanding = 0;
  }
  // assure that the children are visible; unless there are more than tree.WidgetLine.maxChildren. In this case, display only the target
//  tree.WidgetLine.expand = function (targetName,showTargetOnly) {
  tree.WidgetLine.expand = function (ovr,noEdit,atFrontier) {
    var nd = this.forNode();
    if (!nd) return false;  
    if (tree.onlyShowEditable && !tree.hasEditableField(nd,ovr)) return false;
    var tp = this.treeTop();
    var isProto = tp.protoTree && (!tree.protoPanelShowsRef);
    if (isProto) {
      var plineOf = nd.__protoLine__;
    }
    var isLNode = om.LNode.isPrototypeOf(nd);
    if (this.expanded) return; 
    var ch = this.selectChild("forChildren");
    if (!ch) {
      ch  = dom.El({tag:"div",style:{"margin-left":"20px"}});
      this.addChild("forChildren",ch);
      var newCh = true;
    } else {
      newCh = ch.__reExpanding__;
      ch.show();
    }
      
    
    
    function addLine(ch,nd,k,tc) { // ch = jq element to add to nd = the parent, k = prop, tc = child
      if (ch.selectChild(k)) return; //already there
      var knd = nd.showInTreeP(k);
      var options = {addTo:ch,treeTop:tp,property:k};
      if (!knd) {
        return;
      } else if (knd === "node") {
        //if (tree.onlyShowEditable && (!tree.hasEditableField(nd[k],ovr?ovr[k]:undefined))) return;
        var ln = tc.mkWidgetLine(options);
      } else {
        var overriden = ovr && ovr[k];
        ln = nd.mkPrimWidgetLine(options);
      }
      if (ln) {
        ch.addChild(k,ln);
        //ln.install();
        if (knd === "prim") ln.updateValue({node:nd});
      }
      return ln;
    }
    
    function addRangeLine(nd,lb,ub,increment) { // nd = the parent, k = prop, tc = child
      var  ln = tree.mkRangeWidgetLine(nd,lb,ub,increment);
      ch.addChild(k,ln);
      return ln;
    }
    // for debugging
    __pj__.test0 = function () {
     var ws = __pj__.om.root;
     ws.lineCount = 20;
     ws.update();
     __pj__.tree.adjust();
    }
    
    
    function addRanges(nd,lb,ub,incr) {
      if (incr < 10) {

        for (var rk=lb;rk<=ub;rk++) {
          var rv = nd[rk];
          addLine(ch,nd,rk,rv);
        }
        return;
      }
      var nln = ub+1-lb;
      var ci = lb;
      var cub = lb;
      while (cub  < ub) {
        var cub = Math.min(ub,ci+incr-1);
        if ((cub + 1) >= ub) {
          cub = ub;
        }
        addRangeLine(nd,ci,cub,incr);
        ci = ci + incr;
      }
    }
    if (this.__range__ && newCh) {
      var lb = this.lowerBound;
      var ub = this.upperBound;
      var incr = this.increment;
      var incr = incr/10;
      addRanges(nd,lb,ub,incr);
      finishOff(this);
      return;
    }
    var rs = undefined;
    if (newCh) { //new children
      if (this.__multiRoot__) {
        foob(); //obsolete i think
        for (var k in nd) {
          if (nd.hasOwnProperty(k) && (k!=="widgetDiv") && (!om.internal(k))) {
            var tc = nd[k];
            ln = addLine(ch,nd,k,tc);
          }
        }
      } else {
        var toIter =   function (tc,k) {
          addLine(ch,nd,k,tc);
        }   
        if (isLNode) {
          var nln = nd.length;
          var lg10 = Math.floor(Math.log(nln)/Math.log(10));
          //var pw10 = Math.pow(10,lg10);
          var incr = Math.pow(10,lg10);
          if (incr*2 > nln) {
            incr = incr/10;
            //code
          }
          addRanges(nd,0,nln-1,incr);
          this.rangesForSize = nln;
        } else {
           var dt =  nd.data;
           if (dt) {
             addLine(ch,nd,"data",dt);
            //code
           }
           nd.iterInheritedItems(toIter,tree.showFunctions,true); // true = alphabetical
        }
      }
      // want prototype in there, though it is not enumerable
    } else {
      ch.show();
    }
    function finishOff(w){
      if (w.__element__) {
        w.install();
      }
      w.expanded = 1;
      w.hasBeenExpanded = 1;
    }
    finishOff(this);
    if (!isProto) this.expandProtoChain();
    return rs;
  }
  
  tree.WidgetLine.fullyExpand = function (ovr,noEdit,atFrontier) {
    if (om.LNode.isPrototypeOf(this.forNode)) {
      return;
    }
    this.expand(ovr,noEdit,atFrontier);
    var ch = this.treeChildren();
    if (ch) {
      ch.forEach(function (c) {
        if (!c.__prim__) {
          var cnd = c.forNode;
          var nm = cnd.__name__;
          var covr = ovr?ovr[nm]:undefined;
          c.fullyExpand(covr,noEdit,atFrontier);
        }
      });
    }
  }

  tree.WidgetLine.fullyExpandIfSmall = function(ovr,noEdit,atFrontier) {
    var tsz = this.forNode().treeSize(tree.hiddenProperties);
    console.log("Treesize",tsz);
    if (tsz <= fullyExpandThreshold) {
      this.fullyExpand(ovr,noEdit,atFrontier);
    } else {
      this.expand(ovr,noEdit,atFrontier);
    }
  }

 

  // follow the path down as far as it is reflelib.WidgetLine.expandcted in the widget tree (ie the widgetDivs). return a pair [exit,remainingPath]
  // exit is the node just before the path leaves the tree (if it does, or where the path leads)
  // remaining path is what is left
  // returns a pair: the nearest ancestor with a widget line, and the path leading from there
  
  om.DNode.ancestorWithWidgetLine = function () {
     var pth = [];
     var cnd = this;
     while (true) {
      if (cnd.get("widgetDiv")) return {node:cnd,path:pth};
      pth.unshift(cnd.__name__);
      cnd = om.getval(cnd,"__parent__");
      if (!cnd) return undefined;
      
     }
  }
  
  om.DNode.ancestorBelow = function (nd) {
    var pr = om.getval(this,"__parent__")
    if (!pr) return undefined;
    if (pr === nd) return this;
    return pr.ancestorBelow(nd);
  }
  // this adds a DNode into the widget tree structure. There are two cases
  // If this's parent is in the tree, then whichTree is not needed
  // ow, the node is being added to a multiRoot, given by whichTree.
  // this is for the protos, which are rooted at i.
  
  
  // find the range child, if any which contains n
  tree.WidgetLine.findRangeChild = function (n) {
    var tc = this.treeChildren();
    if  (tc && (tc.length)) {
      var c0 = tc[0]; // if any children are ranges, the first will be
      var rng = c0.__range__;
      if (rng) {
        var ln = tc.length;
        for (var i=0;i<ln;i++) {
          var c = tc[i];
          var lb = c.lowerBound;
          var ub = c.upperBound;
          if ((lb <= n) && (n <= ub)) {
            return c;
          }
        }
      }
    }
    return undefined;
  }
  // this assures that the parent is expanded, and this node is visible
  om.DNode.expandToHere = function () {
    var wd = om.getval(this,"widgetDiv");
    if (wd && wd.visible()) {
      return;
    }
    //var pr = this.treeParent();

    var pr = this.__parent__;
    pr.expandToHere();
    // pr might have range kids if pr is an LNode
    var pwd = om.getval(pr,"widgetDiv");
    pwd.expand();
    var isLNode = om.LNode.isPrototypeOf(pr);
    if (isLNode) {
      var n = this.__name__;
      var cw = pwd;
      while (cw) {
        var cw = cw.findRangeChild(n);
        if (cw) {
          cw.expand();
        }
      }

    }
  }
  
  om.LNode.expandToHere = om.DNode.expandToHere;
 
  
  tree.WidgetLine.contract = function () {
    // generates widget lines for the childern
    if (!this.expanded) return;
    var ch = this.selectChild("forChildren");
    ch.hide();
    this.expanded = false;
    //this.contractProtoChain();
  }
  
  tree.WidgetLine.assertOverridden = function (k) {
    var ch = this.treeSelect(k);
    if (ch) {
      var ovr = ch.selectChild("ovr");
      if (ovr) {
        ovr.show();
      }
    }
  }
    
  // It is assumed that k has been overriden  for this (ie in the shown proto chain, it is an ownProperty further up
  // This cruises down the prototype chain, and for each node that has a __protoLine__
  // it asserts that the property has been overriden
  
  om.DNode.showOverrides = function (k) {
    var pline = this.get("__protoLine__");
    if (pline) {
      pline.assertOverridden(k);
      var pr = Object.getPrototypeOf(this);
      if (pr.showOverrides) {
        pr.showOverrides(k);
      }
    }
  }
    
  
  tree.WidgetLine.applyToProtoChain = function (fn) {
    var cnd = this.forNode;
    while (true) {
      var cnd = Object.getPrototypeOf(cnd);
      var pline = cnd.__protoLine__; // the widgetline corresponding to this node
      if (pline) {
        fn(pline);
      } else  {
        return;  
      }
      //code
    }
  }
  
  
  
  tree.WidgetLine.applyToProto = function (fn) {
    var cnd = this.forNode;
    while (true) {
      var cnd = Object.getPrototypeOf(cnd);
      var pline = cnd.__protoLine__; // the widgetline corresponding to this node
      if (pline) {
        fn(pline);
      } else  {
        return;  
      }
      //code
    }
      
  
  tree.WidgetLine.applyToProtoChain = function (fn) {
    var cnd = this.forNode;
    while (true) {
      var cnd = Object.getPrototypeOf(cnd);
      var pline = cnd.__protoLine__; // the widgetline corresponding to this node
      if (pline) {
        fn(pline);
      } else  {
        return;  
      }
      //code
    }
    
  tree.WidgetLine.expandProtoChain = function () {
    this.applyToProtoChain(function (wl) {
      wl.expand();
    });
  }
  tree.WidgetLine.expandProtoChain = function () {
    this.applyToProtoChain(function (wl) {
      wl.expand();
    });
  } 
  
  tree.WidgetLine.toggle = function () {
   
    var tg = this.cssSelect('#main>#toggle');
    if (this.expanded) {
      this.contract();
    //  tg.__element__.html('&#x25BA;');
      tg.__element__.html('&#9655;');
    } else {
      tree.adjust();
      this.expand();
      var nd = this.forNode;
      
      tg.__element__.html('&#9698;');

      //tg.__element__.html('&#x25BC;');
    }
  }
  om.LNode.expandWidgetLine = om.DNode.expandWidgetLine;
  om.LNode.contractWidgetLine = om.DNode.contractWidgetLine;
  om.LNode.toggleWidgetLine =  om.DNode.toggleWidgetLine;
   
  tree.attachTreeWidget = function (options) {
    var div = options.div;
    var root = options.root;
    //var clickFun = options.clickFun;
    //var textFun = options.textFun;
    var wOptions = om.DNode.mk();
    wOptions.setProperties(options,["forProto","inWs","atFrontier"]);
    wOptions.top = 1;
    //var forProto = options.forProto;
    //var inWs = 
    //var noToggle = options.noToggle;
    var ds = dpySelected.instantiate();
    //var wline = rnd.mkWidgetLine(true,clickFun,textFun,forProto,true);
   // var wline = root.mkWidgetLine({top:true,clickFun:clickFun,textFun:textFun,forProto:forProto,noToggle:noToggle,top:true,forItems:forItems});
     var wline = root.mkWidgetLine(wOptions);
   //wline.__treeTop__ = 1;
    ds.install(div); // interupt the Element tree here
    wline.install(div);
   // wline.__clickFun__ = clickFun;
   // wline.__textFun__ = textFun;
    wline.dpySelected = ds;
    return wline;
    
 
  }
 
  om.DNode.atProtoFrontier = function () { // the next fellow in the prototype chain is outside the ws
    prnd = Object.getPrototypeOf(this);
    return (!prnd.__parent__)||(!prnd.inWs());
  }
  om.LNode.atProtoFrontier = function () {
    return false;
  }
  
  tree.protoLines = [];
  //n = nth in  proto chain.
  // ovr is an object with properties k:1 where k is overriden further up the chain, or k:covr , where covr is the ovr tree for prop k
  tree.showProto = function (prnd,k,n,ovr) {
    var inWs = prnd.inWs();
    if (inWs) {
      var atF =  !(Object.getPrototypeOf(prnd).inWs());
    } else {
      atF = false;
    }
    var wl = tree.showProtoTop(prnd,atF,inWs,ovr);
    tree.protoTops.push(wl);
    tree.tops.push(wl);
    if (1 || (showProtosAsTrees && tree.enabled)) {
      prnd.__protoLine__ = wl; // gives the correspondence between main tree, and proto tree
      wl.fullyExpandIfSmall(ovr,!inWs,atF);
          //wl.fullyExpand(ovr,!inWs,atF);
    }
  }
  
  tree.showProtoChain = function (nd,k) {
    tree.protoPanelShowsRef = 0;
    tree.protoState = {nd:nd,k:k}
    tree.setProtoTitle("Prototype Chain");
    tree.protoDivRest.empty();
    tree.protoTops = [];
    tree.tops = [tree.mainTop];
    var cnd = nd;
    var n = 0;
    var ovr = {};
    // ovr is a tree structure which contains, hereditarily, the properties set in the node nd,, rather than the prototype prnd
    // in other words, ovr shows what is overriden
    
    function addToOvr(nd,prnd,ov) {
      var op = Object.getOwnPropertyNames(nd);
      op.forEach(function (p) {
        var v = nd[p];
        var pv = prnd[p];
        
        if (om.isAtomic(v)||(typeof v === "function")) {
          ov[p] = 1;
        } else if (nd.treeProperty(p)) {
          if (!pv) { // this branch did not come from a prototype
            return;
          }
          var covr = ovr[p];
          if (!covr) {
            ovr[p] = covr = {};
          }
          addToOvr(v,pv,covr);
        }
      });
    }
    addToOvr(nd,Object.getPrototypeOf(nd),ovr);
    var inWs = true;
    while (true) {
      var prnd = Object.getPrototypeOf(cnd);
      if ((!prnd.__parent__)||(prnd === cnd)) {
       return;
      }
      var atF = inWs && (!prnd.inWs());
      if (atF) {
        tree.protoDivRest.__element__.append("<div style='margin-top:10pt;margin-bottom:10pt;width:100%;height:2px;color:white;background-color:red'>_</div>");
        tree.protoDivRest.__element__.append("<div style='font-size:8pt'>The prototypes below are outside the workspace and cannot be edited</div>");
        inWs = false;
      }
      tree.showProto(prnd,k,n++,ovr);
      cnd = prnd;
      addToOvr(cnd,Object.getPrototypeOf(cnd),ovr);
    }
  }
  
  tree.refreshProtoChain = function () {
    var s= tree.protoState;
    if (s) {
      tree.showProtoChain(s.nd,s.k);
    }
  }
  tree.withTypeName = function (nd,nm) {
    var  tpn=nd.protoName();
    if (tpn === "DNode" || nm === tpn) {
      return nm;
    } else {
      return nm + " : " + tpn;
    }
  }

  tree.shapeTextFun = function (nd) {
    var tnm = nd.__name__;
    var nm = (typeof tnm === "undefined")?"root":tnm;
    return tree.withTypeName(nd,nm);
  }
    
    
// n  is the index of this tree in the prototype chain

  tree.setProtoTitle = function (txt) {
    tree.protoDivTitle.__element__.html(txt);
  }
  
  
    tree.showProtoTop = function (o,atFrontier,inWs,ovr) {
      var subdiv = tree.protoSubDiv.instantiate();    
      tree.protoDivRest.addChild(subdiv);
      subdiv.install();
      var clickFun = function (wl) {
         om.log("tree","CLICKKK ",wl);
        wl.selectThisLine("tree");
      }
      if (1 || showProtosAsTrees && tree.enabled) {
        var rs = tree.attachTreeWidget({div:subdiv.__element__,root:o,atFrontier:atFrontier,inWs:inWs,forProto:true});
        //var rs = tree.attachTreeWidget({div:subdiv.__element__,root:o,clickFun:clickFun,textFun:tree.shapeTextFun,forProto:true});
        rs.protoTree = 1;
        //rs.noToggle = 1;
        return rs;
      } 
    }
    
    
    

    tree.clearProtoTree = function (o) {
      tree.protoDivRest.__element__.empty();
    }
    
    
  tree.attachShapeTree= function (root) {
    var clickFun = function (wl) {
      om.log("tree","CLICKKK ",wl);
      wl.selectThisLine("tree");
    }
    // div,roots,clickFun,textFun,multiRoot,forProto)
    tree.obDivRest.empty();
    var tr = tree.attachTreeWidget({div:tree.obDivRest.__element__,root:root,clickFun:clickFun,textFun:tree.shapeTextFun});
    if (om.shapeTree) {
      tr.expandLike(om.shapeTree);
    }
    om.shapeTree = tr;
    tr.isShapeTree = true;

  }
  
  
  tree.excludeFromProtos = {om:1,fileTree:1,jqPrototypes:1,lightbox:1,geom:1,mainPage:1,top:1,trees:1,draw:1};
 
  tree.initShapeTreeWidget = function () {
    om.root.deepSetProp("widgetDiv",undefined);
    tree.attachShapeTree(om.root);
    tree.mainTop.expand();
  }
  // this is for the dual panel file browser
  
  function pathsToTree (fls) {
    var sfls = fls.map(function (fl) {return fl.split("/")});
    var rs = {};
    sfls.forEach(function (sfl) {
      var  cnd = rs;
      var ln = sfl.length;
      for (var i=0;i<ln;i++) {
        var nm = sfl[i];
        var nnd = cnd[nm];
        if (!nnd) {
          if (i === (ln-1)) {
            cnd[nm] = "leaf";
          } else {
            cnd[nm] = nnd = {};
          }
        }
        cnd = nnd;
      }
    });
    return rs;
  }
  
  
  tree.itemTextFun = function (nd) {
    var nm = (typeof tnm === "undefined")?"root":tnm;
    if (nd.__parent__) {
      var nm = nd.__name__;
    } else {
      nm = 'root';
    }
    return nm;
  }
  
   tree.itemClickFun = function (wl) {
       wl.selectThisLine();
    }
    
  tree.selectInTree = function (nd) {
    if (tree.enabled && nd) {
      nd.expandToHere();
      var wd = nd.get("widgetDiv");
      if (wd) wd.selectThisLine("canvas",true);
    }
  }
  
  
  tree.selectPathInTree = function (path) {
    if (tree.enabled && path) {
      var nd = om.evalPath(__pj__,path);
      tree.selectInTree(nd);
    }
  }
    
 // draw.selectCallbacks.push(tree.selectInTree);

   om.attachItemTree= function (el,itemTree) {
    tree.itemTree = tree.attachTreeWidget({div:el,root:itemTree,clickFun:tree.itemClickFun,textFun:tree.itemTextFun,forItems:true});
    tree.itemTree.forItems = true;
  }
  
  
  
  
  tree.openTop = function () {
    om.shapeTree.expand();
  }
  
  
  
  tree.showItem = function (itm,mode) {
    tree.shownItem = itm;
    if (!itm) {
      return;
    }
    tree.obDivRest.empty();
    var notog = 0 && mode==="fullyExpand";
    var tr = tree.attachTreeWidget({div:tree.obDivRest.__element__,root:itm,textFun:tree.shapeTextFun,noToggle:notog});
    tree.mainTop = tr;
    tr.noToggle = notog;
    tr.isShapeTree = 1;
    var atf = itm.atProtoFrontier();
    if (mode==="fullyExpand") {
      tr.fullyExpand(undefined,false,atf);
    } else if (mode==="expand") {
      tr.expand(undefined,false,atf);
    }  else if (mode ==="auto") {
      tr.fullyExpandIfSmall(undefined,false,atf);

    }
    tree.mainTree = tr;
    
  }
  
  tree.showParent = function () {
    var sh = tree.shownItem;
    if (sh) {
      if (sh==om.root) {
        return;
      }
      var pr = sh.__parent__;
      tree.showItem(pr,"auto");
      tree.showProtoChain(pr);

      if (pr === om.root) page.upBut.hide();
    }
  }

  
  
})(prototypeJungle);

