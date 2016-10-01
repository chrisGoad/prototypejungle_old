
// This is one of the code files assembled into pjui.js.

var tree =pj.set("tree",pj.Object.mk());

svg.Element.__setFieldType("fill","svg.Rgb");
svg.Element.__setFieldType("stroke","svg.Rgb");
svg.Element.__setFieldType("backgroundColor","svg.Rgb");
dom.Style.__setFieldType("fill","svg.Rgb");


pj.inspectEverything = true;
tree.showFunctions = false;
tree.showNonEditable = true;
var showProtosAsTrees = false;
tree.set("TreeWidget",pj.Object.mk()).__namedType();
tree.enabled = true; 
tree.fullyExpandThreshold = 20;
tree.highlightColor = "rgb(100,140,255)"
tree.viewableStringMaxLength = 45;
tree.newTreeWidget = function (o) {
  pj.setProperties(this,o,["textProto","rootPos"]);
}
  // ground level operators
  
var jqp = pj.jqPrototypes;
var mpg = pj.mainPage;
var wline = tree.set("WidgetLine",pj.Object.mk());// holds methods and data for a widgetline; will be .w. of each dom element for a widgetline
var nonPrim = tree.set("NonPrimLine", html.Element.mk('<div style="font-size:small;color:black;width:100%"/>')).__namedType();
// prototype for widget lines
var mline = nonPrim.set("main",html.Element.mk('<div style="font-size:small"/>'));
mline.set("note",html.Element.mk('<span style="margin-right:5px;color:blue;cursor:pointer">?</span>'));
mline.set("toggle",html.Element.mk('<span style="cursor:pointer;color:black">&#9655;</span>'));
      
mline.set("theName",html.Element.mk('<span style="padding-right:20px;color:black;font-size:small"/>')); 
tree.wline = wline;

tree.dpySelected = html.Element.mk('<div style="color:black"/>');


tree.WidgetLine.forNode = function () {
  return pj.evalXpath(pj.root,this.nodePath);
}
/*
 * Special case. When a mark is modified, it moves from the marks array to the modified object.
 * In some cases , the paths over on the tree side are not kept up to date. But we can patch this
 * efficiently: in this case the parentNode path will evaluate to "__modified", and we know to look over
 * into the modified array.
 */
 
tree.WidgetLine.forParentNode = function () {
  var pnp = this.parentNodePath;
  var rs = pj.evalXpath(pj.root,pnp);
  if (rs === '__modified') { 
    pnp[pnp.length-2] = 'modifications';
    rs = pj.evalXpath(pj.root,pnp);
  }
  return rs;
}
  
pj.Object.__getTheNote = function () {
  if (this === pj.root ) {
    var rs = this.__topNote;
  } else if (this.__parent) {
    rs = this.__parent.__getNote(this.__name)
  }
  return rs;
}
  
pj.Array.__getTheNote = pj.Object.__getTheNote;
  
