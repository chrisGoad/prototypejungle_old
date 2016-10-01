
  
  
// This is one of the code files assembled into pjui.js.
   
// for widgetlines whose forNode is an Array, check that counts match up on node and widget

tree.WidgetLine.checkRanges = function () {
  var nd = this.forNode;
  var fsz = this.rangesForSize;
  var tch,rs;
  if (fsz === undefined) {
    tch = this.treeChildren();
    rs = tch.length === nd.length;
  } else {
    rs  = fsz === nd.length;
  }
  pj.log("tree","checked range for",this.id," result=",rs);
  return rs;
}
  
//  only works and needed on the workspace side, not on protos, hence no ovr
// showProto shows the __values of __children, as inherited


tree.showRef = function (nd,dpysel) {
  var wl = tree.showProtoTop(nd,0);
  if (!wl) {
    return;
  }
  tree.setProtoTitle("Reference");
  tree.protoPanelShowsRef = true;
  wl.expand();
  return wl;
}
  
  // cause the tree below here to be expanded in the same places as src, when possible. For keeping the main and prototrees in synch 
   
tree.WidgetLine.expandLike = function (src,ovr) {
  var nms,thisHere;
  if (src.expanded) {
    this.expand(ovr);
    nms = src.childrenNames();
    thisHere = this;
    nms.forEach(function (nm) {
      var ch,mych,chovr;
      if (pj.internal(nm)) {
        return;
      }
      ch = src.treeSelect(nm);
      mych = thisHere.treeSelect(nm);
      if (mych) {
        chovr = ovr?ovr[nm]:ovr;
        if (chovr) mych.expandLike(chovr);
      }
    });
  } else {
    this.contract();
  }
  }
  
tree.WidgetLine.reExpand = function (force) {
  var ch = this.__parent.forChildren;
  if (!ch) {
    if (force) this.expand();
    return;
  }
  ch.removeChildren();
  ch.__reExpanding = true;
  this.expanded = false;
  this.expand();
  ch.__reExpanding = false;
}

// assure that the __children are visible; unless there are more than tree.WidgetLine.maxChildren.
//In this case, display only the target
  
