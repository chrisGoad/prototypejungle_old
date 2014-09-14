(function (pj) {

  var om = pj.om;
  var ui = pj.ui;
  var dom = pj.dom;
  var html = pj.html;
  var geom  = pj.geom;
  var svg = pj.svg;
  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract

  var tree =pj.set("tree",om.DNode.mk());
  
  
  svg.Element.__setFieldType("fill","svg.Rgb");
  svg.Element.__setFieldType("stroke","svg.Rgb");
  svg.Element.__setFieldType("backgroundColor","svg.Rgb");
  dom.Style.__setFieldType("fill","svg.Rgb");

  
  om.inspectEverything = 1;
  tree.showFunctions = 0;
  tree.showNonEditable = 1;
  var showProtosAsTrees = 0;
  tree.set("TreeWidget",om.DNode.mk()).namedType();
  tree.enabled = true; // turned off in flatMode up in inspect
  tree.fullyExpandThreshold = 20;
  tree.highlightColor = "rgb(100,140,255)"
  tree.viewableStringMaxLength = 45;
  tree.newTreeWidget = function (o) {
      om.setProperties(this,o,["textProto","rootPos"]);
  }
  // ground level operators
  
  var jqp = pj.jqPrototypes;
  var mpg = pj.mainPage;
  var wline = tree.set("WidgetLine",om.DNode.mk());// holds methods and data for a widgetline; will be .w. of each dom element for a widgetline
  var nonPrim = tree.set("NonPrimLine", html.Element.mk('<div style="font-size:10pt;color:black;width:100%"/>')).namedType();
  // prototype for widget lines
  var mline = nonPrim.set("main",html.Element.mk('<div/>'));
  mline.set("note",html.Element.mk('<span style="margin-right:5px;color:blue;cursor:pointer">?</span>'));
  mline.set("toggle",html.Element.mk('<span style="cursor:pointer;color:black">&#9655;</span>'));
        
  mline.set("theName",html.Element.mk('<span style="padding-right:20px;color:black"/>'));
  om.nonPrim = nonPrim; // for debugging
  tree.wline = wline;
  
  tree.dpySelected = html.Element.mk('<div style="color:black"/>');

 
  tree.WidgetLine.forNode = function () {
    return om.evalXpath(ui.root,this.nodePath);
  }
 
  tree.WidgetLine.forParentNode = function () {
    return om.evalXpath(ui.root,this.parentNodePath);
  }
  
  om.DNode.__getTheNote = function () {
    if (this === ui.root ) {
      var rs = this.__topNote;
    } else if (this.__parent) {
      rs = this.__parent.__getNote(this.__name)
    }
    return rs;
  }
  
  om.LNode.__getTheNote = om.DNode.__getTheNote;
  
  om.DNode.__mkWidgetLine = function (options) { //ownp,clickFun,textFun,forProto,top) {
    if (tree.onlyShowEditable && this.__mfrozen) return;
    var top = options.top;
    var thisHere = this;
    var ww = wline; // for debugging
    var rs = Object.create(tree.WidgetLine);
    var el = nonPrim.instantiate();
    el.set("w",rs);
    if (this.__parent) {
      rs.parentNodePath = om.xpathOf(this.__parent,ui.root);
      rs.forProp = this.__name;
    }
    var m = el.main;

    var isLNode = om.LNode.isPrototypeOf(this);
    if (!isLNode && (this.forProto || this.noToggle)) {
      var tg = m.toggle;
      tg.$hide();
    }
    var pth = om.xpathOf(this,ui.root);
    if (!pth) {
      debugger;
    }
    rs.__treeTop = !!top;
    var noteSpan = m.note;
     
    if (this.__getTheNote()) {
      
      var notePop = function () {rs.popNote()};
      noteSpan.$click(notePop);
      noteSpan.$show();
    } else {
      noteSpan.$hide();
    }
  
    var txt = tree.withTypeName(this,this.__name,top);

    var thisHere = this;
    var tspan = m.toggle;
    if (this.noToggle) {
      tspan.hide();
    } else if (this.__leaf) {
      tspan.$html(" ");
    }  else {
      tspan.$click(function (){rs.toggle();});
    }
    var nspan = m.theName;
    nspan.$html(txt);
    var hp = this.__hasTreeProto();
    var clr = "black";
    nspan.style.color = clr;
    m.addEventListener("mouseover",function (e) {
        m.$css({"background-color":"rgba(0,100,255,0.2)"});
        debugger;
        if (om.LNode.isPrototypeOf(thisHere)) {
          svg.highlightNodes(thisHere);
        } else {
          var inheritors = om.inheritors(ui.root,thisHere,function (x) {
            return x.__get("__element");
          });
          svg.highlightNodes(inheritors);
        }
    });
    m.addEventListener("mouseout",function (e) {
        m.$css({"background-color":"white"});
        svg.unhighlight();
    });
     

    nspan.$click(function () {
      rs.selectThisLine("tree");
    });
    if (this.forProto) {
      this.hasWidgetLine = true;
    }
    rs.nodePath = pth;
    return rs;
  }
  
    om.LNode.__mkWidgetLine = om.DNode.__mkWidgetLine;

  
  // operations on the widget tree, as opposed to the dom tree
  tree.WidgetLine.treeChild = function (id) {
    var fc = this.__parent.forChildren;
    if (fc) {
      var elc = fc[id];
      if (elc) {
        return elc.w;
      }
    }
    return undefined;
  }
  
  tree.WidgetLine.treeParent = function() {
    var pr = this.__parent.__parent;
    if (pr) {
      
      var pel =  pr.__parent;
      if (pel) {
        return pel.w;
      }
    }
    return undefined;
  }
  tree.WidgetLine.treePath = function () {
    var rs = [];
    var el = this.__parent;
    while (el && !(el.w.__treeTop)) {
      rs.push(el.__name);
      el = el.__parent.__parent;
    }
    return rs.reverse();
  }
  tree.WidgetLine.addTreeChild = function (nm,ch) {
    var el = this.__parent;
    var fc = el.forChildren;
    if (!fc) {
      fc = html.Element.mk('<div  style="margin-left:20px">');
      this.set("forChildren",ch);
    }
    fc.set(nm,ch.__parent);
  }
 
  
  tree.WidgetLine.treeTop = function () {
    if (this.__treeTop) return this;
    var pr = this.treeParent(); // the forChildren node intervenes in the ancestry chain
    return pr.treeTop();
  }
  
  tree.WidgetLine.treeChildren = function () {
    if (this.__prim) return [];
    var el = this.__parent;
    var fch = el.forChildren;
    var rs = [];
    if (fch) {
      var prps = Object.getOwnPropertyNames(fch);
      prps.forEach(function (p) {
        if (om.internal(p)) return;
        var v = fch[p];
        if (v.__parent !== fch) return;
        if (html.Element.isPrototypeOf(v)) {
         rs.push(v.w);
        }
      });
      return rs;
    }
    return [];
  }
  
  tree.WidgetLine.childrenNames = function () {
    var rs = [];
    var el = this.__parent;
    var fch = el.forChildren;
    var prps = Object.getOwnPropertyNames(fch);
    prps.forEach(function (p) {
      if (om.internal(p)) return;
      var v = fch[p];
      if (v.__parent !== fch) return;
      if (html.Element.isPrototypeOf(v)) {
        rs.push(p);
      }
    });
    return rs;
  }
  // this finds widget lines whose nodes inherit from this fellow's node
 // method: Find the lines athe same path
  
  tree.WidgetLine.upOrDownChain = function (returnNodes,up) {
    var pth = this.treePath();
    var rs = [];
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
    for (var i=idx;i<ln;i++) {
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
          var nd = om.evalPath(topnode,pth);
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
 
  // selectChild is at the Element level. this is at the tree level
  tree.WidgetLine.treeSelect = function (nm) {
    if (this.__prim) return undefined;
    var fc = this.__parent.forChildren;
    if (fc) {
      var chel = fc[nm];
      if (chel) {
        return chel.w;
      }
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
    return tp.__selectedLine;
  }
  
  
  tree.WidgetLine.highlightedPart = function () {

    if (this.__prim) {
      return this.__parent.title;
    } else if (this.__ref) {
      return this;
    } else {
      return this.__parent.main;// this.cssSelect("#main>#theName");
    }
  }
  tree.WidgetLine.unselectThisLine = function () {
    this.__selected = 0;
    var el = this.highlightedPart();
    el.$css("background-color","white");
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
    
    if (this.__prim) {
      
      var prnd = this.forParentNode();
      var selnd = prnd;
      var prp = this.forProp;
    } else {
      var nd = this.forNode();
      selnd = nd;
      var __isSelectable = nd.selectable; // a composite that will be box-surrounded
    }
    
    tree.selectedLine = this;
    if (this.__selected && !forceRedisplay) return;
    tree.selectedNode = selnd;
    if (prnd) return;

    var tp = this.treeTop();
    var isProto = tp.protoTree; // is this the prototype panel?
    var isShapeTree = !(isProto);// the shape panel
    var drawIt =  (src === "tree");
    if (isShapeTree) tree.clearProtoTree();
    var ds = tp.dpySelected;
 
    if (isProto) {
      var p = om.xpathOf(selnd,ui.root)
      var ps = p.join(".");
    }
    var sl = tp.__selectedLine;
    var cntr = $(tp.__parent.__container);
    //var cntr = tp.__parent.__parent.__parent;
    //var cntr = tp.__element.parent().parent();
    this.__selected = 1;
    if (sl) sl.unselectThisLine();
    var el = this.highlightedPart();
    el.$css("background-color",tree.highlightColor );
    tp.__selectedLine = this;
      
    // take  care of scrolling
    var cht = cntr.height();
    var coffy = cntr.offset().top;
    // now scroll the fellow into view if needed
    var ely = el.$offset().top;
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
      if (this.__ref) {
        tree.showRef(this.refValue);
      } else {
        tree.showProtoChain(nd);
      }
    }
    if (drawIt) {
      selnd.__select('tree');
      om.originalSelectionPath = undefined;
      tree.shownItem = selnd;

      pj.ui.enableTreeClimbButtons();
    }    
    om.log("tree","SELECTION DONE");
  }
  
  tree.WidgetLine.ancestorIsSelected = function () {
    if (this.__selected) return 1;
    var pr = this.treeParent();
    if (!pr) return 0;
    return pr.ancestorIsSelected();
  }


  function showFunction(f,pth)  { 
    return;
  }
  
  tree.hiddenProperties = {__record:1,__isType:1,__record_:1,__external:1,__selected:1,__selectedPart__:1,__doNotBind:1,
                          __notes__:1,computed:1,__descendantSelected:1,__fieldStatus:1,__source:1,__about:1,
                          __overrides:1,__mfrozen:1,__current:1,transform:1,__sourcePath:1,__sourceRepo:1,
                          __beenModified:1,__autonamed:1,__origin:1,__from__:1,__objectsModified:1,__topNote:1,
                          __saveCount:1,__saveCountForNote:1,__setCount:1,__setIndex:1,__doNotUpdate:1,__components:1,
                          __xdata:1,__listeners:1,transformm:1,noData:1,surrounders:1,
                          __outsideData:1,attributes:1,__dataSource:1,__requires:1};
  
  
  
  tree.hiddenProperty = function (p) {
    if (typeof p !== "string") return 0;
    if (tree.hiddenProperties[p]) return 1;
    return (om.beginsWith(p,"__fieldType")||om.beginsWith(p,"__inputFunction__")||om.beginsWith(p,"__status")||
            om.beginsWith(p,"__requiresUpdate")|| om.beginsWith(p,"__note"));
  }
  
  om.DNode.__fieldIsEditable = function (k) {
    if (om.internal(k) || tree.hiddenProperty(k)) return false; // for now;
    var ch = this[k];
    var tp = typeof ch;
    if (k==="data") return (!this.__outsideData) && (tp === "string");
    if (!this.__inWs()) {
      return false;
    }
    if (tp === "function") return false;
    return !this.__fieldIsFrozen(k)
  }
  
  om.LNode.__fieldIsEditable = function (k) {
    var ch = this[k];
    var tp = typeof ch;
    if (tp === "function") return false;
    return true;
  }
  
  
  tree.hasEditableField = function (nd,overriden) { // hereditary
    for (var k in nd) {
      if (nd.__fieldIsEditable(k,overriden)) return true;
    
      var ch = nd[k];
      if (om.isNode(ch) && tree.hasEditableField(ch,chovr)) return true;
    }
    return false;
  }
  
  
  tree.WidgetLine.popNote= function () {
    var prp = this.forProp;
    if (this.__prim) {
      var prnd = this.forParentNode();
      if (prnd) {
        var nt = prnd.__getNote(prp);
      }
    } else {
      var nd = this.forNode();
      if (nd === ui.root) {
        nt = nd.__topNote;
      } else {
        nt = nd.__parent.__getNote(prp);
      }
    }
    if (nt) tree.viewNote(prp,nt);

  }
 
  var dontShowFunctionsFor = [pj.geom];
    
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
  
  /* the correspondence between widgetLines and nodes is represented on the widgetLine side by the xpaths of the associated
   node: nodePath of non-prim widget lines and parentNodePath for prims. Nodes that have a corresponding widget line have
   the hasWidgetLine property. To look this line up, follow the node's xpath. */
  
  om.DNode.__widgetLineOf = function () {
    if (!this.hasWidgetLine) {
      return undefined;
    }
    var pth = om.xpathOf(this,ui.root);
    var wl = tree.mainTop.treeSelectPath(pth);
    return wl;
  }
  
  om.LNode.__fieldIsThidden = function (k) { return false;}
  
  // should  property k of this be shown? Returns 0, "prim" "function" "ref" or "node"
  om.DNode.__showInTreeP = function (k) {
    if (this.__coreProperty(k)) return 0; // a property defined down in core modules of the proto chain.
    if (tree.hiddenProperty(k)) return 0;
    if (k === "data") {
      var dataValue = dataString(this.data);
      return dataValue?"prim":false;
    }
    var tHidden = this.__fieldIsThidden(k); // hidden from this browser
    if (tHidden) return 0;
    var vl = this[k];
    var tp = typeof vl;
    var isFun = tp === "function";
  
    if (isFun) {
      if (!tree.showFunctions) return 0;
      if (dontShowFunctionsFor.indexOf(this.parent()) >= 0) return false;// excludes eg geom functions
      return "function";
      
    }
    var editable = this.__fieldIsEditable(k);
     if (tree.onlyShowEditable && !editable ) {
        return 0;
    }
    var isnd = om.isNode(vl);
    if (isnd && !om.treeProperty(this,k)) {
      if (!this.hasOwnProperty(k)) return 0; // inherited references are not shown
      return "ref";
    }
    var isob = tp === "object";
    if (isob && !isnd) return 0;// Outside the tree
    return isnd?"node":"prim";
  }
 
  om.LNode.__showInTreeP = om.DNode.__showInTreeP;
  tree.inputFont = "8pt arial";

  tree.computeStringWd = function (s) {
     var wm = dom.measureText(s,tree.inputFont);
     return Math.max(20,wm+20)
  }
   
  om.DNode.__mkPrimWidgetLine = function (options) { // for constants (strings, nums etc).  nd is the node whose property this line displays
    var nd = this;
    var clickFun = options.clickFun;
    var isProto = options.isProto;
    var overriden = options.overridden;
    var k = options.property;
    var rs = Object.create(tree.WidgetLine);

    var atFrontier = rs.__atFrontier = nd.__atProtoFrontier(); // the next fellow in the prototype chain is outside the ws
    var ownp = nd.hasOwnProperty(k);
    var inherited = !ownp;
    var canBeInherited = om.inheritableAtomicProperty(nd,k);
    var prnd = nd;
    var frozen = nd.__fieldIsFrozen(k);
    var el = html.Element.mk('<div/>');
    el.set('w',rs);
    el.$click(function () {
      rs.selectThisLine("tree");
    });
    rs.__prim = 1;
    rs.parentNodePath = om.xpathOf(nd,ui.root);
    rs.forProp = k;
    var isFun = typeof v === "function";
    var txt = k;
    var notePop;
    if (nd.__getNote(k)) {
      var qm =  html.Element.mk('<span style="color:blue;margin-right:5px;cursor:pointer;font-weight:bold">?</span>');
      el.set("qm",qm);
      var notePop = function () {rs.popNote()};
      qm.$click(notePop);
      var sp =  html.Element.mk('<span style="cursor:pointer;color:cl;padding-right:5px">'+txt+'</span>');
      sp.$click(notePop);
    } else {
      var sp =  html.Element.mk('<span style="padding-right:5px">'+txt+'</span>');

    }
    el.set("title",sp);
    var ftp = nd.__getFieldType(k);
    // assumption: color and functino fields stay that way
    var vl = nd[k];
    var ovrEl = html.Element.mk('<span/>');
    ovrEl.$html(' overriden ');
    el.set('ovr',ovrEl);
    rs.ovr = ovrEl;
   
    var inheritedEl = html.Element.mk('<span/>');
    inheritedEl.$html(' inherited ');
    el.set('inherited',inheritedEl);
    rs.inherited = inheritedEl;
   
    var editable = this.__fieldIsEditable(k);
    if (!editable) {
      var inp =  html.Element.mk('<span/>');
      el.set("valueField",inp);
      rs.kind = "value";
      return rs;
    }
    
    
    
    var inheritEl = html.Element.mk('<span style="cursor:pointer;text-decoration:underline"> inherit </span>');
    el.set('inherit',inheritEl);
    rs.inherit = inheritEl;
    
  
      //  the input field, and its handler
    function onInput(chv) {
      if (typeof chv === "string") {
        page.alert(chv);
      } else if (chv) {
        ui.setSaved(false);
        var rsinh = rs.upChain();
        rsinh.forEach(function (wlc) {
          if (!wlc.colorPicker) { //handled in __newColor__
            wlc.updateValue({});
          }
        });
        if (tree.autoUpdate && nd.__getRequiresUpdate(k)) {
          ui.root.outerUpdate("tree");
          ui.root.draw();
          tree.adjust();
        } else {
          // special case, obviously
          if (k === "backgroundColor") {
            rs.inherited.$hide();
            rs.inherit.$hide()
          } else{
            if (rs.inherited) rs.inherited.$hide(); // this field is no longer inherited, if it was before
            if (rs.inherit) rs.inherit.$show();
          }
          var dwc = rs.downChain();
          dwc.forEach(function (cm) {
            //cm.inh.$hide();
            cm.ovr.$show();
          });
          var upc = rs.upChain();
          upc.forEach(function (cm) {
            cm.updateValue({});
          });

        }
        // redraw the whole thing, since effects may ripple up from styles, proto chains

        svg.draw();

      }
    }
   
   
    function doInherit () {
      var prt = Object.getPrototypeOf(nd);
      delete nd[k];
      rs.updateValue({});
      var dwc = rs.downChain();
      dwc.forEach(function (cm) {
        cm.updateValue({});
      });
      svg.draw();
    }
    inheritEl.$click(doInherit);
 
  
      // put in a color picker
    if (ftp == "svg.Rgb") {
      var cp = html.Element.mk('<input type="input" value="CP"/>');
      var cl = nd[k];
      cl = cl?cl:"black";
      cp.__color__ = cl; // perhaps the inherited value
      cp.__newColor__ = function (color) {
        var chv = dom.processInput(inp,nd,k,inherited&&(!atFrontier),tree.computeStringWd,color);
        onInput(chv);
        var cls = color.toRgbString();
        var inh = rs.upChain();
        inh.forEach(function (wlc) {
          var icp = wlc.colorPicker;
          if (icp) {
            $(icp.__element).spectrum("set",cls);
          }
        });
      }
      el.set("colorPicker",cp);
      rs.kind = "colorPicker";
      return rs;
    }
      // the remaining case
      //put in a text input field
    var inpwd = 100;// this gets replaced anyway when the value is measured
    var inp = html.Element.mk('<input type="input" value="" style="font-size:8pt;font:tree.inputFont;background-color:#e7e7ee;width:'+
                             inpwd+'px;margin-left:10pt"/>');   
    var blurH = function () {
      var chv = dom.processInput(inp,nd,k,inherited,tree.computeStringWd);
      onInput(chv);
      return;
    }
    inp.addEventListener("blur",blurH);
    el.set("inputField",inp);
    rs.kind = "input";
    inp.addEventListener("enter",blurH);
    return rs;
  }
  
  om.LNode.__mkPrimWidgetLine = om.DNode.__mkPrimWidgetLine;
  
  // it is convenient to erase "inherited" when the user starts to type into the field
   
  tree.stringLengthLimit = 60;
  // for prim widget lines only
  tree.WidgetLine.updateValue = function (options) {
    var el = this.__parent;
    var ind = options.node;
    var nd=ind?ind:this.forParentNode();
    var atFrontier = this.__atFrontier;
    var k = this.forProp;
    if (k === "data") {
      var ds = dataString(nd.data);
    }
    var vl = nd[k];

    var ovr = this.fieldIsOverridden(k);
    var ownp = nd.hasOwnProperty(k);
    var canBeInherited = om.inheritableAtomicProperty(nd,k);
    var inherited =  !ownp;
    var isFun = typeof vl === "function";
    var ftp = nd.__getFieldType(k);
    // assumption: once a field is a color or function this remains true
    var editable = this.__fieldIsEditable(k);
    var prt = Object.getPrototypeOf(nd);
    if (isFun) return; // assumed stable
    var inheritEl = el.inherit;
    var inheritedEl = el.inherited;
    var ovrEl = el.ovr;
    inheritedEl.setVisibility(inherited);
    ovrEl.setVisibility(ovr);
    if (inheritEl) inheritEl.setVisibility(canBeInherited);
    var proto =  Object.getPrototypeOf(nd);
    var knd = this.kind;
    var vts = ds?ds:om.applyInputF(nd,k,vl);
    if (typeof vts === "number") {
      vts = om.nDigits(vts,4);
    }
    if (knd === "input") {
      var inf = el.inputField;
      inf.$prop("value",vts);// I don't understand why this is needed, but is
      inf.$attr("value",vts);
      var cwd = tree.computeStringWd(vts);
      inf.$css("width",cwd+"px");
    } else if (knd == "colorPicker") {
      var cp = el.colorPicker;
      cp.__color__ = vl; // perhaps the inherited value
      var jel = $(cp.__element);
      if (jel) jel.spectrum("set",vl);

    } else {
      if (typeof vts === "string") {
        if (vts.length > tree.stringLengthLimit) {
          vts = vts.substr(0,tree.stringLengthLimit)+"...";
        }
      }
      el.valueField.$html(vts);
    }
  }

  
  tree.mkRangeWidgetLine = function (nd,lb,ub,increment) {
    // usually increment = (ub+1-lb) but not always for the last range
    var cl = "black";
    var rs = wline.instantiate();
    rs.__range = 1;
    var pth = om.xpathOf(nd,ui.root);
    rs.nodePath = pth;
    rs.lowerBound = lb;
    rs.upperBound = ub;
    rs.increment = increment;
    var txt = "["+lb+"..."+ub+"]";
    var m = rs.main;
    m.note.$hide();
    var nspan = m.theName;
    nspan.html = txt;
    rs.id = txt;
    var tspan = m.toggle;
    var cl = function () {
      rs.toggle();
    };
    tspan.$click(cl);
   
    return rs;
  }
  
    
  tree.mkRangeWidgetLine = function (nd,lb,ub,increment) {
    // usually increment = (ub+1-lb) but not always for the last range
    var cl = "black";
    var rs = Object.create(tree.WidgetLine);
    var el = nonPrim.instantiate();
    el.set("w",rs);
    rs.__range = 1;
    var pth = om.xpathOf(nd,ui.root);
    rs.nodePath = pth;
    rs.lowerBound = lb;
    rs.upperBound = ub;
    rs.increment = increment;
    var txt = "["+lb+"..."+ub+"]";
    var m = el.main;
    m.note.$hide();
    var nspan = m.theName;
    nspan.$html(txt);
    rs.id = txt;
    var tspan = m.toggle;
    var cl = function () {
      rs.toggle();
    };
    tspan.$click(cl);
   
    return rs;
  }
  
  tree.mkRefWidgetLine = function (top,nd,k,v) { // for constants (strings, nums etc).  nd is the node whose property this line displays
    var rf = om.refPath(v,top);
    if (!rf) return undefined;
    var cl = "black";
    var rs = tree.WidgetLine.mk({tag:"div",style:{color:cl}});
    var sp =  html.Element.mk('<span>'+(k + " REF ")+'</span>');
    rs.set("ttl",sp);
    rs.$click(function () {
      rs.selectThisLine("tree");
    });
    rs.__ref =1;
    rs.refValue = v;
    return rs;
  }
  

  tree.WidgetLine.visible = function () {
    if (this.__treeTop) return true;
    var pr = this.treeParent();
    return pr.visible() && pr.expanded;
  }
  
  // the workspace tree might have been recomputed or otherwise modified, breaking the two-way links between widgetlines
  // and nodes. This fixes them up, removing subtrees where there are mismatches. It also installs new __values into primwidgetlines.
  
  // returns true if this line does not have a match in the workspace, that is, if the parent needs reexpansion
  
  // first parent which is not a range; that is, parent if ranges are passed through

  tree.WidgetLine.nonRangeParent = function () {
    var rs = this.treeParent();
    if ( !rs) return undefined;
    if (rs.__range) {
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
      if (ch.__range) {
        ch.childrenPastRanges(rs);
      } else {
        rs.push(ch);
      }
    });                 
  }
  
//end extract

})(prototypeJungle);