pj.Object.__mkWidgetLine = function (options) {
  var top,thisHere,ww,rs,el,m,isLNode,tg,pth,noteSpan,notePop,txt,tspan,nspan,hp,clr;
  if (tree.onlyShowEditable && this.__mfrozen) return;
  top = options.top;
  thisHere = this;
  rs = Object.create(tree.WidgetLine);
  el = nonPrim.instantiate();
  el.main.$css("font-size","small"); // fixStyles
  el.set("w",rs);
  if (this.__parent) {
    rs.parentNodePath = pj.xpathOf(this.__parent,pj.root);
    rs.forProp = this.__name;
  }
  m = el.main;
  isLNode = pj.Array.isPrototypeOf(this);
  if (!isLNode && (this.forProto || this.noToggle)) {
    tg = m.toggle;
    tg.$hide();
  }
  pth = pj.xpathOf(this,pj.root);
  if (!pth) {
    return;
  }
  rs.__treeTop = !!top;
  noteSpan = m.note;
  if (this.__getTheNote()) {
    notePop = function () {rs.popNote()};
    noteSpan.$click(notePop);
    noteSpan.$show();
  } else {
    noteSpan.$hide();
  }
  txt = tree.withTypeName(this,this.__name,top);
  thisHere = this;
  tspan = m.toggle;
  if (this.noToggle) {
    tspan.$hide();
  } else if (this.__leaf) {
    tspan.$html(" ");
  }  else {
    tspan.$click(function (){rs.toggle();});
  }
  nspan = m.theName;
  nspan.$html(txt);
  hp = this.__hasTreeProto();
  clr = "black";
  nspan.style.color = clr;
  m.addEventListener("mouseover",function (e) {
    var inheritors;
    m.$css({"background-color":"rgba(0,100,255,0.2)"});
    if (pj.Array.isPrototypeOf(thisHere)) {
      svg.highlightNodes(thisHere);
    } else { 
      inheritors = pj.inheritors(thisHere,function (x) {
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
  

pj.Array.__mkWidgetLine = pj.Object.__mkWidgetLine;
  
// operations on the widget tree, as opposed to the dom tree
tree.WidgetLine.treeChild = function (id) {
  var fc = this.__parent.forChildren;
  var elc;
  if (fc) {
    elc = fc[id];
    if (elc) {
      return elc.w;
    }
  }
  return undefined;
}
  
tree.WidgetLine.treeParent = function() {
  var pr = this.__parent.__parent;
  var pel;
  if (pr) {
    pel =  pr.__parent;
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
  
tree.WidgetLine.forTreeChildren = function (fn) {
  var el,fch;
  if (this.__prim) return;
  el = this.__parent;
  fch = el.forChildren;
  if (fch) {
    var prps = Object.getOwnPropertyNames(fch);
    prps.forEach(function (p) {
      var v;
      if (pj.internal(p)) return;
      v = fch[p];
      if (v.__parent !== fch) return;
      if (html.Element.isPrototypeOf(v)) {
       fn(v.w);
      }
    });
  }
}
  
tree.WidgetLine.forTreeDescendants = function (fn) {
  var perChild = function (ch) {
    ch.forTreeDescendants(fn);
  }
  fn(this);
  this.forTreeChildren(perChild);
}
    
  
tree.WidgetLine.treeChildren = function () {
  var rs = [];
  var perChild = function (ch) {
    rs.push(ch);
  }
  this.forTreeChildren(perChild);
  return rs;
}
  
tree.WidgetLine.childrenNames = function () {
  var rs = [];
  var el = this.__parent;
  var fch = el.forChildren;
  var prps = Object.getOwnPropertyNames(fch);
  prps.forEach(function (p) {
    var v;
    if (pj.internal(p)) return;
    v = fch[p];
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
  var idx,myTop,ln,i,ptop,cl,topnode,nd;
  if (!tops) {
    return [];
  }
  if (up) {
    idx = 0;
  } else {
    myTop = this.treeTop();
    idx = tops.indexOf(myTop)+1;
  } 
  ln = tops.length;
  for (i=idx;i<ln;i++) {
    ptop = tops[i];
    cl =  ptop.treeSelectPath(pth);
    if (!cl) {
      return rs.reverse();
    }
    if (cl === this) { //done
      return rs.reverse(); // in order going up the chain
    } else  {
      if (returnNodes) {
        topnode = ptop.forNode();
        nd = pj.evalPath(topnode,pth);
        if (nd) { // nd undefined might indicate trouble todo look into this
          rs.push(nd);
        }
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
  var i,u,und,ch;
  for (i=0;i<ln;i++) {
    u = upc[i];
    und = u.forNode();
    if (!und.hasOwnProperty(k)) {
      ch = u.treeSelect(k);
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
  var upc,ln,i;
  if (!pr) {
    return false;
  }
  upc  = pr.upChain(true);
  ln = upc.length;
  for (i=0;i<ln;i++) {
    if (upc[i].hasOwnProperty(k)) return 1;
  }
  return false;
}
 
// selectChild is at the Element level. this is at the tree level
tree.WidgetLine.treeSelect = function (nm) {
  var fc,chel;
  if (this.__prim) return undefined;
  fc = this.__parent.forChildren;
  if (fc) {
    chel = fc[nm];
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
  var i,cpe,cw;
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
    return this.__parent.main;
  }
}

tree.WidgetLine.unselectThisLine = function () {
  this.__selected = false;
  var el = this.highlightedPart();
  el.$css("background-color","white");
}
  
  
tree.WidgetLine.selectChildLine = function (nm) {
  var ch;
  this.expand();
  ch = this.treeChild(nm);
  if (ch) ch.selectThisLine('tree');
}

  
tree.WidgetLine.selectThisLine = function (src,forceRedisplay) { // src = "canvas" or "tree"
  var prnd,selnd,prp,nd,tp,isProto,isShapeTree,drawIt,ds,
    p,ps,sl,cntr,el,cht,coffy,ely,soff,hiddenBy;
  if (this.__prim) {
    prnd = this.forParentNode();
    selnd = prnd;
    prp = this.forProp;
  } else {
    nd = this.forNode();
    selnd = nd;
  }
  tree.selectedLine = this;
  if (this.__selected && !forceRedisplay) return;
  tree.selectedNode = selnd;
  if (prnd) return;
  tp = this.treeTop();
  isProto = tp.protoTree; // is this the prototype panel? 
  isShapeTree = !(isProto);// the shape panel 
  drawIt =  (src === "tree");
  if (isShapeTree && !ui.forDraw) tree.clearProtoTree();
  ds = tp.dpySelected;
 
  if (isProto) {
    p = pj.xpathOf(selnd,pj.root)
    ps = p.join(".");
  }
  sl = tp.__selectedLine;
  cntr = $(tp.__parent.__container);
  this.__selected = true;
  if (sl) sl.unselectThisLine();
  el = this.highlightedPart();
  el.$css("background-color",tree.highlightColor );
  tp.__selectedLine = this;
  // take  care of scrolling
  cht = cntr.height();
  coffy = cntr.offset().top;
  // now scroll the fellow into view if needed
  ely = el.$offset().top;
  soff = cntr.scrollTop();
  hiddenBy = ely - (coffy+cht); // how far is this element below the visible area?
  if (hiddenBy > -40) {
    cntr.scrollTop(soff + hiddenBy+40);
  } else {
    hiddenBy = coffy -ely;
    if (hiddenBy > -40) {
      cntr.scrollTop(soff-hiddenBy-40);
    }
  }
  pj.log("tree","SELECTION STAGE 1");
  if (isShapeTree) { // show the prototype in its panel
    if (this.__ref) {
      tree.showRef(this.refValue);
    } else {
      tree.showProtoChain(nd);
    }
  }
  if (drawIt) {
    selnd.__select('tree');
    pj.originalSelectionPath = undefined;
    tree.shownItem = selnd;

    pj.ui.enableTreeClimbButtons();
  }    
  pj.log("tree","SELECTION DONE");
}
  
tree.WidgetLine.ancestorIsSelected = function () {
  var pr;
  if (this.__selected) return true;
  pr = this.treeParent();
  if (!pr) return false;
  return pr.ancestorIsSelected();
}


tree.hiddenProperties = {__record:1,__isType:1,__record_:1,__mark:1,__external:1,__selected:1,__selectedPart__:1,__doNotBind:1,
                          __notes__:1,computedd:1,__descendantSelected:1,__fieldStatus:1,__source:1,__about:1,__UIStatus:1,__markProto:1,
                          __FieldType:1, __shifter:1,__repo:1,__computed:1,__internalized:1,__customControlsOnly:1,
                          __InstanceUIStatus:1,__UIWatched:1,__Note:1,__forMeasurment:1, data:1,__controlBoxes:1,
                          __editPanelName:1,__hideInEditPanel:1,__customBoxes:1,__controlBoxes:1,__idata:1,__dragVertically:1,
                          __dragHorizontally:1,__draggable:1,__sourceUrl:1,__adjustable:1,__requireDepth:1,__signature:1,
                          __newData:1,__updateCount:1,__originPath:1,__topLevel:1,
                          __overrides:1,__mfrozen:1,visibility:1,__current:1,transform:1,
                          __beenModified:1,__autonamed:1,__origin:1,__from__:1,__objectsModified:1,__topNote:1,
                          __saveCount:1,__saveCountForNote:1,__setCount:1,__setIndex:1,__doNotUpdate:1,__components:1,__unselectable:1,
                          __listeners:1,transformm:1,noData:1,surrounders:1,__selectable:1,__eventListeners:1,dataSource:1,
                          __outsideData:1,attributes:1,__requires:1,categorized:1,categoryCount:1};
  
tree.frozenProperties = {dataSource:1};  
  
tree.hiddenProperty = function (p) {
  if (typeof p !== "string") return false;
  if (tree.hiddenProperties[p]) return true;
  return (pj.beginsWith(p,"__fieldType")||pj.beginsWith(p,"__inputFunction__")||pj.beginsWith(p,"__status")||
          pj.beginsWith(p,"__uiWatched")|| pj.beginsWith(p,"__note"));
}
  
pj.Object.__fieldIsEditable = function (k) {
  var ch,tp;
  if (tree.frozenProperties[k]) {
    return false;
  }
  if (pj.internal(k) || tree.hiddenProperty(k)) return false; // for now;
  ch = this[k];
  tp = typeof ch;
  if (k==="data") return false;
  if (!this.__inWs()) {
    return false;
  }
  if (tp === "function") return false;
  return !this.__fieldIsFrozen(k)
}
  
pj.Array.__fieldIsEditable = function (k) {
  var ch = this[k];
  var tp = typeof ch;
  if (tp === "function") return false;
  return true;
}
  
  
tree.hasEditableField = function (nd,overriden) { // hereditary'
  var k,ch;
  for (k in nd) {
    if (nd.__fieldIsEditable(k,overriden)) return true;
    ch = nd[k];
    if (pj.isNode(ch) && tree.hasEditableField(ch,chovr)) return true;
  }
  return false;
}
  
  
tree.WidgetLine.popNote= function () {
  var prp = this.forProp;
  var prnd,nt,nd;
  if (this.__prim) {
    prnd = this.forParentNode();
    if (prnd) {
      nt = prnd.__getNote(prp);
    }
  } else {
    nd = this.forNode();
    if (nd === pj.root) {
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
  var nms,a,v,c,tp;
  if ((tp === "string") || (tp === "number") ) return dt;
  if (pj.Object.isPrototypeOf(dt)) {
    nms = Object.getOwnPropertyNames(dt);
    a = [];
    nms.forEach(function (k) {
      if (!pj.internal(k)) {
        v = dt[k];
        if (v === null) v = "null";
        c = "";
        tp = typeof v;
        if (tp !== "object") {
          c += k+':';
          if (tp === "string") {
            c += externalizeString(v);
          } else if (tp === "number") {
            c += pj.nDigits(v, 2);
          } else {
            c += v;
          }
          a.push(c);
        }
      }
    });
    if (a.length > 0) {
      return "{"+a.join(",")+"}";
    }
  }
  }
  
  /* the correspondence between widgetLines and nodes is represented on the widgetLine side by the xpaths of the associated
   node: nodePath of non-prim widget lines and parentNodePath for prims. Nodes that have a corresponding widget line have
   the hasWidgetLine property. To look this line up, follow the node's xpath. */
  
pj.Object.__widgetLineOf = function () {d
  var pth,wl;
  if (!this.hasWidgetLine) {
    return undefined;
  }
  var pth = pj.xpathOf(this,pj.root);
  var wl = tree.mainTop.treeSelectPath(pth);
  return wl;
}
  
pj.Array.__fieldIsHidden = function (k) { return false;}
  
// should  property k of this be shown? Returns 0, "prim" "function" "ref" or "node"
pj.Object.__showInTreeP = function (k,overriden) {
  var dataValue,hidden,vl,tp,isFun,editable,isob,isnd;
  if (this.__coreProperty(k)) return false; // a  property defined down in core modules of the proto chain.
  if (tree.hiddenProperty(k)) return false;
  if (k === "data") {
    dataValue = dataString(this.__data);
    return dataValue?"prim":false;
  }
  hidden = this.__fieldIsHidden(k); // hidden from this browser
  if (hidden) return false;
  vl = this[k];
  tp = typeof vl;
  isFun = tp === "function";
  if (isFun) {
    if (!tree.showFunctions) return false;
    if (dontShowFunctionsFor.indexOf(this.__parent) >= 0) return false;// excludes eg geom functions
    return "function";
    
  }
  editable = this.__fieldIsEditable(k);
   if (tree.onlyShowEditable && !editable ) {
      return false;
  }
  isnd = pj.isNode(vl);
  if (isnd && !pj.treeProperty(this,k)) {
    if (!this.hasOwnProperty(k)) return false; // inherited references are not shown
    return "ref";
  }
  isob = tp === "object";
  if (isob && !isnd) return false;// Outside the tree
  return isnd?"node":"prim";
}
 
pj.Array.__showInTreeP = pj.Object.__showInTreeP;
tree.inputFont = "8pt arial";

tree.computeStringWd = function (s) {
   var wm = dom.measureText(s,tree.inputFont);
   return Math.max(20,wm+20)
}
 
pj.Object.__mkPrimWidgetLine = function (options) { // for constants (strings, nums etc).  nd is the node whose property this line displays
  var nd = this;
  var clickFun = options.clickFun;
  var isProto = options.isProto;
  var overriden = options.overridden;
  var k = options.property;
  var rs = Object.create(tree.WidgetLine);
  var atFrontier = rs.__atFrontier = nd.__atProtoFrontier(); // the next fellow in the prototype chain is outside the ws
  var ownp = nd.hasOwnProperty(k);
  var inherited = !ownp;
  var canBeInherited = pj.inheritableAtomicProperty(nd,k);
  var prnd = nd;
  var frozen = nd.__fieldIsFrozen(k);
  var el = html.Element.mk('<div style="padding-bottom:2px"></div>');
  var isFun,txt,qm,sp,vl,ovrEl,inheritedEl,editable,onInput,doInherit,cp,cl,handleInput,inheritEl,notePop,inpwd,inp,enterH,ftp;
  el.set('w',rs);
  el.$click(function () {
    rs.selectThisLine("tree");
  });
  rs.__prim = true;
  rs.parentNodePath = pj.xpathOf(nd,pj.root);
  rs.forProp = k;
  isFun = typeof v === "function";
  txt = k;
  if (nd.__getNote(k)) {
    qm =  html.Element.mk('<span style="color:blue;margin-right:5px;cursor:pointer;font-weight:bold">?</span>');
    el.set("qm",qm);
    notePop = function () {rs.popNote()};
    qm.$click(notePop);
    sp =  html.Element.mk('<span style="cursor:pointer;color:cl;padding-right:5px">'+txt+'</span>');
    sp.$click(notePop);
  } else {
    sp =  html.Element.mk('<span style="padding-right:5px;font-size:small">'+txt+'</span>');
  }
  el.set("title",sp);
  ftp = nd.__getFieldType(k);
  // assumption: color and functino fields stay that way
  vl = nd[k];
  ovrEl = html.Element.mk('<span/>');
  ovrEl.$html(' overriden ');
  el.set('ovr',ovrEl);
  rs.ovr = ovrEl;
  if (!ui.forDraw) {
    inheritedEl = html.Element.mk('<span/>');
    inheritedEl.$html(' inherited ');
    el.set('inherited',inheritedEl);
    rs.inherited = inheritedEl;
  }
  editable = this.__fieldIsEditable(k);
  if (!editable) {
    inp =  html.Element.mk('<span/>');
    el.set("valueField",inp);
    rs.kind = "value";
    return rs;
  }
  
  if  (!ui.forDraw) {
    inheritEl = html.Element.mk('<span style="cursor:pointer;text-decoration:underline"> inherit </span>');
    el.set('inherit',inheritEl);
    rs.inherit = inheritEl;
  }
  //  the input field, and its handler
  onInput = function (chv) {
    var rsinh,event;
    if (typeof chv === "string") {
      page.alert(chv);
    } else if (chv) {
      ui.setSaved(false);
      rsinh = rs.upChain();
      rsinh.forEach(function (wlc) {
        if (!wlc.colorPicker) { //handled in __newColor__
          wlc.updateValue({});
        }
      }); 
        // special case, obviously
      if (k !== "backgroundColor"  ||  ui.draw) {
        if (rs.inherited) rs.inherited.$hide(); // this field is no longer inherited, if it was before
        if (rs.inherit) rs.inherit.$show();
      }
      event = pj.Event.mk('UIchange',nd);
      event.property=k;
      event.emit();
      pj.tree.refresh();
      svg.main.updateAndDraw();
      pj.tree.refreshValues();
    }
  }   
  doInherit = function () {
    var prt = Object.getPrototypeOf(nd);
    var dwc,cp,cl;
    delete nd[k];
    rs.updateValue({});
    dwc = rs.downChain();
    dwc.forEach(function (cm) {
      cm.updateValue({});
    });
    svg.draw();
  }
  if (!ui.forDraw) {
    inheritEl.$click(doInherit);
  }
    // put in a color picker
  if (ftp == "svg.Rgb") {
    cp = html.Element.mk('<input type="input" value="CP"/>');
    cl = nd[k];
    cl = cl?cl:"black";
    cp.__color__ = cl; // perhaps the inherited value
    cp.__newColor__ = function (color) {
      var cls,inh,icp;
      var chv = dom.processInput(inp,nd,k,inherited&&(!atFrontier),tree.computeStringWd,color);
      onInput(chv);
      cls = color.toRgbString();
      inh = rs.upChain();
      inh.forEach(function (wlc) {
        icp = wlc.colorPicker;
        if (icp) {
          $(icp.__element).spectrum("set",cls);
        }
      });
    }
    el.set("colorPicker",cp);
    rs.kind = "colorPicker";
    return rs;
  }
  if (ftp === 'boolean') {
    var sel = html.Element.mk('<select><option value="true">true</option><option value="false">no</option></select>');
    pj.selectSv = sel;
    sel[2].text = 'false';
    if (nd[k]) {
      sel[1].selected = true;
    } else {
      sel[2].selected = true;
    }
    el.set('select',sel);
    sel.addEventListener("change",function () {
      var idx = sel.__element.selectedIndex;
      var value = (idx===0)?true:false;
      nd.set(k,value);
      dom.afterSetValue(nd);
      onInput(true);      
    });
    rs.kind = "boolean";
    return rs;
  }
  // the remaining case
  //put in a text input field 
  inpwd = 100;// this gets replaced anyway when the value is measured
  inp = html.Element.mk('<input type="input" value="" style="font-size:8pt;font:tree.inputFont;background-color:#e7e7ee;width:'+
                           inpwd+'px;margin-left:10pt"/>');
  handleInput = function () {
    var chv = dom.processInput(inp,nd,k,inherited,tree.computeStringWd);
    onInput(chv);
    return;
  }
  enterH = function (e) {    
    if((e.key === 13)||(e.keyCode === 13)) {
       handleInput();
    }
  }
  inp.addEventListener("blur",handleInput);
  el.set("inputField",inp);
  rs.kind = "input";
  inp.addEventListener("keyup",enterH);
  return rs;
}

pj.Array.__mkPrimWidgetLine = pj.Object.__mkPrimWidgetLine;

// it is convenient to erase "inherited" when the user starts to type into the field
 
tree.stringLengthLimit = 60;
// for prim widget lines only
tree.WidgetLine.updateValue = function (options) {
  var el = this.__parent;
  var ind = options.node;
  var nd=ind?ind:this.forParentNode();
  if (!nd) {
    debugger;
    return;
  }
  var atFrontier = this.__atFrontier;
  var k = this.forProp;
  var ds = (k === 'data')?dataString(nd.__data):undefined;
  var vl = nd[k]; 
  var ovr = this.fieldIsOverridden(k);
  var ownp = nd.hasOwnProperty(k);
  var canBeInherited = pj.inheritableAtomicProperty(nd,k);
  var inherited =  !ownp;
  var isFun = typeof vl === "function";
  var ftp = nd.__getFieldType(k);
  // assumption: once a field is a color or function this remains true
  var editable = this.__fieldIsEditable(k);
  var prt = Object.getPrototypeOf(nd);
  var inheritEl,inheritedEl,ovrEl,proto,knd,vts,inf,cwd,cp,jel;
  if (isFun) return; // assumed stable
  if (!ui.forDraw) {
    inheritEl = el.inherit;
    inheritedEl = el.inherited;
    inheritedEl.setVisibility(inherited);
    if (inheritEl) inheritEl.setVisibility(canBeInherited);
  }
  ovrEl = el.ovr;
  if (ovrEl) {
    ovrEl.setVisibility(ovr);
  }
  proto =  Object.getPrototypeOf(nd);
  knd = this.kind;
  vts = ds?ds:pj.applyInputF(nd,k,vl);
  if (typeof vts === "number") {
    vts = pj.nDigits(vts,4);
  }
  if (knd === "input") {
    inf = el.inputField;
    inf.$prop("value",vts);// I don't understand why this is needed, but is
    inf.$attr("value",vts);
    cwd = tree.computeStringWd(vts);
    inf.$css("width",cwd+"px");
  } else if (knd == "colorPicker") {
    cp = el.colorPicker;
    cp.__color__ = vl; // perhaps the inherited value
    jel = $(cp.__element);
    if (jel) jel.spectrum("set",vl);

  } else {
    if (typeof vts === "string") {
      if (vts.length > tree.stringLengthLimit) {
        vts = vts.substr(0,tree.stringLengthLimit)+"...";
      }
    }
    if (el.valueField) {
      el.valueField.$html(vts);
    }
  }
}

  
tree.mkRangeWidgetLine = function (nd,lb,ub,increment) {
  // usually increment = (ub+1-lb) but not always for the last range
  var cl = "black";
  var rs = wline.instantiate();
  var txt,nm,tspan,nspan,cl;
  rs.__range = true;
  var pth = pj.xpathOf(nd,pj.root);
  rs.nodePath = pth;
  rs.lowerBound = lb;
  rs.upperBound = ub;
  rs.increment = increment;
  txt = "["+lb+"..."+ub+"]";
  m = rs.main;
  m.note.$hide();
  nspan = m.theName;
  nspan.html = txt;
  rs.id = txt;
  tspan = m.toggle;
  cl = function () {
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
  var txt,m,nspan,tspan,cl,pth;
  el.set("w",rs);
  rs.__range = true;
  pth = pj.xpathOf(nd,pj.root);
  rs.nodePath = pth;
  rs.lowerBound = lb;
  rs.upperBound = ub;
  rs.increment = increment;
  txt = "["+lb+"..."+ub+"]";
  m = el.main;
  m.note.$hide();
  nspan = m.theName;
  nspan.$html(txt);
  rs.id = txt;
  tspan = m.toggle;
  cl = function () {
    rs.toggle();
  };
  tspan.$click(cl); 
  return rs;
}
  
tree.mkRefWidgetLine = function (top,nd,k,v) { // for constants (strings, nums etc).  nd is the node whose property this line displays
  var rf = pj.refPath(v,top);
  var cl,rs,sp;
  if (!rf) return undefined;
  cl = "black";
  rs = tree.WidgetLine.mk({tag:"div",style:{color:cl}});
  sp =  html.Element.mk('<span>'+(k + " REF ")+'</span>');
  rs.set("ttl",sp);
  rs.$click(function () {
    rs.selectThisLine("tree");
  });
  rs.__ref =true;
  rs.refValue = v;
  return rs;
}


tree.WidgetLine.visible = function () {
  var pr;
  if (this.__treeTop) return true;
  pr = this.treeParent();
  return pr.visible() && pr.expanded;
}

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
  var frs,tch;
  if (!rs) {
     frs = [];
     this.childrenPastRanges(frs);
     return frs;
  }
  tch = this.treeChildren();
  if (!tch) return;
  tch.forEach(function (ch) {
    if (ch.__range) {
      ch.childrenPastRanges(rs);
    } else {
      rs.push(ch);
    }
  });                 
  }
  