tree.WidgetLine.expand = function (ovr,noEdit,__atFrontier) {
  var nd = this.forNode();
  var tp,isProto,isLNode,el,ch,newCh,lb,up,incr,toIter,nln,lg10,incr,dt,addLine,
    addRangeLine,addRanges,finishOff,rs;
  if (tree.onlyShowEditable && !tree.hasEditableField(nd,ovr)) return false;
  tp = this.treeTop();
  isProto = tp.protoTree && (!tree.protoPanelShowsRef);
  isLNode = pj.Array.isPrototypeOf(nd);
  if (this.expanded) return;
  el = this.__parent;
  ch = el.forChildren;
  if (!ch) {
    ch  = html.Element.mk('<div style="margin-left:25px"/>');
    el.addChild("forChildren",ch);
    newCh = true;
  } else {
    newCh = ch.__reExpanding;
    ch.$show();
  }
    
  tree.nameDec = "_t_";
  // primitive decoration scheme.  ch is an html element. Its children are the html elements for the children of the node it represents
  // These children must be named in a way that does not conflict with ch's properties such style or id.
  // So they are decorated with tree.nameDec ("_t_")
  
  addLine = function (ch,nd,k,tc) { // ch = element to add to nd = the parent, k = prop, tc = child
    var dk = tree.nameDec + k;
    var overriden,knd,options,ln;
    if (ch[dk]) return; //already there
    overriden = ovr && ovr[k];
    knd = nd.__showInTreeP(k,overriden);
    options = {addTo:ch,treeTop:tp,property:k};
    if (!knd) {
      return;
    } else if (knd === "node") {
      ln = tc.__mkWidgetLine(options);
    } else {
      ln = nd.__mkPrimWidgetLine(options);
    }
    if (ln) {
      ch.addChild(dk,ln.__parent);
      if (knd === "prim") ln.updateValue({node:nd});
    }
    return ln;
  }
  
  addRangeLine = function (nd,lb,ub,increment) { // nd = the parent, k = prop, tc = child
    var  ln = tree.mkRangeWidgetLine(nd,lb,ub,increment);
    ch.addChild(lb,ln.__parent);
    return ln;
  }

  addRanges= function (nd,lb,ub,incr) {
    var rk,rv,nln,ci,cub,nln,lg10,dt;
    if (incr < 10) {
      for (rk=lb;rk<=ub;rk++) {
        rv = nd[rk];
        addLine(ch,nd,rk,rv);
      }
      return;
    }
    nln = ub+1-lb;
    ci = lb;
    cub = lb;
    while (cub  < ub) {
      cub = Math.min(ub,ci+incr-1);
      if ((cub + 1) >= ub) {
        cub = ub;
      }
      addRangeLine(nd,ci,cub,incr);
      ci = ci + incr;
    }
  }
  if (this.__range && newCh) {
    lb = this.lowerBound;
    ub = this.upperBound;
    incr = this.increment;
    incr = incr/10;
    addRanges(nd,lb,ub,incr);
    finishOff(this);
    return;
  }
  rs = undefined;
  if (newCh) {
    toIter =   function (tc,k) {
      addLine(ch,nd,k,tc);
    }   
    if (isLNode) {
      nln = nd.length;
      lg10 = Math.floor(Math.log(nln)/Math.log(10));
      incr = Math.pow(10,lg10);
      if (incr*2 > nln) {
        incr = incr/10;
      }
      addRanges(nd,0,nln-1,incr);
      this.rangesForSize = nln;
    } else {

       dt =  nd.__data;
       if (dt) {
         addLine(ch,nd,"data",dt);
       }
       nd.__iterInheritedItems(toIter,tree.showFunctions,true); // true = alphabetical
    }
     // want prototype in there, though it is not enumerable
  } else {
    ch.$show();
  }
  finishOff = function (w){
    var el,tg;
    w.expanded = true;
    w.hasBeenExpanded = true;
    el = w.__parent;
    tg = el.main.toggle;
    tg.$html('&#9698;');

  }
  finishOff(this);
  return rs;
  }
  
tree.WidgetLine.fullyExpand = function (ovr,noEdit,__atFrontier) {
  var ch;
  if (pj.Array.isPrototypeOf(this.forNode)) {
    return;
  }
  this.expand(ovr,noEdit,__atFrontier);
  ch = this.treeChildren();
  if (ch) {
    ch.forEach(function (c) {
      var cnd,nm,covr;
      if (!c.__prim) {
        cnd = c.forNode;
        nm = cnd.__name;
        covr = ovr?ovr[nm]:undefined;
        c.fullyExpand(covr,noEdit,__atFrontier);
      }
    });
  }
  }

tree.WidgetLine.fullyExpandIfSmall = function(ovr,noEdit,__atFrontier) {
  var tsz = this.forNode().__treeSize(tree.hiddenProperties);
  if (tsz <= tree.fullyExpandThreshold) {
    this.fullyExpand(ovr,noEdit,__atFrontier);
  } else {
    this.expand(ovr,noEdit,__atFrontier);
  }
}

 

// this adds a Object into the widget tree structure. There are two cases
// If this's parent is in the tree, then whichTree is not needed
// ow, the node is being added to a multiRoot, given by whichTree.
// this is for the protos, which are rooted at i.

  
// find the range child, if any which contains n
tree.WidgetLine.findRangeChild = function (n) {
  var tc = this.treeChildren();
  var c0,rng,ln,i,c,lb,up;
  if  (tc && (tc.length)) {
    c0 = tc[0]; // if any __children are ranges, the first will be
    rng = c0.__range;
    if (rng) {
      ln = tc.length;
      for (i=0;i<ln;i++) {
        c = tc[i];
        lb = c.lowerBound;
        ub = c.upperBound;
        if ((lb <= n) && (n <= ub)) {
          return c;
        }
      }
    }
  }
  return undefined;
}


