(function () {
  var om = __pj__.om;
  var dom = __pj__.dom;
  var draw = __pj__.draw;
  __pj__.set("tree",om.DNode.mk());
  var tree = __pj__.tree;
  om.inspectEverything = 1;
  tree.includeFunctions = 1;
  tree.onlyShowEditable = 0;
  
  tree.installType("TreeWidget");
  
  tree.newTreeWidget = function (o) {
    this.setProperties(o,["textProto","rootPos"]);
  }
  // ground level operators
  
  var jqp = __pj__.jqPrototypes;
  var mpg = __pj__.mainPage;
  
  tree.installType("WidgetLine",Object.create(dom.JQ));
  tree.valueProto = dom.newJQ({tag:"span",style:{"font-weight":"bold"}});
  
  tree.newWidgetLine = function (o) {
    return dom.newJQ(o,tree.WidgetLine);
  }

  var wline = jqp.set("widgetLine", tree.newWidgetLine({tag:"div",style:{"font-size":"10pt",color:"black",width:"100%"}}));
  var mline =  wline.addChild("main",dom.newJQ({tag:"div",style:{}}));
  mline.addChild("toggle",dom.newJQ({tag:"span",html:"&#x25BA;",cursor:"pointer",style:{color:"black"}}));
        
  mline.addChild("theName",dom.newJQ({tag:"span",style:{color:"black"}}));
  om.mline = mline; // for debugging
  tree.wline = wline;
  
    var dpySelected = dom.newJQ({tag:"div",style:{color:"black"}})

    var protoBut = jqp.set("protoButton", tree.newWidgetLine({tag:"span",html:"proto",style:{color:"black",width:"100px"}}));

  
  om.DNode.mkWidgetLine = function (ownp,clickFun,textFun,forProto,top) {
    var ww = wline; // for debugging
    var rs = wline.instantiate();
    var m = rs.selectChild("main");
    if (forProto) {
      var tg = m.selectChild("toggle");
      tg.hide();
    }
      rs.hoverInn = function() {
      console.log("hoverin",rs);m.__element__.css("background-color","magenta");
              draw.refresh();

    }
    rs.hoverOutt = function() {
      console.log("hoverin",rs);m.__element__.css("background-color","white");
              draw.refresh();

    }
    if (top) {
      var pth = om.pathOf(this,__pj__);
      var txt = pth?pth.join("."):"";
    } else {
      txt = textFun(this);
    }
    
    var thisHere = this;
    var cl = function () {
      rs.toggle();
     
    };
    if (clickFun) {
      var cl2 = function () {
        clickFun (rs);
      }
    }
    if (!forProto) {
      var tspan = m.selectChild("toggle");
      tspan.set("click",cl);
      if (this.__leaf__) tspan.html = " ";
    }
    var nspan = m.selectChild("theName");
    nspan.html = txt;
    var hp = this.hasTreeProto();
    
    var clr = "black";
    nspan.style.color = clr;
    if (cl2) nspan.click = cl2;
 
    if (!forProto) this.widgetDiv = rs;
    rs.forNode = this;
    return rs;
  }
  
  
  
  
  tree.WidgetLine.treeChild = function (id) {
    var fc = this.selectChild("forChildren");
    if (fc) return fc.selectChild(id);
    return undefined;
  }
  
  
  tree.WidgetLine.treeChildren = function (i) {
    var fc = this.selectChild("forChildren");
    if (fc) return fc.theChildren;
    return undefined;
  }
  
  tree.WidgetLine.treeParent = function() {
    var pr = this.parent();
    if (pr) {
      return pr.parent();
    }
    return undefined;
  }
  
  tree.WidgetLine.selectTreePath = function (pth) {
    var cv = this;
    var ln = pth.length;
    for (var i=0;i<ln;i++) {
      var cv = cv[pth[i]]
      if (!cv) return undefined;
    }
    return cv;
  }

  
  tree.WidgetLine.treeParent = function () {
    return this.parent().parent(); // the forChildren node intervenes in the ancestry chain
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
  
  // selectChild is at the JQ level. this is at the tree level
  tree.WidgetLine.treeSelect = function (nm) {
    if (this.__prim__) return undefined;
    var fc = this.selectChild("forChildren");
    if (fc) {
      var tc = fc.theChildren;
      var ln = tc.length;
      for (var i=0;i<ln;i++) {
        var c = tc[i];
        var id = c.id;
        if (id == nm) {
          return c;
        }
      };
    }
    return undefined;
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
  
  tree.WidgetLine.selectThisLine = function (src) { // src = "canvas" or "tree"
    if (this.__selected__) return;
    var tp = this.treeTop();
    var isProto = tp.protoTree; // is this the prototype panel?
    var isFileTree = tp.fileTree; // is this the file tree
    var isShapeTree = !(isProto || isFileTree);
    var drawIt = ((!isFileTree) && (src == "tree"));
    if (isShapeTree) tree.clearProtoTree();
    var ds = tp.dpySelected;
    var nd = this.forNode;
    var prnd = this.forParentNode;
    var prp = this.forProp;
    var vse = []; //visible effects
    if (tree.setNote) {
      var nt = "";
      if (prnd) {
        var nt = prnd.getNote(prp);
      }
      tree.setNote(nt);
    }
    if (isProto) {
      if (nd) {
        var p = om.pathOf(nd,__pj__)
        var ps = p.join(".");
        //ds.__element__.html(ps);
        if (drawIt) vse = nd.visibleProtoEffects();
      } else {
        if (0 && drawIt) vse = prnd.visibleProtoEffects(prp);// don't do the highlighting anymore in this case
      }
    } else if (isShapeTree) { // for right now
      if (nd) {
        var relnd = nd;
      } else {
        relnd = prnd;
      }
      if (nd) {

        var dan = relnd.drawnAncestor();
        if (dan) {
          vse = [dan];
        } else {
          vse = relnd.drawnDescendants();
        }
        }
    }
    var sl = tp.__selectedLine__;
    //var proto = tp.protoTree; // is this the prototype panel?
    var cntr = tp.__element__.parent().parent();
    this.__selected__ = 1;
    if (sl) sl.unselectThisLine();
    var el = this.highlightedPart().__element__;
    el.css({"background-color":"rgb(100,140,255)"});
    tp.__selectedLine__ = this;
      
    // take  care of scrolling
    var cht = cntr.height();
    var coffy = cntr.offset().top;
    console.log("offset ",el.offset());
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
    
    
    if (isShapeTree) { // show the prototype in its panel
      if (this.__prim__) {
        tree.showProtoChain(this.forParentNode,this.forProp)
      } else if (this.__ref__) {
        tree.showRef(this.forNode);
      } else {
        tree.showProtoChain(this.forNode);
        if (this.expanded) {
          this.expandProtoChain();
        }
      }
    }
    if (drawIt) draw.mSelect(vse);
    
    
  }
  
  tree.WidgetLine.ancestorIsSelected = function () {
    if (this.__selected__) return 1;
    var pr = this.treeParent();
    if (!pr) return 0;
    return pr.ancestorIsSelected();
  }

  
  function showFunction(f,pth)  {
    var s = f.toString();
    //var fm = om.formatFunction(s);
    var lb = __pj__.mainPage.lightbox;
    lb.pop();
    lb.setTopline(pth + " = ");
    var ssp = s.split("\n");
    var ht = "";
    // add html escaping
    ssp.forEach(function (ln) {
      var spln = ln.replace(/ /g,"&nbsp;")
      ht += "<div>"+spln+"</div>";
    })
    lb.setHtml(ht);   
  }
  // showProto shows the values of children, as inherited
  
  
  tree.showRef = function (nd,dpysel) {
    var wl = tree.showProtoTop(nd,0);
    tree.setProtoTitle("Reference");
    //var wl = tree.showProtoTree(nd);
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
  
  
  
  tree.WidgetLine.applyToProtoChain = function (fn) {
    var cnd = this.forNode;
    while (true) {
      var cnd = Object.getPrototypeOf(cnd);
      var pline = cnd.__protoLine__;
      if (pline) {
        fn(pline);
      } else  {
        return;  
      }
      //code
    }
  }
  
  tree.WidgetLine.expandProtoChain = function () {
    this.applyToProtoChain(function (wl) {
      wl.expand();
    });
  }
  
  tree.WidgetLine.contractProtoChain = function () {
    this.applyToProtoChain(function (wl) {wl.contract()});
  }
    
  om.LNode.mkWidgetLine = om.DNode.mkWidgetLine;
  
  var hiddenProperties = {__record__:1,__isType__:1,__record_:1,__externalReferences__:1,__selected__:1,__selectedPart__:1};
  
  tree.hasEditableField = function (nd,overriden) { // hereditary
    for (var k in nd) {
      if ((!om.internal(k))&&(!hiddenProperties[k])) {
        var ch = nd[k];
        if (typeof ch == "function") continue;
        var chovr = undefined;
        if (overriden) {
          var chovr = overriden[k];
        }
        var isn = om.isNode(ch);
        if (isn) {
          var che = tree.hasEditableField(ch,chovr);
          if (che) return true;
        } else if ((!chovr) && (!nd.setBy(k))) {
          return true;
        }
      }
    }
    return false;
  }
  
  tree.mkPrimWidgetLine = function (nd,k,v,clickFun,isProto,overriden,noEdit) { // for constants (strings, nums etc).  nd is the node whose property this line displays
    var setby = nd.setBy(k);
    //var atFrontier = isProto && (nd.atProtoFrontier());
    var atFrontier = nd.atProtoFrontier();
    var ownp = nd.hasOwnProperty(k);
    var prnd = nd;
      // if this is outside the tree, then don't display this; this is now 
    if ((!prnd.__parent__)||om.inStdLib(prnd)) return;
    // functions are never displayed except with the node that owns them
    var v = nd[k];
    
    if (((typeof v == "function")) && (!ownp)) {
      return;
    }
    var cl = "black";
    var rs = tree.newWidgetLine({tag:"div",style:{color:cl}});
    rs.__prim__ = 1;
    rs.forParentNode = nd;
    rs.forProp = k;
    var isFun = typeof v == "function";
    var txt = k;
    //if (!ownp) txt = k + " inherited: ";
    var sp =  dom.newJQ({tag:"span",html:txt,style:{color:cl}});
    
    rs.addChild("title",sp);
    if (clickFun) {
      var cl2 = function () {
        clickFun (rs);
      }
      rs.click = cl2;
    }
    if (isFun) {
      if (!tree.showFunctions) return;
      var funBut =  jqp.button.instantiate();
      funBut.html = " Function ";
      rs.addChild("funb",funBut);
      var pth = om.pathToString(nd.pathToAncestor(__pj__).concat(k),".");
      funBut.click = function () {showFunction(v,pth)};
    } else {     
      var vts = (ownp||atFrontier)?v:"inherited";
      if (tree.onlyShowEditable && (setby || overriden)) {
        return undefined;
      }
      if (setby) {
        vts = "computed";
      }
      if (overriden) {
        vts = "overriden";
      }
      if (noEdit || setby || overriden) {
        if (!tree.showNonEditable) return;
        var inp = tree.valueProto.instantiate();
        inp.html = " "+vts;
      } else {
        var inp = dom.newJQ({tag:"input",type:"input",attributes:{value:vts},style:{width:"100px","background-color":"white","margin-left":"10px"}});
          var blurH = function () {
          var vl = inp.__element__.attr("value");
          if (vl == "inherited") return;
          var n = nd;
          var isnum = typeof v == "number";
          if (isnum) {
            var nv = parseFloat(vl); // @todo check this input, and deal with the real case
          } else {
            nv = vl;
          }
          nd[k] = nv;
          draw.refresh();
        }
        inp.blur = blurH;
        var focusH = function () {
          rs.selectThisLine("tree");
        };
        inp.enter = blurH;
      }
      rs.addChild("val",inp);
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
  
    
  tree.mkRefWidgetLine = function (top,k,v) { // for constants (strings, nums etc).  nd is the node whose property this line displays
    var rf = om.refPath(v,top);
    if (!rf) return undefined;
    var cl = "black";
    var rs = tree.newWidgetLine({tag:"div",style:{color:cl}});
    rs.forNode = v;
    var sp =  dom.newJQ({tag:"span",html:k + " REF "+rf,style:{color:cl}});
    rs.addChild("ttl",sp);
    rs.click = function () {
      rs.selectThisLine("tree");
    }
    rs.__ref__ =1;
    return rs;
  }
  
  
  tree.WidgetLine.visible = function () {
    if (this.__treeTop__) return true;
    var pr = this.treeParent();
    return pr.visible() && pr.expanded;
  }
  
  
  // assure that the children are visible; unless there are more than tree.WidgetLine.maxChildren. In this case, display only the target
//  tree.WidgetLine.expand = function (targetName,showTargetOnly) {
  tree.WidgetLine.expand = function (ovr,noEdit) {
    var nd = this.forNode;
    if (tree.onlyShowEditable && !tree.hasEditableField(nd,ovr)) return false;
    var tp = this.treeTop();
    var isProto = tp.protoTree; // is this the prototype panel?
    var fileTree = tp.fileTree;
    if (isProto) {
      var plineOf = nd.__protoLine__;
    }
    var isLNode = om.LNode.isPrototypeOf(nd);
    if (this.expanded) return; 
    var ch = this.selectChild("forChildren");
    if (!ch) {
      ch  = dom.newJQ({tag:"div",style:{"margin-left":"20px"}});
      this.addChild("forChildren",ch);
      var newCh = true;
    } else {
      newCh = false;
      ch.show();
    }
    
    
    
    function addLine(ch,nd,k,tc) { // ch = jq element to add to nd = the parent, k = prop, tc = child
      if (hiddenProperties[k]) return;
      var isnd = om.isNode(tc);
      if (isnd && !nd.treeProperty(k)) {
        if (!nd.hasOwnProperty(k)) return;
        var ln = tree.mkRefWidgetLine(tp.forNode,k,tc);
      } else if (isnd) {
        if (tree.onlyShowEditable && (!tree.hasEditableField(nd[k],ovr?ovr[k]:undefined))) return;
        var ln = tc.mkWidgetLine(true,tp.__clickFun__,tp.__textFun__,isProto);
      } else {
        var overriden = ovr && ovr[k];
        ln = tree.mkPrimWidgetLine(nd,k,tc,tp.__clickFun__,isProto,overriden,noEdit);
      }
      if (ln) ch.addChild(k,ln);
      return ln;
    }
    
    function addRangeLine(nd,lb,ub,increment) { // nd = the parent, k = prop, tc = child
      var  ln = tree.mkRangeWidgetLine(nd,lb,ub,increment);
      ch.addChild(k,ln);
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
    if (this.__range__ && newCh) {
      var lb = this.lowerBound;
      var ub = this.upperBound;
      var incr = this.increment;
      var incr = incr/10;
      addRanges(nd,lb,ub,incr);
      finishOff(this);
      return;
    }
    rs = undefined;
    if (newCh) { //new children
      if (this.__multiRoot__) {
        for (var k in nd) {
          if (nd.hasOwnProperty(k) && (k!="widgetDiv") && (!om.internal(k))) {
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
        } else {
           nd.iterInheritedItems(toIter,tree.includeFunctions);
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
  
  tree.WidgetLine.fullyExpand = function (ovr,noEdit) {
    this.expand(ovr,noEdit);
    var ch = this.treeChildren();
    if (ch) {
      ch.forEach(function (c) {
        if (!c.__prim__) {
          var cnd = c.forNode;
          var nm = cnd.__name__;
          var covr = ovr?ovr[nm]:undefined;
          c.fullyExpand(covr,noEdit);
        }
      });
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
      if (cnd.widgetDiv) return {node:cnd,path:pth};
      pth.unshift(cnd.__name__);
      cnd = om.getval(cnd,"__parent__");
      if (!cnd) return undefined;
      
     }
  }
  
  om.DNode.ancestorBelow = function (nd) {
    var pr = om.getval(this,"__parent__")
    if (!pr) return undefined;
    if (pr == nd) return this;
    return pr.ancestorBelow(nd);
  }
  // this adds a DNode into the widget tree structure. There are two cases
  // If this's parent is in the tree, then whichTree is not needed
  // ow, the node is being added to a multiRoot, given by whichTree.
  // this is for the protos, which are rooted at i.
  
  
  om.DNode.addWidgetLine = function (whichTree) {
    if (this.widgetDiv) return ; //already done
    var pth = om.pathOf(this,__pj__);
    var aww = this.ancestorWithWidgetLine();
    if (whichTree) {
      var top = whichTree;
    } 
    if (whichTree && !aww) { // no ancestor is yet added to the widget tree; add an ancestor to the top level
        var nd = whichTree.forNode;
        var ab = this.ancestorBelow(__pj__);
        nd[ab.__name__] = ab;
        var ch = whichTree.selectChild("forChildren");
    
    } else {
      var pth = aww.path;
      var nd = aww.node;
      var wd = nd.widgetDiv;
      top = wd.treeTop();
      var p0 = pth[0];
      ch = wd.selectChild("forChildren");
    }
    if (!ch) return; // never been expanded;
    var ln = this.mkWidgetLine(true,top.__clickFun__,top.__textFun__);
    ch.addChild(this.__name__,ln);
    ln.install(); 
  }

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

    //pwd.expand(this.__name__);
  }
  
  om.LNode.expandToHere = om.DNode.expandToHere;
 
  
  tree.WidgetLine.contract = function () {
    // generates widget lines for the childern
    if (!this.expanded) return;
    var ch = this.selectChild("forChildren");
    ch.hide();
    this.expanded = false;
    this.contractProtoChain();
  }
  
  
  
  tree.WidgetLine.toggle = function () {
   
    var tg = this.cssSelect('#main>#toggle');
    if (this.expanded) {
      this.contract();
      tg.__element__.html('&#x25BA;');
    } else {
      this.expand();
      var nd = this.forNode;
      tg.__element__.html('&#x25BC;');
    }
  }
  om.LNode.expandWidgetLine = om.DNode.expandWidgetLine;
  om.LNode.contractWidgetLine = om.DNode.contractWidgetLine;
  om.LNode.toggleWidgetLine =  om.DNode.toggleWidgetLine;
  
  
  tree.attachTreeWidgets = function (div,roots,clickFun,textFun,multiRoot,forProto) {
     var lnr = roots.length;
    if (multiRoot) {
      // make a fake DNode (one which is not the parent of its children)
      var rnd = om.DNode.mk();
      roots.forEach(function (v) {
        rnd[v.__name__] = v;
      });
    } else {
      rnd = roots[0];
    }
    var ds = dpySelected.instantiate();
    var wline = rnd.mkWidgetLine(true,clickFun,textFun,forProto,true);
    wline.__treeTop__ = 1;
    wline.__multiRoot__ = multiRoot;
    ds.install(div); // interupt the JQ tree here
    wline.install(div);
    wline.__clickFun__ = clickFun;
    wline.__textFun__ = textFun;
    wline.dpySelected = ds;
    return wline;
    
 
  }
  
  tree.attachTreeWidget = function (div,root,clickFun,textFun,forProto) {
     return tree.attachTreeWidgets(div,[root],clickFun,textFun,false,forProto);
  }
  
  om.DNode.atProtoFrontier = function () { // the next fellow in the prototype chain is outside the ws
    prnd = Object.getPrototypeOf(this);
    return (!prnd.__parent__)||(!prnd.inWs());
  }
  
  
  //n = nth in  proto chain.
  // ovr is an object with properties k:1 where k is overriden further up the chain, or k:covr , where covr is the ovr tree for prop k
  tree.showProto = function (prnd,k,n,ovr,noEdit) {
    var p = om.pathOf(prnd,__pj__);
    var p0 = p.shift();
    var cnd = __pj__[p0];
     var wl = tree.showProtoTop(prnd,n);
    var swl = prnd.widgetDiv;
    prnd.__protoLine__ = wl; // gives the correspondence between main tree, and proto tree
    wl.fullyExpand(ovr,noEdit);
    return;
  
    if (k) {
      wl.expand(k,true);
    }
    return wl;
  }
  
  tree.showProtoChain = function (nd,k) {
    tree.protoState = {nd:nd,k:k}
    tree.setProtoTitle("Prototype Chain");
    tree.protoDivRest.empty();
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
        
        if (om.isAtomic(v)||(typeof v == "function")) {
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
      if (k) {
        var prnd = cnd.findOwner(k);
      } else {
        prnd = Object.getPrototypeOf(cnd);
      }
      
     // if ((!prnd.__parent__)||(prnd == cnd)||(!prnd.inWs())) {
      if ((!prnd.__parent__)||(prnd == cnd)) {
       return;
      }
      var atF = inWs && (!prnd.inWs());
      if (atF) {
        tree.protoDivRest.__element__.append("<div style='margin-top:10pt;margin-bottom:10pt;width:100%;height:2px;color:white;background-color:red'>_</div>");
         tree.protoDivRest.__element__.append("<div style='font-size:8pt'>The prototypes below are outside the workspace and cannot be edited</div>");
       inWs = false;
      }
      tree.showProto(prnd,k,n++,ovr,!inWs);
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

  tree.shapeTextFun = function (nd) {
  
    var tnm = nd.__name__;
    var nm = (typeof tnm == "undefined")?"root":tnm;
    var  tpn=nd.typeName();
    if (tpn == "DNode") {
      return nm;
    } else {
      return nm + " : " + tpn;
    }
  }
    
    
// n  is the index of this tree in the prototype chain

  tree.setProtoTitle = function (txt) {
    tree.protoDivTitle.__element__.html(txt);
  }
  
    tree.showProtoTop = function (o,n) {
      //om.protoDiv.addChild("protoDivTitle",om.protoDivTitle); // 

      var subdiv = tree.protoSubDiv.instantiate();    
      tree.protoDivRest.addChild(subdiv);
      subdiv.install();
      var clickFun = function (wl) {
         console.log("CLICKKK ",wl);
        wl.selectThisLine("tree");
      }
      var rs = tree.attachTreeWidget(subdiv.__element__,o,clickFun,tree.shapeTextFun,true);
      rs.protoTree = 1;
      return rs;

    }
    
    
    

    tree.clearProtoTree = function (o) {
      tree.protoDivRest.__element__.empty();
    }
    
    
  tree.attachShapeTree= function (root) {
    var clickFun = function (wl) {
      console.log("CLICKKK ",wl);
      wl.selectThisLine("tree");
    }
    tree.obDivRest.empty();
    var tr = tree.attachTreeWidgets(tree.obDivRest.__element__,[root],clickFun,tree.shapeTextFun);
    if (om.shapeTree) {
      tr.expandLike(om.shapeTree);
    }
    om.shapeTree = tr;

  }
  
   om.attachProtoTrees= function (roots) {
    var clickFun = function (wl) {
      console.log("CLICKKK ",wl);
      wl.selectThisLine("tree");
    }
    tree.protoTree = tree.attachTreeWidgets($('#obDiv'),roots,clickFun,tree.shapeTextFun,true);// multiRoot
  }
  
  
  tree.excludeFromProtos = {om:1,fileTree:1,jqPrototypes:1,lightbox:1,geom:1,mainPage:1,top:1,trees:1,draw:1};
  
  tree.initProtoTreeWidget = function () {
    var kys = Object.keys(__pj__);
    var rts = [];
    kys.forEach(function (ky) {
      if (!tree.excludeFromProtos[ky]) rts.push(__pj__[ky]);
    });
    tree.attachProtoTrees(rts);    
  }
  
  tree.initShapeTreeWidget = function () {
    tree.attachShapeTree(draw.wsRoot);    
  }

  
  
  
})();

