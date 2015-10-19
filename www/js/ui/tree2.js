// This code could use reorg/simplification, for clarity
(function (pj) {

  
  var ui = pj.ui;
  var dom = pj.dom;
  var geom  = pj.geom;
  var tree = pj.tree;
  var html = pj.html;
  
  
  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract

  
  
      
  // for widgetlines whose forNode is an Array, check that counts match up on node and widget

  tree.WidgetLine.checkRanges = function () {
    var nd = this.forNode;
    var fsz = this.rangesForSize;
    if (fsz === undefined) {
      var tch = this.treeChildren();
      var rs = tch.length === nd.length;
    } else {
      var rs  = fsz === nd.length;
    }
    pj.log("tree","checked range for",this.id," result=",rs);
    return rs;
  }
  
 
  //  only works and needed on the workspace side, not on protos, hence no ovr
  // showProto shows the __values of __children, as inherited
  
  
  tree.showRef = function (nd,dpysel) {
    var wl = tree.showProtoTop(nd,0);
    tree.setProtoTitle("Reference");
    tree.protoPanelShowsRef = 1;
    wl.expand();
    return wl;
  }
  
  // cause the tree below here to be expanded in the same places as src, when possible. For keeping the main and prototrees in synch 
   
  tree.WidgetLine.expandLike = function (src,ovr) {
    if (src.expanded) {
      this.expand(ovr);
      var nms = src.childrenNames();
      var thisHere = this;
      nms.forEach(function (nm) {
        if (pj.internal(nm)) {
          return;
        }
        var ch = src.treeSelect(nm);
        var mych = thisHere.treeSelect(nm);
        if (mych) {
          var chovr = ovr?ovr[nm]:ovr;
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
    ch.__reExpanding = 1;
    this.expanded = 0;
    this.expand();
    ch.__reExpanding = 0;
  }
  // assure that the __children are visible; unless there are more than tree.WidgetLine.maxChildren.
  //In this case, display only the target
  //  tree.WidgetLine.expand = function (targetName,showTargetOnly) {
  
  tree.WidgetLine.expand = function (ovr,noEdit,__atFrontier) {
    var nd = this.forNode();
    if (!nd) return false;
    //if (nd.__unselectable) return false;
    if (tree.onlyShowEditable && !tree.hasEditableField(nd,ovr)) return false;
    var tp = this.treeTop();
    var isProto = tp.protoTree && (!tree.protoPanelShowsRef);
    var isLNode = pj.Array.isPrototypeOf(nd);
    if (this.expanded) return;
    var el = this.__parent;
    var ch = el.forChildren;
    if (!ch) {
      ch  = html.Element.mk('<div style="margin-left:25px"/>');
      el.addChild("forChildren",ch);
      var newCh = true;
    } else {
      newCh = ch.__reExpanding;
      ch.$show();
    }
      
    tree.nameDec = "_t_";
    // primitive decoration scheme.  ch is an html element. Its children are the html elements for the children of the node it represents
    // These children must be named in a way that does not conflict with ch's properties such style or id.
    // So they are decorated with tree.nameDec ("_t_")
    
    function addLine(ch,nd,k,tc) { // ch = element to add to nd = the parent, k = prop, tc = child
      var dk = tree.nameDec + k;
      if (ch[dk]) return; //already there
      var overriden = ovr && ovr[k];
      var knd = nd.__showInTreeP(k,overriden);
      var options = {addTo:ch,treeTop:tp,property:k};
      if (!knd) {
        return;
      } else if (knd === "node") {
        var ln = tc.__mkWidgetLine(options);
      } else {
        ln = nd.__mkPrimWidgetLine(options);
      }
      if (ln) {
        ch.addChild(dk,ln.__parent);
        if (knd === "prim") ln.updateValue({node:nd});
      }
      return ln;
    }
    
    function addRangeLine(nd,lb,ub,increment) { // nd = the parent, k = prop, tc = child
      var  ln = tree.mkRangeWidgetLine(nd,lb,ub,increment);
      ch.addChild(lb,ln.__parent);
      return ln;
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
    if (this.__range && newCh) {
      var lb = this.lowerBound;
      var ub = this.upperBound;
      var incr = this.increment;
      var incr = incr/10;
      addRanges(nd,lb,ub,incr);
      finishOff(this);
      return;
    }
    var rs = undefined;
    if (newCh) { //new __children
      var toIter =   function (tc,k) {
        addLine(ch,nd,k,tc);
      }   
      if (isLNode) {
        var nln = nd.length;
        var lg10 = Math.floor(Math.log(nln)/Math.log(10));
        var incr = Math.pow(10,lg10);
        if (incr*2 > nln) {
          incr = incr/10;
        }
        addRanges(nd,0,nln-1,incr);
        this.rangesForSize = nln;
      } else {
         var dt =  nd.data;
         if (dt) {
           addLine(ch,nd,"data",dt);
         }
         nd.__iterInheritedItems(toIter,tree.showFunctions,true); // true = alphabetical
      }
       // want prototype in there, though it is not enumerable
    } else {
      ch.$show();
    }
    function finishOff(w){
      w.expanded = 1;
      w.hasBeenExpanded = 1;
      var el = w.__parent;
      var tg = el.main.toggle;
      tg.$html('&#9698;');

    }
    finishOff(this);
    return rs;
  }
  
  tree.WidgetLine.fullyExpand = function (ovr,noEdit,__atFrontier) {
    if (pj.Array.isPrototypeOf(this.forNode)) {
      return;
    }
    this.expand(ovr,noEdit,__atFrontier);
    var ch = this.treeChildren();
    if (ch) {
      ch.forEach(function (c) {
        if (!c.__prim) {
          var cnd = c.forNode;
          var nm = cnd.__name;
          var covr = ovr?ovr[nm]:undefined;
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
    if  (tc && (tc.length)) {
      var c0 = tc[0]; // if any __children are ranges, the first will be
      var rng = c0.__range;
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
  pj.Object.__expandToHere = function () {
    var wd = tree.findWidgetLine(this);
    if (wd && wd.visible()) {
      return;
    }
    var pr = this.__parent;
    pr.__expandToHere();
    // pr might have range kids if pr is an Array
    var pwd = tree.findWidgetLine(this);
    pwd.expand();
    var isLNode = pj.Array.isPrototypeOf(pr);
    if (isLNode) {
      var n = this.__name;
      var cw = pwd;
      while (cw) {
        var cw = cw.findRangeChild(n);
        if (cw) {
          cw.expand();
        }
      }

    }
  }
  
  pj.Array.__expandToHere = pj.Object.__expandToHere;
 
  
  tree.WidgetLine.contract = function () {
    // generates widget lines for the childern
    if (!this.expanded) return;
    var el = this.__parent;
    var ch = el.forChildren;
    ch.$hide();
    this.expanded = false;
    var tg = el .main.toggle;
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
    pj.setProperties(wOptions,options,["forProto","__inWs","__atFrontier"]);
    wOptions.top = 1;
    var ds = tree.dpySelected.instantiate();
    var wline = root.__mkWidgetLine(wOptions);
    ds.draw(div); // interupt the Element tree here
    wline.__parent.draw(div);
    wline.dpySelected = ds;
    return wline;
    
 
  }
 
  pj.Object.__atProtoFrontier = function () { // the next fellow in the prototype chain is outside the ws
    prnd = Object.getPrototypeOf(this);
    return (!prnd.__parent)||(!prnd.__inWs());
  }
  pj.Array.__atProtoFrontier = function () {
    return false;
  }
  
  tree.protoLines = [];
  //n = nth in  proto chain.
  // ovr is an object with __properties k:1 where k is overriden further up the
  // chain, or k:covr , where covr is the ovr tree for prop k
  tree.showProto = function (prnd,k,n,ovr) {
    var __inWs = prnd.__inWs();
    if (__inWs) {
      var atF =  !(Object.getPrototypeOf(prnd).__inWs());
    } else {
      atF = false;
    }
    var wl = tree.showProtoTop(prnd,atF,__inWs,ovr);
    tree.protoTops.push(wl);
    tree.tops.push(wl);
    wl.expandLike(tree.mainTop,ovr);
  }
  tree.showWsOnly = 1;
  
  tree.showProtoChain = function (nd,k) {
    tree.protoPanelShowsRef = 0;
    tree.protoState = {nd:nd,k:k}
    tree.setProtoTitle("Prototype Chain");
    if (tree.protoDivRest) tree.protoDivRest.$empty();
    tree.protoTops = [];
    tree.tops = [tree.mainTop];
    var cnd = nd;
    var n = 0;
    var ovr = {}; 
    // ovr is a tree structure which contains, hereditarily, the __properties set in the node nd,, rather than the prototype prnd
    // in other words, ovr shows what is overriden
    function addToOvr(nd,prnd,ov) {
      var op = Object.getOwnPropertyNames(nd);
      op.forEach(function (p) {
        var v = nd[p];
        var pv = prnd[p];
        
        if (pj.isAtomic(v)||(typeof v === "function")) {
          ov[p] = 1;
        } else if (pj.treeProperty(nd,p)) {
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
    var __inWs = true;
    while (true) {
      var prnd = Object.getPrototypeOf(cnd);
      if ((!prnd.__parent)||(prnd === cnd)) {
       return;
      }
      var atF = __inWs && (!prnd.__inWs());
      if (atF) {
        if (tree.showWsOnly) {
          return; 
        }
        tree.protoDivRest.push(html.Element.mk("<div style='margin-top:10px;margin-bottom:10pt;width:100%;height:2px;color:white;background-color:red'>_</div>"));
        tree.protoDivRest.push(html.Element.mk("<div style='font-size:8pt'>The prototypes below are outside the workspace and cannot be edited</div>"));
        __inWs = false;
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
    if (top) {
      if (nd === pj.root) {
        var ntu = "ws";
        //var ntu = tree.pathToTerm([],1);
      } else {
        var rp = pj.xpathOf(nd,pj.root);
        if (rp) {
          ntu = tree.pathToTerm(rp,1);
        } else {
          pj.error('unexpected');
          //ntu = tree.pathToTerm(nd.__pathOf());
        }
      }
    } else {
      ntu = nm;
    }
    var  tpn=nd.__protoName();
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
  
  tree.showProtosInObDiv = 1;
  
  tree.adjustingThePrototype = 1;
  
    tree.showProtoTop = function (o,__atFrontier,__inWs,ovr) {
      var subdiv = tree.protoSubDiv.instantiate();
      if (tree.showProtosInObDiv) {
        var divForProto = tree.obDiv;
        var thisProto = html.Element.mk('<span>Prototype</span>');;
        //subdiv.addChild(html.Element.mk('<div>Prototype</div>'));
         subdiv.addChild(thisProto);
         var adjusting = 0;
         if (ui.whatToAdjust === o) {
           thisProto.addChild(html.Element.mk('<span style="padding-left:10px;font-style:italic">Adjusting this:</span>'));
           adjusting = html.Element.mk('<input style="position:relative;top:3px" type="checkbox" />');
           subdiv.addChild(adjusting);
         //adjusting.__element.checked = true;
          tree.adjustingPrototype = adjusting;
         }
      } else {
        divForProto = tree.protoDivRest;
      }
      divForProto.addChild(subdiv);
      //tree.protoDivRest.addChild(subdiv);
      subdiv.draw();
      if (adjusting) {
         adjusting.__element.checked = 1;// ui.protoToAdjust === o;
         adjusting.$change(function (x) {
          tree.setWhatToAdjust(adjusting.__element.checked?'proto':'selected');
        });
        tree.setWhatToAdjust('proto');
      }
      var clickFun = function (wl) {
         pj.log("tree","CLICKKK ",wl);
        wl.selectThisLine("tree");
      }
      var rs = tree.attachTreeWidget({div:subdiv.__element,root:o,__atFrontier:__atFrontier,__inWs:__inWs,forProto:true});
      rs.protoTree = 1;
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
    tree.obDivRest.$empty();
    var tr = tree.attachTreeWidget({div:tree.obDivRest.__element,root:root,clickFun:clickFun,textFun:tree.shapeTextFun});
    if (tree.mainTop) {
      var mtop = tree.mainTop;
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
    if (nd.__parent) {
      var nm = nd.__name;
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

  tree.setWhatToAdjust = function (ivl) {
    var node = pj.selectedNode;
    var vl = (node.inheritsAdjustment())?ivl:'selected';
    tree.adjustingPrototype.__element.checked = vl === 'proto';
    tree.adjustingSelected.__element.checked = vl === 'selected';
    if (vl === 'proto') {
      ui.whatToAdjust  = Object.getPrototypeOf(node);
    } else {
      ui.whatToAdjust = node;    
    }
    ui.nowAdjusting = vl;
  }

  tree.showItem = function (itm,mode,noSelect) {
    tree.shownItem = itm;
    if (!itm) {
      return;
    }
    var tpn = itm.__protoName();
    tree.obDivRest.$empty();
    var notog = 0 && mode==="fullyExpand";
    var subdiv = tree.protoSubDiv.instantiate();
    tree.obDivRest.addChild(subdiv);
    if (ui.nowAdjusting) {
      var sitem = subdiv.addChild(html.Element.mk('<span>Selected Item. </span>'));
      sitem.addChild(html.Element.mk('<span style="padding-left:10px;font-style:italic">Adjusting this:</span>'));
      //if (ui.isProtoToAdjust) {
      var adjusting = html.Element.mk('<input style="position:relative;top:3px" type="checkbox" />');
      tree.adjustingSelected = adjusting;
      sitem.addChild(adjusting);
      adjusting.$change(function (x) {
        tree.setWhatToAdjust(adjusting.__element.checked?'selected':'proto');
      });
    }
    var tr = tree.attachTreeWidget({div:subdiv.__element,root:itm,textFun:tree.shapeTextFun,noToggle:notog});
    tree.mainTop = tr;
    tr.noToggle = notog;
    tr.isShapeTree = 1;
    tree.tops = [tr];
    var atf = itm.__atProtoFrontier();
    if (mode==="fullyExpand") {
      tr.fullyExpand(undefined,false,atf);
    } else if (mode==="expand") {
      tr.expand(undefined,false,atf);
    }  else if (mode ==="auto") {
      tr.fullyExpandIfSmall(undefined,false,atf);

    }
    tree.mainTree = tr;
    if (!noSelect) itm.__select('tree');
    subdiv.draw();
    if (adjusting) {
      adjusting.__element.checked = !ui.protoToAdjust;
    }
    
  }
  
  tree.refresh = function () {
    var shownItem = tree.shownItem;
    if (shownItem) {
      tree.showItem(shownItem,'auto',1);
      tree.showProtoChain(shownItem);

    }
  }
  
  // returns false if at root, true if there is another parent to go
  tree.showParent = function (top) {
    // are we climbing from a different start point?
    if (!pj.originalSelectionPath || !pj.matchesStart(pj.selectedNodePath,pj.originalSelectionPath)) {
      pj.originalSelectionPath = pj.selectedNodePath;
    }
    var sh = tree.shownItem;
    if (sh) {
      if (sh===pj.root) {
        return [false,true];
      }
      if (top ) {
        var pr = pj.root;
      } else {
        var pr = sh.__parent;
        while (!pr.__isSelectable()) {
          pr = pr.__parent;
        }
      }
      tree.showItem(pr,"auto");
      tree.showProtoChain(pr);
      return [pr !== pj.root,true];
    }
    return [false,false];
  }
  
  tree.showTop = function () {
    tree.showParent(1);
  }
  // down the originalSelectionPath - ie undoing showParents
    // returns [hasParent,hasChild] 

  tree.showChild = function () {
    var sh = tree.shownItem;
    if (!sh) return [false,false];
    var osp = pj.originalSelectionPath;
    var cp = pj.selectedNodePath;
    if (osp) {
      if (!pj.matchesStart(cp,osp)) {
        pj.originalSelectionPath = undefined;
        return [sh!==pj.root,false];
      }
      var ln = cp.length;
      var oln = osp.length;
      if (oln === ln) return [true,false];
      var ci = ln;
      var ch = sh[osp[ci]];
      while ((ci < oln) && ch && !ch.__isSelectable()) {
        ci++;
        var ch = ch[osp[ci]];
      }
      if (ch) {
        tree.showItem(ch,"auto");
        tree.showProtoChain(ch);
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
   

//end extract

  
  
})(prototypeJungle);