// this assures that the parent is expanded, and this node is visible
pj.Object.__expandToHere = function () {
  var wd = tree.findWidgetLine(this);
  var pr,pwd,n,cw,isLNode;
  if (wd && wd.visible()) {
    return;
  }
  pr = this.__parent;
  pr.__expandToHere();
  // pr might have range kids if pr is an Array
  pwd = tree.findWidgetLine(this);
  pwd.expand();
  isLNode = pj.Array.isPrototypeOf(pr);
  if (isLNode) {
    n = this.__name;
    cw = pwd;
    while (cw) {
      cw = cw.findRangeChild(n);
      if (cw) {
        cw.expand();
      }
    }
  }
}
  
pj.Array.__expandToHere = pj.Object.__expandToHere;
 
  
tree.WidgetLine.contract = function () {
  // generates widget lines for the childern
  var el,ch,tg;
  if (!this.expanded) return;
  el = this.__parent;
  ch = el.forChildren;
  ch.$hide();
  this.expanded = false;
  tg = el .main.toggle;
  tg.$html('&#9655;');
}

tree.WidgetLine.assertOverridden = function (k) {
  var ch = this.treeSelect(k);
  if (ch) {
    var ovr = ch.ovr;
    if (ovr) {
      ovr.show();
    }
  }
}
    
  
// find the widget line for this node

tree.findWidgetLine = function (nd) {
  var pth = nd.__pathOf(pj.root);
  var tp = tree.tops[0];
  return tp.treeSelectPath(pth); 
}

tree.applyToTops = function (fn,except) {
  var tops = tree.tops;
  tops.forEach(function (tp) {
    if (tp  !== except) {
      fn(tp);
    }
  });
}

tree.forAllWidgetLines = function (fn) {
  var perTop = function (top) {
    top.forTreeDescendants(fn);
  }
  tree.applyToTops(perTop);
}

  
tree.refreshValues = function () {
  tree.forAllWidgetLines(function (w) {
    w.updateValue({});
  });
}

tree.WidgetLine.expandTops = function (except) {
  this.applyToTops(function (wl) {
    wl.expand();
  },except);
}

tree.expandTopsLike = function (wl) {
  var wtop = wl.treeTop();
  tree.applyToTops(function (tp) {
    tp.expandLike(wtop);
  },wtop);
}

tree.WidgetLine.toggle = function () {
  if (this.expanded) {
    this.contract();
  } else {
    this.expand();
  }
  tree.expandTopsLike(this); 
}

pj.Array.expandWidgetLine = pj.Object.expandWidgetLine;
pj.Array.contractWidgetLine = pj.Object.contractWidgetLine;
pj.Array.toggleWidgetLine =  pj.Object.toggleWidgetLine;
 
tree.attachTreeWidget = function (options) {
  var div = options.div;
  var root = options.root;
  var wOptions = pj.Object.mk();
  var ds,wline;
  pj.setProperties(wOptions,options,["forProto","__inWs","__atFrontier"]);
  wOptions.top = 1;
  var ds = tree.dpySelected.instantiate();
  var wline = root.__mkWidgetLine(wOptions);
  ds.__draw(div); // interupt the Element tree here
  wline.__parent.__draw(div);
  wline.dpySelected = ds;
  return wline;
}
 
pj.Object.__atProtoFrontier = function () { // the next fellow in the prototype chain is outside the ws
  var prnd = Object.getPrototypeOf(this);
  return (!prnd.__parent)||(!prnd.__inWs());
}
pj.Array.__atProtoFrontier = function () {
  return false;
}

tree.protoLines = [];
//n = nth in  proto chain.
// ovr is an object with __properties k:1 where k is overriden further up the
// chain, or k:covr , where covr is the ovr tree for prop k
tree.showProto = function (prnd,n,ovr) {
  var __inWs = prnd.__inWs();
  var atF,wl;
  if (__inWs) {
    atF =  !(Object.getPrototypeOf(prnd).__inWs());
  } else {
    atF = false;
  }
  wl = tree.showProtoTop(prnd,atF,__inWs,ovr);
  if (!wl) {
    return;
  }
  tree.protoTops.push(wl);
  tree.tops.push(wl);
  wl.expandLike(tree.mainTop,ovr);
}
tree.showWsOnly = true;
  
