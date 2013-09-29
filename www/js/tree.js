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
  tree.installType("TreeWidget");
  
  tree.highlightColor = "rgb(100,140,255)"
  tree.newTreeWidget = function (o) {
    this.setProperties(o,["textProto","rootPos"]);
  }
  // ground level operators
  
  var jqp = __pj__.jqPrototypes;
  var mpg = __pj__.mainPage;
  
  tree.set("WidgetLine",Object.create(dom.JQ)).namedType();
  tree.set("valueProto",dom.newJQ({tag:"span"}));//,style:{"font-weight":"bold"}});
  
  tree.WidgetLine.mk = function (o) {
    return dom.newJQ(o,tree.WidgetLine);
  }

  var wline = tree.WidgetLine.mk({tag:"div",style:{"font-size":"10pt",color:"black",width:"100%"}});
  jqp.set("widgetLine", wline);
  var mline =  wline.addChild("main",dom.newJQ({tag:"div",style:{}}));
    mline.addChild("toggle",dom.newJQ({tag:"span",html:"&#9655;",cursor:"pointer",style:{color:"black"}}));
        
  mline.addChild("theName",dom.newJQ({tag:"span",style:{"padding-right":"20px",color:"black"}}));
  om.mline = mline; // for debugging
  tree.wline = wline;
  
  var dpySelected = dom.newJQ({tag:"div",style:{color:"black"}})

  var protoBut = jqp.set("protoButton", tree.WidgetLine.mk({tag:"span",html:"proto",style:{color:"black",width:"100px"}}));

  
  
  om.DNode.hasNodeChild = function () { // determines whether, in the item browser, this is a leaf
    var rs = false;
    this.iterTreeItems(function (ch) {
      rs = true;
    },true);
    return rs;
  }
 
  om.DNode.mkWidgetLine = function (options) { //ownp,clickFun,textFun,forProto,top) {
    if (tree.onlyShowEditable && this.__mfrozen__) return;
    var clickFun = options.clickFun;
    var textFun = options.textFun;
    var forProto = options.forProto;
    var top = options.top;
    var forItems = options.forItems;
    var ww = wline; // for debugging
    var rs = wline.instantiate();
    var m = rs.selectChild("main");
    if (forProto) {
      var tg = m.selectChild("toggle");
      tg.hide();
    }
    if (top) {
      var pth = this.pathOf(__pj__);
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
    var tspan = m.selectChild("toggle");

    if (!forProto) {//  && (!forItems || this.hasNodeChild())) {
      var tspan = m.selectChild("toggle");
      tspan.set("click",cl);
      if (this.__leaf__) tspan.html = " ";
    } else {
      tspan.hide();
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
  tree.WidgetLine.addTreeChild = function (nm,ch) {
    var fc = this.selectChild("forChildren");
    if (!fc) {
      fc = dom.newJQ({tag:"div",style:{"margin-left":"20px"}});
      this.addChild("forChildren",ch);
    }
    fc.addChild(nm,ch);
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
  
  
  tree.WidgetLine.selectChildLine = function (nm) {
    this.expand();
    var ch = this.treeChild(nm);
    if (ch) ch.selectThisLine('tree');
  }

  
  tree.WidgetLine.selectThisLine = function (src) { // src = "canvas" or "tree"
    //tree.adjust();
    var nd = this.forNode;
    var prnd = this.forParentNode;
    var prp = this.forProp;
    var vse = []; //visible effects
    tree.selectedLine = this;
 
    if (this.__selected__) return;
    tree.selectedNode = nd;

    var tp = this.treeTop();
    var isProto = tp.protoTree; // is this the prototype panel?
    var forItems = tp.forItems;
    var isShapeTree = tp.isShapeTree;
    var drawIt = ((!forItems) && (src == "tree"));
    if (isShapeTree) tree.clearProtoTree();
    var ds = tp.dpySelected;
 
    if (isProto) {
      if (nd) {
        var p = om.pathOf(nd,__pj__)
        var ps = p.join(".");
        if (drawIt) vse = nd.visibleProtoEffects();
      } 
    } else if (isShapeTree) { // determine which nodes to highlight
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
    } else if (forItems) {
      tree.setSelectedFolder(this);
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
      if (this.__prim__) {
        var prnode = this.forParentNode;
        if (prnode != draw.wsRoot) {
          tree.showProtoChain(this.forParentNode,this.forProp);
        }
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
    
        om.log("tree","SELECTION DONE");

  }
  
  tree.WidgetLine.ancestorIsSelected = function () {
    if (this.__selected__) return 1;
    var pr = this.treeParent();
    if (!pr) return 0;
    return pr.ancestorIsSelected();
  }

  
  function showFunction(f,pth)  {
    var s = f.toString();
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
    var ht = "<pre>"+om.escapeHtml(s)+"</pre>";
    lb.setContent(ht);   
  }
 
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
  
  var hiddenProperties = {__record__:1,__isType__:1,__record_:1,__externalReferences__:1,__selected__:1,__selectedPart__:1,
                          __notes__:1,__computed__:1,__descendantSelected__:1,__fieldStatus__:1,__source__:1,__about__:1,
                          __overrides__:1,__mfrozen__:1,__inputFunctions__:1,__outputFunctions__:1,__current__:1,__canvasDimensions__:1,
                          __beenModified__:1,__autonamed__:1,__origin__:1,__from__:1,__changedThisSession__:1,__topNote__:1,
                          __saveCount__:1,__saveCountForNote__:1,__setCount__:1,__setIndex__:1,__doNotUpdate__:1};
  
  
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
        } else if ((!chovr) && (!nd.fieldIsFrozen(k))) {
          return true;
        }
      }
    }
    return false;
  }
  
  tree.applyOutputF = function(nd,k,v) {
    var outf = nd.getOutputF(k);
    if (outf) {
      return outf(v,nd);
    } else {
      return v;
    }
  }
  
  
  tree.WidgetLine.popNote= function () { // src = "canvas" or "tree"
    var nd = this.forNode;
    var prnd = this.forParentNode;
    var prp = this.forProp;
    var vse = []; //visible effects
    var nt = "";
    if (prnd) {
      var nt = prnd.getNote(prp);
      var nprp = prp;
    } else {
      var ndp = nd.__parent__;
      nprp = nd.__name__;
      nt = ndp.getNote(nprp);
    }
    if (nt) tree.setNote(nprp,nt);
  }
 
  var dontShowFunctionsFor = [geom];
  
    
  tree.mkPrimWidgetLine = function (options) { // for constants (strings, nums etc).  nd is the node whose property this line displays
    var nd = options.node;
    var k = options.property;
    var clickFun = options.clickFun;
    var isProto = options.isProto;
    var overriden = options.overridden;
    var noEdit = options.noEdit;
    var atFrontier = options.atFrontier;
    var ownp = nd.hasOwnProperty(k);
    var prnd = nd;
    var isDataSource = om.DataSource.isPrototypeOf(nd) && (k=="data"); //gets special treatment
      // if this is outside the tree, then don't display this
    if (!prnd.__parent__ ||om.inStdLib(prnd)) return;
    // functions are never displayed except with the node that owns them
    var frozen = nd.fieldIsFrozen(k);
  
    var computed = nd.isComputed();
    var v = tree.applyOutputF(nd,k,nd[k]);
  
    if (((typeof v == "function")) && (!ownp)) {
      return;
    }
    var cl = "black";
    var rs = tree.WidgetLine.mk({tag:"div",style:{color:cl}});
    rs.__prim__ = 1;
    rs.forParentNode = nd;
    rs.forProp = k;
    var isFun = typeof v == "function";
    var txt = k;
    var notePop;
    if (nd.getNote(k)) {
      var qm =  dom.newJQ({tag:"span",html:"? ",style:{"cursor":"pointer","font-weight":"bold"}});
      rs.addChild("qm",qm);
      var notePop = function () {rs.popNote()};
      qm.click = notePop;
      var sp =  dom.newJQ({tag:"span",html:txt,style:{cursor:"pointer",color:cl}});
      sp.click = notePop;
    } else {
      var sp =  dom.newJQ({tag:"span",html:txt,style:{color:cl}});

    }
  
    rs.addChild("title",sp);
    
    if (clickFun) {
      var cl2 = function () {
        clickFun (rs);
      }
      rs.click = cl2;
    }

    var editable = !(frozen || overriden || noEdit);
    if (isFun) {
      if (!tree.showFunctions) return;
      if (dontShowFunctionsFor.indexOf(nd.parent()) >= 0) return;
      var funBut =  jqp.funbutton.instantiate();
      funBut.html = " Function ";
      rs.addChild("funb",funBut);
      var pth = om.pathToString(nd.pathOf(__pj__).concat(k),".");
      funBut.click = function () {showFunction(v,pth)};
    } else {
      if ((!ownp) && (!atFrontier) && (!noEdit)) { // all properties at the frontier don't count as overriden; that's the last place they can be edited
        var inherited = 1;
      }
      if (tree.onlyShowEditable && !editable ) {
        return undefined;
      }
      if (overriden) {
        vts = "<b>overridden</b>";
      } else  if (inherited) {
        var vts = "inherited";
      } else {
        vts = om.nDigits(v,4);
      } 
      if (!vts) vts = "";
      if (!editable) {
        var inp = tree.valueProto.instantiate();
        inp.html = " "+vts;
      } else {
        
        function measure(txt) {
          var sp = dom.measureSpan;
          if (!sp){
            var sp = $('<span></span>');
            sp.css('font','8pt arial');
            $('body').append(sp);
            sp.hide();
          }
          sp.html(txt)
          var rs = sp.width();
          sp.remove();
          return rs;
        }
        var computeWd = function (s) {
          var wm = measure(s);
          return Math.max(50,wm+20)
        }
        var inpwd = computeWd(vts);
        //  the input field, and its handler
        var inp = dom.newJQ({tag:"input",type:"input",attributes:{value:vts},style:{font:"8pt arial","background-color":"#e7e7ee",width:inpwd+"px","margin-left":"10px"}});
          var blurH = function () {
            debugger;
            var pv = tree.applyOutputF(nd,k,nd[k]);  // previous value

            var vl = inp.__element__.prop("value");
            if (vl == "") {
              delete nd[k];
            } else {
              if (vl == "inherited") return;
              var inf = nd.getInputF(k);
              if (inf) {
                var nv = inf(vl,nd);
                if (om.isObject(nv)) { // an object return means that the value is illegal for this field
                  page.alert(nv.message);
                  inp.__element__.prop("value",pv);// put previous value back in
                  return;
                }
              } else {
                var nv = parseFloat(vl);
                if (isNaN(nv)) {
                  nv = $.trim(vl);
                }
              }
              if (pv == nv) {
                om.log("tree",k+" UNCHANGED ",pv,nv);
                return;
              } else {
                om.log("tree",k+" CHANGED",pv,nv);
              }
              page.setSaved(false);
              nd[k] =  nv;
              nd.transferToOverride(draw.overrides,draw.wsRoot,[k]);
              var nwd = computeWd(String(nv));
              inp.css({'width':nwd+"px"});
              draw.wsRoot.__changedThisSession__ = 1;
              if (nd.isComputed()){
                nd.addOverride(draw.overrides,k,draw.wsRoot);
              }
            }
            if (tree.autoUpdate) {
              tree.updateAndShow("tree");
              tree.adjust();
            } else {
              draw.refresh();
            }
        }
        inp.blur = blurH;
        var focusH = function () {
          rs.selectThisLine("tree");//"input");
        };
        // it is convenient to erase "inherited" when the user starts to type into the field
        var removeInherited = function () {
          var vl = inp.prop("value");
          if (vl=="inherited") {
            inp.prop("value","");
          }
        }
        inp.mousedown = removeInherited;
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
    var rs = tree.WidgetLine.mk({tag:"div",style:{color:cl}});
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
    if (!tch || (tch.length == 0)) { // never been expanded, can be ignored.
      return;
    }
    var mismatch = 0;
    // todo slightly dumb to keep going once a mismatch is detected
    this.iterTreeItems(function (ch) {
      var nm = ch.__name__;
      if (hiddenProperties[nm]) return;
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
        nd.adjust2(c);
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
    var ch =  this.childrenPastRanges();
    ch.forEach(function (ch) {
      ch.reexpandMismatches();
      if (ch.__prim__) {
        ch.forParentNode = pnd;
        var k = ch.forProp;
        if (pnd.hasOwnProperty(k) || pnd.atFrontier()) { // for reflecting update of data, not prototype structure, which, so far, updates will not affect
          var vl =  tree.applyOutputF(pnd,k,pnd[k]); // value in the workspace
          var inp = ch.selectChild("val");
          inp.prop("value",vl);
        }
      }
      
    });
  }

  // top level
  
  tree.adjust = function () {
    var tm = Date.now();
    var topnd = draw.wsRoot;
    topnd.removeWidgetPointers();
    if (om.shapeTree) {
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
    if (fsz == undefined) {
      var tch = this.treeChildren();
      var rs = tch.length == nd.length;
    } else {
      var rs  = fsz == nd.length;
    }
    om.log("tree","checked range for",this.id," result=",rs);
    return rs;
  }
  
  // assumed that DNode is in the workspace
  
  om.DNode.atFrontier = function () {
    console.log("INN",k);
    var proto = Object.getPrototypeOf(this);
    var rs = !proto.inWs();
    return rs;
  }
 
  //  only works and needed on the workspace side, not on protos, hence no ovr
  
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
    var nd = this.forNode;
    if (!nd) return false;  
    if (tree.onlyShowEditable && !tree.hasEditableField(nd,ovr)) return false;
    var tp = this.treeTop();
    var isProto = tp.protoTree && (!tree.protoPanelShowsRef);
    var fileTree = tp.fileTree;
    var forItems = tp.forItems;
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
      newCh = ch.__reExpanding__;
      ch.show();
    }
    
    
    
    function addLine(ch,nd,k,tc) { // ch = jq element to add to nd = the parent, k = prop, tc = child
      if (hiddenProperties[k]) return;
      if (ch.selectChild(k)) return; //already there
      var isnd = om.isNode(tc);
      if (isnd && !nd.treeProperty(k)) {
        if (!nd.hasOwnProperty(k)) return;
        var ln = tree.mkRefWidgetLine(tp.forNode,k,tc);
      } else if (isnd) {
        if (tree.onlyShowEditable && (!tree.hasEditableField(nd[k],ovr?ovr[k]:undefined))) return;
        var ln = tc.mkWidgetLine({clickFun:tp.__clickFun__,textFun:tp.__textFun__,isProto:isProto,forItems:forItems});
      } else {
        var overriden = ovr && ovr[k];
        if (forItems) return;
        var options = {node:nd,property:k,clickFun:tp.__clickFun__,isProto:isProto,overridden:overriden,noEdit:noEdit,atFrontier:atFrontier}
        ln = tree.mkPrimWidgetLine(options);
      }
      if (ln) ch.addChild(k,ln);
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
     debugger;
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
          this.rangesForSize = nln;
        } else {
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

 
 tree.WidgetLine.addItemLine =  function (nd) { // for new folder in the item browser
    if (this.expanded) {
      var ln = nd.mkWidgetLine({clickFun:tree.itemClickFun,textFun:tree.itemTextFun,forItems:1});
      this.addTreeChild(nd.__name__,ln);
      this.install();
    } else {
      this.reExpand(true);
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
    if (pr == nd) return this;
    return pr.ancestorBelow(nd);
  }
  // this adds a DNode into the widget tree structure. There are two cases
  // If this's parent is in the tree, then whichTree is not needed
  // ow, the node is being added to a multiRoot, given by whichTree.
  // this is for the protos, which are rooted at i.
  
  
  om.DNode.addWidgetLine = function (whichTree) {
    if (this.get("widgetDiv")) return ; //already done
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
      var wd = nd.get("widgetDiv");
      top = wd.treeTop();
      var p0 = pth[0];
      ch = wd.selectChild("forChildren");
    }
    if (!ch) return; // never been expanded;
    //ownp,clickFun,textFun,forProto,top) {
    var ln = this.mkWidgetLine({clickFun:top.__clickFun__,textFun:top.__textFun__});
    //var ln = this.mkWidgetLine(true,top.__clickFun__,top.__textFun__);
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
    this.contractProtoChain();
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
    var clickFun = options.clickFun;
    var textFun = options.textFun;
    var forProto = options.forProto;
    var forItems = options.forItems;
    var ds = dpySelected.instantiate();
    //var wline = rnd.mkWidgetLine(true,clickFun,textFun,forProto,true);
    var wline = root.mkWidgetLine({clickFun:clickFun,textFun:textFun,forProto:forProto,top:true,forItems:forItems});
    wline.__treeTop__ = 1;
    ds.install(div); // interupt the JQ tree here
    wline.install(div);
    wline.__clickFun__ = clickFun;
    wline.__textFun__ = textFun;
    wline.dpySelected = ds;
    return wline;
    
 
  }
 
  om.DNode.atProtoFrontier = function () { // the next fellow in the prototype chain is outside the ws
    prnd = Object.getPrototypeOf(this);
    return (!prnd.__parent__)||(!prnd.inWs());
  }
  
  
  //n = nth in  proto chain.
  // ovr is an object with properties k:1 where k is overriden further up the chain, or k:covr , where covr is the ovr tree for prop k
  tree.showProto = function (prnd,k,n,ovr) {
    var inWs = prnd.inWs();
    if (inWs) {
      var atF =  !(Object.getPrototypeOf(prnd).inWs());
    } else {
      atF = false;
    }
    var wl = tree.showProtoTop(prnd,n);
    prnd.__protoLine__ = wl; // gives the correspondence between main tree, and proto tree
    wl.fullyExpand(ovr,!inWs,atF);
    return;
  }
  
  tree.showProtoChain = function (nd,k) {
    tree.protoPanelShowsRef = 0;
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
      var prnd = Object.getPrototypeOf(cnd);
      if ((!prnd.__parent__)||(prnd == cnd)) {
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

  tree.shapeTextFun = function (nd) {
  
    var tnm = nd.__name__;
    var nm = (typeof tnm == "undefined")?"root":tnm;
    var  tpn=nd.protoName();
    if (tpn == "DNode" || nm == tpn) {
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
      var subdiv = tree.protoSubDiv.instantiate();    
      tree.protoDivRest.addChild(subdiv);
      subdiv.install();
      var clickFun = function (wl) {
         om.log("tree","CLICKKK ",wl);
        wl.selectThisLine("tree");
      }
   
      var rs = tree.attachTreeWidget({div:subdiv.__element__,root:o,clickFun:clickFun,textFun:tree.shapeTextFun,forProto:true});
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
    if (om.shapeTree) {
      tr.expandLike(om.shapeTree);
    }
    om.shapeTree = tr;
    tr.isShapeTree = true;

  }
  
  
  tree.excludeFromProtos = {om:1,fileTree:1,jqPrototypes:1,lightbox:1,geom:1,mainPage:1,top:1,trees:1,draw:1};
 
  tree.initShapeTreeWidget = function () {
    draw.wsRoot.deepSetProp("widgetDiv",undefined);
    tree.attachShapeTree(draw.wsRoot);    
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
          if (i == (ln-1)) {
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
    var nm = (typeof tnm == "undefined")?"root":tnm;
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
    
   om.attachItemTree= function (el,itemTree) {
    tree.itemTree = tree.attachTreeWidget({div:el,root:itemTree,clickFun:tree.itemClickFun,textFun:tree.itemTextFun,forItems:true});
    tree.itemTree.forItems = true;
  }
  
  
  
  
  tree.openTop = function () {
    om.shapeTree.expand();
  }
  
  
  
  
})(prototypeJungle);

