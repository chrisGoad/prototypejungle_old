// This code could use reorg/simplification, for clarity
(function (__pj__) {

  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom  = __pj__.geom;
  var svg = __pj__.svg;
  var _draw = __pj__._draw;
  var page = __pj__.page;
  var tree =__pj__.set("tree",om.DNode.mk());
  om.inspectEverything = 1;
  tree.showFunctions = 0;
  tree.showNonEditable = 1;
  var showProtosAsTrees = 0;
  tree._installType("TreeWidget");
  tree.enabled = true; // turned off in flatMode up in inspect
  tree.fullyExpandThreshold = 20;
  tree.highlightColor = "rgb(100,140,255)"
  tree.viewableStringMaxLength = 45;
  tree.newTreeWidget = function (o) {
    this._setProperties(o,["textProto","rootPos"]);
  }
  // ground level operators
  
  var jqp = __pj__.jqPrototypes;
  var mpg = __pj__.mainPage;
  var wline = tree.set("WidgetLine",om.DNode.mk());// holds methods and data for a widgetline; will be .w. of each dom element for a widgetline
  
  var nonPrim = tree.set("NonPrimLine", dom.Element.mk('<div style="font-size:10pt;color:black;width:100%"/>'))._namedType();
  //tree.set("valueProto",dom.El({tag:"span",style:{"padding-left":"20px"}}));//,style:{"font-weight":"bold"}});
  //tree.set("inheritProto",dom.El({tag:"span",html:"inherited"}));
         

  // prototype for widget lines
  //var wline = tree.WidgetLine.mk({tag:"div",style:{"font-size":"10pt",color:"black",width:"100%"}});
  //jqp.set("widgetLine", wline);
  var mline = nonPrim.set("main",dom.Element.mk('<div/>'));
  //dom.El({tag:"div",style:{}}));
  mline.set("note",dom.Element.mk('<span style="margin-right:5px;color:blue;cursor:pointer">?</span>'));
  mline.set("toggle",dom.Element.mk('<span style="cursor:pointer;color:black">&#9655;</span>'));
        
  mline.set("theName",dom.Element.mk('<span style="padding-right:20px;color:black"/>'));
  om.nonPrim = nonPrim; // for debugging
  tree.wline = wline;
  
  tree.dpySelected = dom.Element.mk('<div style="color:black"/>');

  //tree.protoBut = jqp.set("protoButton", tree.WidgetLine.mk({tag:"span",html:"proto",style={color:"black",width:"100px"}}));

  
  
  om.DNode._hasNodeChild = function () { // determines whether, in the item browser, this is a leaf
    var rs = false;
    this._iterTreeItems(function (ch) {
      rs = true;
    },true);
    return rs;
  }
  tree.WidgetLine.forNode = function () {
    return om.root._evalPath(this.nodePath);
  }
 
  tree.WidgetLine.forParentNode = function () {
    return om.root._evalPath(this.parentNodePath);
  }
  om.DNode._getTheNote = function () {
    if (this === om.root ) {
      var rs = this._topNote;
    } else if (this._parent) {
      rs = this._parent._getNote(this._name)
    }
    return rs;
  }
  
  om.LNode._getTheNote = om.DNode._getTheNote;
  
  om.DNode._mkWidgetLine = function (options) { //ownp,clickFun,textFun,forProto,top) {
    if (tree.onlyShowEditable && this._mfrozen) return;
    //this._setProperties(options,["clickFun","forProto","noToggle","top","forLnode"]);
    var top = options.top;
    
    var ww = wline; // for debugging
    var rs = Object.create(tree.WidgetLine);
    var el = nonPrim.instantiate();
    el.set("w",rs);
    if (this._parent) {
      rs.parentNodePath = this._parent._pathOf(om.root);
      rs.forProp = this._name;
    }
    var m = el.main;

    var isLNode = om.LNode.isPrototypeOf(this);
    if (!isLNode && (this.forProto || this.noToggle)) {
      var tg = m.toggle;
      tg.$._hide();
    }
    var pth = this._pathOf(om.root);
    rs._treeTop = !!top;
    var noteSpan = m.note;
     
    if (this._getTheNote()) {
      
      var notePop = function () {rs.popNote()};
      noteSpan.$.click(notePop);
      noteSpan.$._show();
    } else {
      noteSpan.$._hide();
    }
  
    var txt = tree.withTypeName(this,this._name,top);

    var thisHere = this;
    var tspan = m.toggle;
    if (this.noToggle) {
      tspan._hide();
    } else if (this._leaf) {
      tspan.$.html(" ");
    }  else {
      tspan.$.click(function (){rs.toggle();});
    }
    var nspan = m.theName;
    nspan.$.html(txt);
    var hp = this._hasTreeProto();
    var clr = "black";
    nspan.style.color = clr;
    nspan.$.click(function () {
      rs.selectThisLine("tree");
    });
    if (this.forProto) {
      this.hasWidgetLine = true;
    } else {
   //   this._protoLine =rs;
    }
    rs.nodePath = pth;
    return rs;
  }
  
    om.LNode._mkWidgetLine = om.DNode._mkWidgetLine;

  
  // operations on the widget tree, as opposed to the dom tree
  tree.WidgetLine.treeChild = function (id) {
    var fc = this._parent.forChildren;
    if (fc) {
      var elc = fc[id];
      if (elc) {
        return elc.w;
      }
    }
    return undefined;
  }
  
  tree.WidgetLine.treeParent = function() {
    var pr = this._parent._parent;
    if (pr) {
      
      var pel =  pr._parent;
      if (pel) {
        return pel.w;
      }
    }
    return undefined;
  }
  tree.WidgetLine.treePath = function () {
    var rs = [];
    var el = this._parent;
    while (el && !(el.w._treeTop)) {
      rs.push(el._name);
      el = el._parent._parent;
    }
    return rs.reverse();
  }
  tree.WidgetLine.addTreeChild = function (nm,ch) {
    var el = this._parent;
    var fc = el.forChildren;
    if (!fc) {
      fc = dom.Element.mk('<div  style="margin-left:20px">');
      this.set("forChildren",ch);
    }
    fc.set(nm,ch._parent);
  }
 
  
  tree.WidgetLine.treeTop = function () {
    if (this._treeTop) return this;
    var pr = this.treeParent(); // the forChildren node intervenes in the ancestry chain
    return pr.treeTop();
  }
  
  tree.WidgetLine.treeChildren = function () {
    if (this._prim) return [];
    var el = this._parent;
    var fch = el.forChildren;
    var rs = [];
    if (fch) {
      var prps = Object.getOwnPropertyNames(fch);
      prps.forEach(function (p) {
        if (om.internal(p)) return;
        var v = fch[p];
        if (v._parent !== fch) return;
        if (dom.Element.isPrototypeOf(v)) {
         rs.push(v.w);
        }
      });
      return rs;
    }
    return [];
  }
  
  tree.WidgetLine.childrenNames = function () {
    var rs = [];
    var el = this._parent;
    var fch = el.forChildren;
    var prps = Object.getOwnPropertyNames(fch);
    prps.forEach(function (p) {
      if (om.internal(p)) return;
      var v = fch[p];
      if (v._parent !== fch) return;
      if (dom.Element.isPrototypeOf(v)) {
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
          var nd = topnode._evalPath(pth);
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
    if (this._prim) return undefined;
    var fc = this._parent.forChildren;
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
    return tp._selectedLine;
  }
  
  
  tree.WidgetLine.highlightedPart = function () {

    if (this._prim) {
      return this._parent.title;
    } else if (this._ref) {
      return this;
    } else {
      return this._parent.main;// this.cssSelect("#main>#theName");
    }
  }
  tree.WidgetLine.unselectThisLine = function () {
    this._selected = 0;
    var el = this.highlightedPart();
    el.$.css("background-color","white");
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
    if (this._prim) {
      
      var prnd = this.forParentNode();
      var selnd = prnd;
      var prp = this.forProp;
    } else {
      var nd = this.forNode();
      selnd = nd;
      var _isSelectable = nd.selectable; // a composite that will be box-surrounded
    }
    tree.selectedLine = this;
    if (this._selected && !forceRedisplay) return;
    tree.selectedNode = selnd;
    if (prnd) return;

    var tp = this.treeTop();
    var isProto = tp.protoTree; // is this the prototype panel?
    var isShapeTree = !(isProto);// the shape panel
    var drawIt =  (src === "tree");
    if (isShapeTree) tree.clearProtoTree();
    var ds = tp.dpySelected;
 
    if (isProto) {
      var p = om._pathOf(selnd,om.root)
      var ps = p.join(".");
    }
    var sl = tp._selectedLine;
    var cntr = $(tp._parent._container);
    //var cntr = tp._parent._parent._parent;
    //var cntr = tp._element.parent().parent();
    this._selected = 1;
    if (sl) sl.unselectThisLine();
    var el = this.highlightedPart();
    el.$.css("background-color",tree.highlightColor );
    tp._selectedLine = this;
      
    // take  care of scrolling
    var cht = cntr.height();
    var coffy = cntr.offset().top;
    //om.log("tree","SELECTION STAGE 0 offset ",el.$.offset());
    // now scroll the fellow into view if needed
    var ely = el.$.offset().top;
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
    if (isShapeTree) { // _show the prototype in its panel
      if (this._ref) {
        tree.showRef(this.refValue);
      } else {
        tree.showProtoChain(nd);
      }
    }
    if (drawIt) {
      selnd._select('tree');
      om.originalSelectionPath = undefined;
      tree.shownItem = selnd;

      __pj__.page.enableTreeClimbButtons();
    }    
    om.log("tree","SELECTION DONE");
  }
  
  tree.WidgetLine.ancestorIsSelected = function () {
    if (this._selected) return 1;
    var pr = this.treeParent();
    if (!pr) return 0;
    return pr.ancestorIsSelected();
  }


  function showFunction(f,pth)  { 
    return;
  }
  
  tree.hiddenProperties = {_record:1,_isType:1,__record_:1,_external:1,_selected:1,__selectedPart__:1,_doNotBind:1,
                          __notes__:1,_computed:1,_descendantSelected:1,_fieldStatus:1,_source:1,_about:1,
                          _overrides:1,_mfrozen:1,_current:1,
                          _beenModified:1,_autonamed:1,_origin:1,__from__:1,_objectsModified:1,_topNote:1,
                          _saveCount:1,_saveCountForNote:1,_setCount:1,_setIndex:1,_doNotUpdate:1,_components:1,
                          dataSource:1,_currentXdata:1,_listeners:1,transform:1,noData:1,surrounders:1,
                          _outsideData:1,attributes:1};
  
  
  
  tree.hiddenProperty = function (p) {
    if (typeof p !== "string") return 0;
    if (tree.hiddenProperties[p]) return 1;
    return (om.beginsWith(p,"_fieldType")||om.beginsWith(p,"_inputFunction__")||om.beginsWith(p,"_status")||
            om.beginsWith(p,"_requiresUpdate")|| om.beginsWith(p,"_note"));
  }
  
  om.DNode._fieldIsEditable = function (k) {
    if (om.internal(k) || tree.hiddenProperty(k)) return false; // for now;
    var ch = this[k];
    var tp = typeof ch;
    if (k==="data") return (!this._outsideData) && (tp === "string");
    if (!this._inWs()) {
      return false;
    }
    if (tp === "function") return false;
    return !this._fieldIsFrozen(k)
  }
  
  om.LNode._fieldIsEditable = function (k) {
    var ch = this[k];
    var tp = typeof ch;
    if (tp === "function") return false;
    return true;
  }
  
  
  tree.hasEditableField = function (nd,overriden) { // hereditary
    for (var k in nd) {
      if (nd._fieldIsEditable(k,overriden)) return true;
    
      var ch = nd[k];
      if (om.isNode(ch) && tree.hasEditableField(ch,chovr)) return true;
    }
    return false;
  }
  
  
  tree.WidgetLine.popNote= function () { 
    var nd = this.forNode();
    if (nd === om.root) {
      nt = nd._topNote;
    } else {
      var prnd = this.forParentNode();
      if (prnd) {
        var prp = this.forProp;
        var nt = prnd._getNote(prp);
      }
    }
    if (nt) tree.viewNote(prp,nt);

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
  
  om.DNode._widgetLineOf = function () {
    if (!this.hasWidgetLine) {
      return undefined;
    }
    var pth = this._pathOf(om.root);
    var wl = tree.mainTop.treeSelectPath(pth);
    return wl;
  }
  
  om.LNode._fieldIsThidden = function (k) { return false;}
  
  // should  property k of this be shown? Returns 0, "prim" "function" "ref" or "node"
  om.DNode._showInTreeP = function (k) {
    if (this._coreProperty(k)) return 0; // a property defined down in core modules of the proto chain.
    if (tree.hiddenProperty(k)) return 0;
    if (k === "data") {
      var dataValue = dataString(this.data);
      return dataValue?"prim":false;
    }
    var tHidden = this._fieldIsThidden(k); // hidden from this browser
    if (tHidden) return 0;
    var vl = this[k];
    var tp = typeof vl;
    var isFun = tp === "function";
  
    if (isFun) {
      if (!tree.showFunctions) return 0;
      if (dontShowFunctionsFor.indexOf(this.parent()) >= 0) return false;// excludes eg geom functions
      return "function";
      
    }
    var editable = this._fieldIsEditable(k);
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
 
  om.LNode._showInTreeP = om.DNode._showInTreeP;
  tree.inputFont = "8pt arial";

  tree.computeStringWd = function (s) {
     var wm = dom.measureText(s,tree.inputFont);
     return Math.max(50,wm+20)
  }
   
  om.DNode._mkPrimWidgetLine = function (options) { // for constants (strings, nums etc).  nd is the node whose property this line displays
    var nd = this;
    var clickFun = options.clickFun;
    var isProto = options.isProto;
    var overriden = options.overridden;
    var _atFrontier = options._atFrontier;
    var k = options.property;
    var ownp = nd.hasOwnProperty(k);
    var prnd = nd;
    var frozen = nd._fieldIsFrozen(k);
    var rs = Object.create(tree.WidgetLine);
    var el = dom.Element.mk('<div/>');
    el.set('w',rs);
    //rs.main.toggle.$._hide();
    rs._atFrontier = _atFrontier;
    el.$.click(function () {
      rs.selectThisLine("tree");
    });
    rs._prim = 1;
    rs.parentNodePath = nd._pathOf(om.root);
    rs.forProp = k;
    var isFun = typeof v === "function";
    var txt = k;
    var notePop;
    if (nd._getNote(k)) {
      var qm =  dom.Element.mk('<span style="color:blue;margin-right:5px;cursor:pointer;font-weight:bold">?</span>');
      el.set("qm",qm);
      var notePop = function () {rs.popNote()};
      qm.$.click(notePop);
      var sp =  dom.Element.mk('<span style="cursor:pointer;color:cl;padding-right:5px">'+txt+'</span>');
      sp.$.click(notePop);
    } else {
      var sp =  dom.Element.mk('<span style="padding-right:5px">'+txt+'</span>');

    }
    el.set("title",sp);
    var ftp = nd._getFieldType(k);
    // assumption: color and functino fields stay that way
    var vl = nd[k];
    var isFun = typeof vl === "function";
    if (isFun) {  
      var funBut =  jqp.funbutton.instantiate();
      funBut.html = ownp?" Function ":" Inherited Function";
      rs.set("funb",funBut);
      var pth = om.pathToString(nd._pathOf(__pj__).concat(k),".");
      funBut.click = function () {showFunction(v,pth)};
      return rs;
    } 
    if ((!ownp) && (!_atFrontier)) { // all _properties at the frontier don't count as overriden; that's the last place they can be edited
      var inherited = 1;
    }
    //var ovrEl = dom.Element.mk('<span> overridden </span'); // the dom parser ignores the spaces, for some reason
    var ovrEl = dom.Element.mk('<span/>');
    ovrEl.$.html(' overriden ');
    ovrEl.$._hide();
    el.set('ovr',ovrEl);
    rs.ovr = ovrEl;
    var inhEl = dom.Element.mk('<span/>');
    inhEl.$.html(' inherited ');

    inhEl.$._hide();
    el.set('inh',inhEl);
    rs.inh = inhEl;
    var editable = this._fieldIsEditable(k);
    if (!editable) {
      var inp =  dom.Element.mk('<span/>');
      el.set("valueField",inp);
      rs.kind = "value";
      return rs;
    } 
    var reinhEl = dom.Element.mk('<span style="cursor:pointer;text-decoration:underline"> reinherit </span>');
    reinhEl.$._hide();
    el.set('reinEl',reinhEl);
    rs.reinh = reinhEl;
      //  the input field, and its handler
    function onInput(chv) {
      if (typeof chv === "string") {
        page.alert(chv);
      } else if (chv) {
        page.setSaved(false);
        if (tree.autoUpdate && nd._getRequiresUpdate(k)) {
          om.performUpdate("tree");
          tree.adjust();
        } else {
          rs.inh.$._hide(); // this field is no longer inherited, if it was before
          rs.reinh.$._show();
          
          var dwc = rs.downChain();
          dwc.forEach(function (cm) {
            cm.inh.$._hide();
            cm.ovr.$._show();
          });
          var upc = rs.upChain();
          upc.forEach(function (cm) {
            cm.updateValue({});
          });

        }
        // redraw the whole thing, since effects may ripple up from styles, proto chains

        _draw.refresh();

      }
    }
   
   
    function reinherit () {
      var prt = Object.getPrototypeOf(nd);
      delete nd[k];
      rs.updateValue({});
      var dwc = rs.downChain();
      dwc.forEach(function (cm) {
        cm.updateValue({});
      });
      svg.refresh();
    }
    reinhEl.click = reinherit;
 
  
      // put in a color picker
    if (ftp == "svg.Rgb") {
      var cp = dom.Element.mk('<input type="input" value="CP"/>');
      var cl = nd[k];
      cl = cl?cl:"black";
      cp.__color__ = cl; // perhaps the inherited value
      cp.__newColor__ = function (color) {
        var chv = dom.processInput(inp,nd,k,inherited,tree.computeStringWd,color);
        onInput(chv);
        var cls = color.toRgbString();
        var inh = rs.upChain();
        inh.forEach(function (wlc) {
          var icp = wlc.colorPicker;
          if (icp) {
            $(icp._element).spectrum("set",cls);
          }
        });
      }
      el.set("colorPicker",cp);
      rs.kind = "colorPicker";
      return rs;
    }
      // the remaining case
      //put in a text input field
    var inpwd = 40;
    var inp = dom.Element.mk('<input type="input" value="" style="font:tree.inputFont;background-color:#e7e7ee;width:'+
                             inpwd+'px;margin-left:10px"/>');
   
    var blurH = function () {
      var chv = dom.processInput(inp,nd,k,inherited,tree.computeStringWd);
      onInput(chv);
      return;
    }
    inp.blur = blurH;
    el.set("inputField",inp);
    rs.kind = "input";
    inp.enter = blurH;
    return rs;
  }
  
  om.LNode._mkPrimWidgetLine = om.DNode._mkPrimWidgetLine;
  
  // it is convenient to erase "inherited" when the user starts to type into the field
   
  tree.stringLengthLimit = 60;
  // for prim widget lines only
  tree.WidgetLine.updateValue = function (options) {
    var el = this._parent;
    var ind = options.node;
    var nd=ind?ind:this.forParentNode();
    var _atFrontier = 0;//this._atFrontier;
    var k = this.forProp;
    if (k === "data") {
      var ds = dataString(nd.data);
    }
    var ovr = this.fieldIsOverridden(k);
    var vl = nd[k];
  
    var ownp = nd.hasOwnProperty(k);
    var isFun = typeof vl === "function";
    var ftp = nd._getFieldType(k);
    // assumption: once a field is a color or function this remains true
    var editable = this._fieldIsEditable(k);
    var prt = Object.getPrototypeOf(nd);
    var canReinherit = prt[k] !== undefined;
    if (isFun) return; // assumed stable
    var inhEl = el.inh;
    var reinhEl = el.reinh;
    var ovrEl = el.ovr;
    if (ovr) {
      ovrEl.$._show();
      inhEl.$._hide();
      if (reinhEl) reinhEl.$._hide();
    } else {
      if (!ovrEl) {
        debugger;
      }
      ovrEl.$._hide();
      if (inhEl) {
        if ((!ownp) && (!_atFrontier)) { // all _properties at the frontier don't count as overriden; that's the last place they can be edited
          inhEl.$._show();
          if (reinhEl) reinhEl.$._hide();
        } else {
          inhEl.$._hide();
          if (reinhEl && canReinherit) reinhEl.$._show();
        }
      }
    }
    var proto =  Object.getPrototypeOf(nd);
    var knd = this.kind;
    var vts = ds?ds:nd._applyOutputF(k,vl);
    if (typeof vts === "number") {
      vts = om.nDigits(vts,4);
    }
    if (knd === "input") {
      var inf = el.inputField;
      inf.$.prop("value",vts);// I don't understand why this is needed, but is
      inf.$.attr("value",vts);
      ///var wdcss = {width:tree.computeStringWd(vts)};
      inf.$.css("width",tree.computeStringWd(vts));
    } else if (knd == "colorPicker") {
      var cp = el.colorPicker;
      cp.__color__ = vl; // perhaps the inherited value
      var jel = $(cp._element);
      if (jel) jel.spectrum("set",vl);

    } else {
      if (typeof vts === "string") {
        if (vts.length > tree.stringLengthLimit) {
          vts = vts.substr(0,tree.stringLengthLimit)+"...";
        }
      }
      el.valueField.$.html(vts);
    }
  }

  
  tree.mkRangeWidgetLine = function (nd,lb,ub,increment) {
    // usually increment = (ub+1-lb) but not always for the last range
    var cl = "black";
    var rs = wline.instantiate();
    rs._range = 1;
    var pth = nd._pathOf(om.root);
    rs.nodePath = pth;
    rs.lowerBound = lb;
    rs.upperBound = ub;
    rs.increment = increment;
    var txt = "["+lb+"..."+ub+"]";
    var m = rs.main;
    m.note.$._hide();
    var nspan = m.theName;
    nspan.html = txt;
    rs.id = txt;
    var tspan = m.toggle;
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
    var sp =  dom.Element.mk('<span>'+(k + " REF ")+'</span>');
    rs.set("ttl",sp);
    rs.click = function () {
      rs.selectThisLine("tree");
    }
    rs._ref =1;
    rs.refValue = v;
    return rs;
  }
  

  tree.WidgetLine.visible = function () {
    if (this._treeTop) return true;
    var pr = this.treeParent();
    return pr.visible() && pr.expanded;
  }
  
  // the workspace tree might have been recomputed or otherwise modified, breaking the two-way links between widgetlines
  // and nodes. This fixes them up, removing subtrees where there are mismatches. It also installs new _values into primwidgetlines.
  
  // returns true if this line does not have a match in the workspace, that is, if the parent needs reexpansion
  
  // first parent which is not a range; that is, parent if ranges are passed through

  tree.WidgetLine.nonRangeParent = function () {
    var rs = this.treeParent();
    if ( !rs) return undefined;
    if (rs._range) {
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
      if (ch._range) {
        ch.childrenPastRanges(rs);
      } else {
        rs.push(ch);
      }
    });                 
  }

})(prototypeJungle);