tree.showProtoChain = function (nd) {
  var cnd,n,ovr,addToOvr,__inWs,prnd,atF;
  tree.protoPanelShowsRef = false;
  tree.protoState = {nd:nd}
  tree.setProtoTitle("Prototype Chain");
  if (tree.protoDivRest) tree.protoDivRest.$empty();
  tree.protoTops = [];
  tree.tops = [tree.mainTop];
  cnd = nd;
  n = 0;
  ovr = {}; 
  // ovr is a tree structure which contains, hereditarily, the __properties set in the node nd,, rather than the prototype prnd
  // in other words, ovr shows what is overriden
  var addToOvr = function (nd,prnd,ov) {
    var op = Object.getOwnPropertyNames(nd);
    op.forEach(function (p) {
      var v = nd[p];
      var pv = prnd[p];
      var covr;
      if (pj.isAtomic(v)||(typeof v === "function")) {
        if (typeof ov === 'object') {
          ov[p] = true;
        } else {
          pj.error('unexpected');
        }
      } else if (pj.treeProperty(nd,p)) {
        if (!pv) { // this branch did not come from a prototype
          return;
        }
        covr = ovr[p];
        if (!covr) {
          ovr[p] = covr = {};
        }
        if (typeof covr === 'object') {
          addToOvr(v,pv,covr);
        }
      }
    });
  }
  addToOvr(nd,Object.getPrototypeOf(nd),ovr);
  var __inWs = true;
  while (true) {
    prnd = Object.getPrototypeOf(cnd);
    if ((!prnd.__parent)||(prnd === cnd)) {
     return;
    }
    atF = __inWs && (!prnd.__inWs());
    if (atF) {
      if (tree.showWsOnly) {
        return; 
      }
      tree.protoDivRest.push(html.Element.mk("<div style='margin-top:10px;margin-bottom:10pt;width:100%;height:2px;color:white;background-color:red'>_</div>"));
      tree.protoDivRest.push(html.Element.mk("<div style='font-size:8pt'>The prototypes below are outside the workspace and cannot be edited</div>"));
      __inWs = false;
    }
    tree.showProto(prnd,n++,ovr);
    cnd = prnd;
    addToOvr(cnd,Object.getPrototypeOf(cnd),ovr);
  }
}
  
tree.refreshProtoChain = function () {
  var s= tree.protoState;
  if (s) {
    tree.showProtoChain(s.nd);
  }
}
tree.pathToTerm = function (pth,fromRoot) {
  var rs = "";
  pth.forEach(function (p) {
    if (p === "/") {
      return;
    } else if (p === ".") {
      rs = "ws";
      return;
    } else if (p === "") {
      return;
    } else if (typeof p === "string") {
      if (pj.beginsWith(p,"http://prototypejungle.org/")) {
        rs = p.substr(26);
        if (pj.endsIn(rs,"/item.js")) {
          rs = rs.substring(0,rs.length-8);
        }
      } else {
        if (rs === "") {
          rs = p;
        } else {
          rs += "."+p;
        }
      }
    } else {
      rs += "["+p+"]";
    }
  });
  return rs;
}
  
tree.withTypeName = function (nd,nm,top) {
  var ntu,rp,tpn;
  if (top) {
    if (nd === pj.root) {
      ntu = "ws";
    } else {
      rp = pj.xpathOf(nd,pj.root);
      if (rp) {
        ntu = tree.pathToTerm(rp,true);
      } else {
        pj.error('unexpected');
      }
    }
  } else {
    ntu = nm;
  }
  tpn=nd.__protoName();
  if (tpn === "Object" || ntu === tpn) {
    return ntu;
  } else {
    return ntu+ " : " + tpn;
  }
}

tree.shapeTextFun = function (nd) {
  var tnm = nd.__name;
  var nm = (typeof tnm === "undefined")?"root":tnm;
  return tree.withTypeName(nd,nm);
}
  
// n  is the index of this tree in the prototype chain

tree.setProtoTitle = function (txt) {
  if (!tree.showProtosInObDiv) tree.protoDivTitle.$html(txt);
}

