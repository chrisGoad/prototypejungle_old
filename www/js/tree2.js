// This code could use reorg/simplification, for clarity
(function (__pj__) {

  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom  = __pj__.geom;
  var draw = __pj__.draw;
  var page = __pj__.page;
  var tree = __pj__.tree;
  // adjust version 2
  
  
  // fixup the correspondences between nodes and widgetlines; updates usually rebuild the node side, so this is needed
  // after each update
  
  // First, blow away all the pointers (forNode, and widgeDiv) in either direction.
  // Then walk the node trees in depth first order in parallel.
  //  for each node look for its corresponding fellow on the widget side
  // if it is missing, mark the widget parent with __mismatch__ =1
  // Finally walk the widget tree, rexpanding mismatches. In all of this we skip over the range nodes.
  
 
  // top level
  
  tree.adjust = function () {
    return;
    var tm = Date.now();
    var topnd = draw.wsRoot;
    topnd.removeWidgetPointers();
    if (tree.mainTop) {
      tree.mainTop.removeNodePointers();
      topnd.adjust2(tree.mainTop);
      tree.mainTop.reexpandMismatches();
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
    if (src.expanded) {
      this.expand();
      var nms = src.childrenNames();
      var thisHere = this;
      nms.forEach(function (nm) {
        var ch = src.treeSelect(nm);
        var mych = thisHere.treeSelect(nm);
        if (mych) {
        //  ch.__protoLine__ = mych;
          mych.expandLike(ch);
        }
      });
    } else {
      this.contract();
    }
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
   //   var plineOf = nd.__protoLine__;
    }
    var isLNode = om.LNode.isPrototypeOf(nd);
    if (this.expanded) return; 
    var ch = this.selectChild("forChildren");
    if (!ch) {
      ch  = dom.El({tag:"div",style:{"margin-left":"25px"}});
      this.addChild("forChildren",ch);
      var newCh = true;
    } else {
      newCh = ch.__reExpanding__;
      ch.show();
    }
      
    
    
    function addLine(ch,nd,k,tc) { // ch = jq element to add to nd = the parent, k = prop, tc = child
      if (k === "adjustScaling") {
        debugger;
      }
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
     var ws = __pj__.draw.wsRoot;
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
      var tg = w.cssSelect('#main>#toggle');
      tg.__element__.html('&#9698;');

    }
    finishOff(this);
  //  if (!isProto) this.expandProtoChain();
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
    if (tsz <= tree.fullyExpandThreshold) {
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
    obsolete();
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
    obsolete();
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
    var tg = this.cssSelect('#main>#toggle');
  //  tg.__element__.html('&#9698;');
    tg.__element__.html('&#9655;');

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
    obsolete();
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
    obsolete();
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
  
  
  
  tree.applyToTops = function (fn,except) {
    var tops = tree.tops;
    tops.forEach(function (tp) {
      if (tp  !== except) {
        fn(tp);
      }
    });
  }
  
  
  
  tree.WidgetLine.applyToProto = function (fn) {
    obsolete();
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
  
  tree.WidgetLine.applyToProtoChain = function (fn) {
    obsolete();
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
    
  tree.WidgetLine.expandProtoChain = function () {
    obsolete();
    this.applyToProtoChain(function (wl) {
      wl.expand();
    });
  }
  tree.WidgetLine.expandProtoChain = function () {
    obsolete();
    this.applyToProtoChain(function (wl) {
      wl.expand();
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
   
    //var tg = this.cssSelect('#main>#toggle');
    if (this.expanded) {
      this.contract();
    //  tg.__element__.html('&#x25BA;');
      //tg.__element__.html('&#9655;');
    } else {
     // tree.adjust();
      this.expand();
    }
    tree.expandTopsLike(this);
   
  }
  om.LNode.expandWidgetLine = om.DNode.expandWidgetLine;
  om.LNode.contractWidgetLine = om.DNode.contractWidgetLine;
  om.LNode.toggleWidgetLine =  om.DNode.toggleWidgetLine;
   
  tree.attachTreeWidget = function (options) {
    debugger;
    var div = options.div;
    var root = options.root;
    //var clickFun = options.clickFun;
    //var textFun = options.textFun;
    var pth = "pj."+options.root.pathOf().join(".").substr(2);
    var pathLine = dom.El({tag:"div",html:pth,id:"pathLine",style:{"font-size":"10pt","padding-right":"20px",color:"black"}});
    pathLine.install(div);
    
    var wOptions = om.DNode.mk();
    
    wOptions.setProperties(options,["forProto","inWs","atFrontier"]);
    wOptions.top = 1;
    //var forProto = options.forProto;
    //var inWs = 
    //var noToggle = options.noToggle;
    var ds = tree.dpySelected.instantiate();
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
      //prnd.__protoLine__ = wl; // gives the correspondence between main tree, and proto tree
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
  tree.pathToTerm = function (pth,fromRoot) {
    var rs = "pj";
    pth.forEach(function (p) {
      if (p === "/") {
        return;
      }
      if (typeof p === "string") {
        rs += "."+p;
      } else {
        rs += "["+p+"]";
      }
    });
    return rs;
  }
  
  tree.withTypeName = function (nd,nm,top) {
    if (top) {
      if (nd === om.root) {
        var ntu = tree.pathToTerm([],1);
      } else {
        var rp = nd.pathOf(om.root);
        if (rp.length > 0) {
          ntu = tree.pathToTerm(rp,1);
        } else {
          ntu = tree.pathToTerm(nd.pathOf());
        }
      }
    } else {
      ntu = nm;
    }
    var  tpn=nd.protoName();
    if (tpn === "DNode" || ntu === tpn) {
      return ntu;
    } else {
      return ntu+ " : " + tpn;
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
      var rs = tree.attachTreeWidget({div:subdiv.__element__,root:o,atFrontier:atFrontier,inWs:inWs,forProto:true});
      rs.protoTree = 1;
      return rs;
    
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
    if (tree.mainTop) {
      //tree.tops = [tree.mainTop];
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
  
  
  tree.excludeFromProtos = {om:1,fileTree:1,jqPrototypes:1,lightbox:1,geom:1,mainPage:1,top:1,trees:1,draw:1};
 
  tree.initShapeTreeWidget = function () {
    tree.attachShapeTree(om.root);
    tree.mainTop.expand();
    tree.showProtoChain(om.root);

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
    tree.mainTop.expand();
  }
  
  
  
  tree.showItem = function (itm,mode) {
    tree.shownItem = itm;
    if (!itm) {
      return;
    }
    //var pth = om.pathToString(itm.pathOf(om.root),".");
    var tpn = itm.protoName();
    if (0 && itm.selectable) {
      tree.noteDiv.show();
      tree.noteDiv.setHtml("You can select the parts of this <span style='color:red'>"+tpn+"</span> by clicking on them");
    } else {
      //tree.noteDiv.hide();
    }
    tree.obDivRest.empty();
    var notog = 0 && mode==="fullyExpand";
    var tr = tree.attachTreeWidget({div:tree.obDivRest.__element__,root:itm,textFun:tree.shapeTextFun,noToggle:notog});
    tree.mainTop = tr;
    tr.noToggle = notog;
    tr.isShapeTree = 1;
    tree.tops = [tr];
    var atf = itm.atProtoFrontier();
    if (mode==="fullyExpand") {
      tr.fullyExpand(undefined,false,atf);
    } else if (mode==="expand") {
      tr.expand(undefined,false,atf);
    }  else if (mode ==="auto") {
      tr.fullyExpandIfSmall(undefined,false,atf);

    }
    tree.mainTree = tr;
    itm.select('tree');
    
  }
  // om.originalSelectionPath is the path before any show parents
  
  // returns false if at root, true if there is another parent to go
  tree.showParent = function (top) {
    // are we climbing from a different start point?
    if (!om.originalSelectionPath || !om.matchesStart(om.selectedNodePath,om.originalSelectionPath)) {
      om.originalSelectionPath = om.selectedNodePath;
    }
    var sh = tree.shownItem;
    if (sh) {
      if (sh===om.root) {
        return [false,true];
      }
      if (top ) {
        var pr = om.root;
      } else {
        var pr = sh.__parent__;
      //while (om.LNode.isPrototypeOf(pr)) {
        while (!pr.isSelectable()) {
          pr = pr.__parent__;
        }
      }
      tree.showItem(pr,"auto");
      tree.showProtoChain(pr);
      return [pr !== om.root,true];
      //if (pr === om.root) page.upBut.hide();
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
    var osp = om.originalSelectionPath;
    var cp = om.selectedNodePath;
    if (osp) {
      if (!om.matchesStart(cp,osp)) {
        om.originalSelectionPath = undefined;
        return [sh!==om.root,false];
      }
      var ln = cp.length;
      var oln = osp.length;
      if (oln === ln) return [true,false];
      var ci = ln;
      var ch = sh[osp[ci]];
      while ((ci < oln) && ch && !ch.isSelectable()) {
        ci++;
        var ch = ch[osp[ci]];
      }
      if (ch) {
        tree.showItem(ch,"auto");
        tree.showProtoChain(ch);
        return [true,ci < (oln-1)];
      }
    }
    return [sh!==om.root,false];
  }
  
  tree.selectionHasChild = function () {
    var osp = om.originalSelectionPath;
    var cp = om.selectedNodePath;
    if (!osp || !cp) return false;
    if (cp.length >= osp.length) return false;
    return om.matchesStart(cp,osp);
  }
  
  tree.selectionHasParent = function () {
    var sh = om.selectedNode;
    return (sh && (sh!==om.root));
  }
   

  
  
})(prototypeJungle);