tree.showProtosInObDiv = true;

// Treatment of which member of the prototype chain is under adjustment
var adjustRequestedFor;
var adjusteeFound = false;


  
  
  
tree.setWhatToAdjust = function (iindex) {
  pj.log('adjust','setWhatToAdust',iindex);
  var index = (adjustRequestedFor === undefined)?iindex:adjustRequestedFor;
  var n;
  ui.whatToAdjust = tree.adjustingSubjects[index];
  ui.whatToAdjustIndex = index;
  ui.adjustInheritors = pj.inheritors(ui.whatToAdjust);//.concat(ui.whatToAdjust);
  pj.log("tree","WHAT TO ADJUST ",index,ui.whatToAdjust);
  n = 0;
  tree.adjustingCheckboxes.forEach(function (el) {
    el.__element.checked = index === n++;
  });
}
 
  
var addAdjustSelector = function (div,itm) {
  pj.log('adjust','addAdjustSelector');
  if (adjustmentOwnedBy) {
    return;
  }
  adjustmentOwnedBy = (itm.__ownsExtent && itm.__ownsExtent())?itm:undefined;
  var adjustingEl = html.Element.mk('<span style="padding-left:10px;font-style:italic">Adjusting this:</span>');
  var adjustingCheckbox,idx;
  div.addChild(adjustingEl);
  adjustingCheckbox = html.Element.mk('<input style="position:relative;top:3px" type="checkbox" />');
  div.addChild(adjustingCheckbox);
  tree.adjustingSubjects.push(itm);
  tree.adjustingCheckboxes.push(adjustingCheckbox);
  tree.adjustingEls.push(adjustingEl);
  idx = tree.adjustingEls.length-1;
  adjustingCheckbox.$change(function (x) {
    if (adjustingCheckbox.__element.checked) {
      adjustRequestedFor = idx;
      tree.setWhatToAdjust();
    }
  });
}

// should be called when a particular custom control box is clicked, with the index of that box
// idx is defined for the custom boxes, and undefined for control boxes (extent adjusters)
ui.showAdjustSelectors = function () {
  console.log("SHOWADJUSTSELECTORS");
  pj.log('adjust','showAdjustSelectors');
  if (!tree.adjustingSubjects) {
    return;
  }
  var ln = tree.adjustingSubjects.length;
    pj.log('adjust','adustingSubects length',ln);
  if (i === 0) {
    return;
  }
  var adjusteeFound = false;
  var thisIsAdjustee = false;
  var holdsControl;
  var i;
  var startsWithMark = tree.adjustingSubjects[0].__mark;
  for (i=0;i<ln;i++) {
    var itm = tree.adjustingSubjects[i];
    var el = tree.adjustingEls[i];
    var checkbox = tree.adjustingCheckboxes[i];
    if (adjusteeFound) {
      el.$hide();
      checkbox.$hide();
    } else  {
      el.$show();
      checkbox.$show();
      thisIsAdjustee = (itm === adjustmentOwnedBy) || (i === ln - 1);
      if (thisIsAdjustee) {
        adjusteeFound = true;
        tree.setWhatToAdjust(i);
      } else {
        checkbox.__element.checked = false;
      }
    }
  }
}
  // This does the display of each but the first element o of the prototype chain
tree.showProtoTop = function (o,__atFrontier,__inWs,ovr) {
  var editName,subdiv,divForProto,thisProto,rs,clickFun;
  if (o.__get('__hideInEditPanel')) {
    return;
  }
  editName = o.__get('__editPanelName');
  if (!editName) {
    editName = 'Prototype';
  }
  subdiv = tree.protoSubDiv.instantiate();
  if (tree.showProtosInObDiv) {
    divForProto = tree.obDiv;
    thisProto = html.Element.mk('<span>'+editName+'</span>');;
     subdiv.addChild(thisProto);
  } else {
    divForProto = tree.protoDivRest;
  }
  divForProto.addChild(subdiv);
  if (ui.nowAdjusting) addAdjustSelector(subdiv,o);
  subdiv.__draw();
  clickFun = function (wl) {
     pj.log("tree","CLICKKK ",wl);
    wl.selectThisLine("tree");
  }
  rs = tree.attachTreeWidget({div:subdiv.__element,root:o,__atFrontier:__atFrontier,__inWs:__inWs,forProto:true});
  rs.protoTree = true;
  return rs;
}


    

tree.clearProtoTree = function (o) {
  tree.protoDivRest.$empty();
}
    
    
tree.attachShapeTree= function (root) {
  var clickFun = function (wl) {
    pj.log("tree","CLICKKK ",wl);
    wl.selectThisLine("tree");
  }
  var tr,mtop;
  tree.obDivRest.$empty();
  tr = tree.attachTreeWidget({div:tree.obDivRest.__element,root:root,clickFun:clickFun,textFun:tree.shapeTextFun});
  if (tree.mainTop) {
    mtop = tree.mainTop;
    tree.mainTop = tr;
    tree.tops = [tr];
    tr.isShapeTree = true;
    tr.expandLike(mtop);
  } else {
    tree.mainTop = tr;
    tree.tops = [tr];
    tr.isShapeTree = true;
  }
}

  
tree.excludeFromProtos = {pj:1,fileTree:1,jqPrototypes:1,lightbox:1,geom:1,mainPage:1,top:1,trees:1,__draw:1};

tree.initShapeTreeWidget = function () {
  tree.attachShapeTree(pj.root);
  tree.mainTop.expand();
  tree.showProtoChain(pj.root);
}

tree.itemTextFun = function (nd) {
  var nm = (typeof tnm === "undefined")?"root":tnm;
  if (nd.__parent) {
    nm = nd.__name;
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
    nd.__expandToHere();
    var wd =  tree.findWidgetLine(nd); 
    if (wd) wd.selectThisLine("canvas",true);
  }
}
 

tree.selectPathInTree = function (path) {
  var nd;
  if (tree.enabled && path) {
    var nd = pj.evalXpath(pj.root,path);
    tree.selectInTree(nd);
  }
}
   

pj.attachItemTree= function (el,itemTree) {
 tree.itemTree = tree.attachTreeWidget({div:el,root:itemTree,clickFun:tree.itemClickFun,textFun:tree.itemTextFun,forItems:true});
 tree.itemTree.forItems = true;
}




tree.openTop = function () {
 tree.mainTop.expand();
}

var adjustmentOwnedBy = undefined; // while cruising down the proto chain, we don't wish to allow adjustments beyond the owner of adjustment

tree.showItem = function (itm,mode,noSelect,noName) {
  var editName,tpn,notog,subdiv,sitem,tr,atf;
  tree.shownItem = itm;
  if (!itm) {
    return;
  }
  tree.obDivRest.$empty();
  if (itm.__get('__hideInEditPanel')) {
    return;
  }
  editName = itm.__get('__editPanelName');
  if (!editName) {
    editName = 'Selected Item';
  }
  tpn = itm.__protoName();
  notog = 0 && mode==="fullyExpand";
  subdiv = tree.protoSubDiv.instantiate();
  tree.obDivRest.addChild(subdiv);
  if (!noName) {
    sitem = subdiv.addChild(html.Element.mk('<span>'+editName+'</span>'));
  }
  if (ui.nowAdjusting) {
    adjusteeFound = false;
    adjustRequestedFor = undefined;
    adjustmentOwnedBy = undefined;
    tree.adjustingSubjects = [];
    tree.adjustingEls = [];
    tree.adjustingCheckboxes = [];
    addAdjustSelector(subdiv,itm);
  }
  if (itm.__mark && (itm.__parent.__name === 'modifications')) { 
    var revertBut = subdiv.addChild(html.Element.mk('<div class="roundButton">revert to prototype </div>'));
    revertBut.addEventListener("click",function () {
      var spread = itm.__parent.__parent;
      spread.unmodify(itm);
      spread.__update();
      spread.__draw();
      pj.tree.refresh();
      ui.nowAdjusting = false;
      ui.clearControl();
    });
  }
  tr = tree.attachTreeWidget({div:subdiv.__element,root:itm,textFun:tree.shapeTextFun,noToggle:notog});
  tree.mainTop = tr;
  tr.noToggle = notog;
  tr.isShapeTree = true;
  tree.tops = [tr];
  atf = itm.__atProtoFrontier();
  if (mode==="fullyExpand") {
    tr.fullyExpand(undefined,false,atf);
  } else if (mode==="expand") {
    tr.expand(undefined,false,atf);
  }  else if (mode ==="auto") {
    tr.fullyExpandIfSmall(undefined,false,atf);

  }
  tree.mainTree = tr;
  if (!noSelect) itm.__select('tree');
  subdiv.__draw();
}

tree.showItemAndChain = function(itm,mode,noSelect,noName) {
  adjustmentOwnedBy = undefined;
  tree.showItem(itm,mode,noSelect,noName);
  tree.showProtoChain(itm);
   ui.showAdjustSelectors();
}

tree.refresh = function () {
  var shownItem = tree.shownItem;
  if (shownItem) {
    tree.showItemAndChain(shownItem,'auto',true);
  }
}

 tree.getParent = function (top) {
  var sh,pr;
  // are we climbing from a different start point?
  if (!pj.originalSelectionPath || !pj.matchesStart(pj.selectedNodePath,pj.originalSelectionPath)) {
    pj.originalSelectionPath = pj.selectedNodePath;
  }
  sh = tree.shownItem;
  if (sh) {
    if (sh===pj.root) {
      return undefined;
    }
    if (top ) {
      pr = pj.root;
    } else {
      pr = sh.__parent;
      while (!pr.__isSelectable()) {
        pr = pr.__parent;
      }
    }
    return pr;
  }
  return undefined;
}
  
// returns false if at root, true if there is another parent to go
tree.showParent = function (top,force) {
  var sh,pr;
  // are we climbing from a different start point?
  if (!pj.originalSelectionPath || !pj.matchesStart(pj.selectedNodePath,pj.originalSelectionPath)) {
    pj.originalSelectionPath = pj.selectedNodePath;
  }
  sh = tree.shownItem;
  if (sh) {
    if (sh===pj.root) {
      return [false,true];
    }
    if (top ) {
      pr = pj.root;
    } else {
      pr = sh.__parent;
      while (!pr.__isSelectable()) {
        pr = pr.__parent;
      }
    }
    tree.showItemAndChain(pr,"auto");
    return [pr !== pj.root,true];
  }
  return [false,false];
}

tree.showTop = function (force) {
  if (force) {
    tree.showItemAndChain(pj.root,"auto",'noSelect','noName');
  } else {
    tree.showParent(true);
  }
}

tree.refreshTop = function () {
  if (!tree.shownItem || (tree.shownItem === pj.root)) {
    tree.showTop('force');
  }
}
// down the originalSelectionPath - ie undoing showParents
// returns [hasParent,hasChild] 

tree.showChild = function () {
  var sh = tree.shownItem;
  var osp,cp,ln,oln,ci,ch;
  if (!sh) return [false,false];
  osp = pj.originalSelectionPath;
  cp = pj.selectedNodePath;
  if (osp) {
    if (!pj.matchesStart(cp,osp)) {
      pj.originalSelectionPath = undefined;
      return [sh!==pj.root,false];
    }
    ln = cp.length;
    oln = osp.length;
    if (oln === ln) return [true,false];
    ci = ln;
    ch = sh[osp[ci]];
    while ((ci < oln) && ch && !ch.__isSelectable()) {
      ci++;
      ch = ch[osp[ci]];
    }
    if (ch) {
      tree.showItemAndChain(ch,"auto");
      //tree.showProtoChain(ch);
      return [true,ci < (oln-1)];
    }
  }
  return [sh!==pj.root,false];
}

tree.selectionHasChild = function () {
  var osp = pj.originalSelectionPath;
  var cp = pj.selectedNodePath;
  if (!osp || !cp) return false;
  if (cp.length >= osp.length) return false;
  return pj.matchesStart(cp,osp);
}

tree.selectionHasParent = function () {
  var sh = pj.selectedNode;
  return (sh && (sh!==pj.root));
}
   
