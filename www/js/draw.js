


(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  var draw = __pj__.set("draw",__pj__.om.DNode.mk());
  draw.__externalReferences__ = [];
  draw.__coreModule__ = 1;

  draw.enabled = 1; // for non-standalone items, draw is disabled;   only checked at a few entry points
  draw.viewerMode = 0;
  draw.defaultLineWidth = 1;
  draw.hitCanvasDebug = 0;
  draw.computeBoundsEnabled = 1;
  draw.computeBoundsFromHitCanvas = 0;
  draw.autoFit = 0;
 
 
  draw.set("Style",om.DNode.mk()).namedType();

  
  draw.Style.mk = function (o) { // supports mkLine([1,2],[2,4])
    rs = Object.create(draw.Style);
    rs.setProperties(o);
    return rs;   
  }
  
  draw.installType("Rgb");

  // formats supported "rgb(r,g,b) #xxxxxx three nums
  // g is treated as noAlpha if r is a string
  draw.Rgb.mk = function (r,g,b,a) {
    var rs = Object.create(draw.Rgb);
    if (typeof(r) === "number") {
      rs.r = r;
      rs.g = g;
      rs.b = b;
      if (typeof a==="number") {
        rs.alpha = a;
      }
      return rs;
    } else if (typeof r === "string") {
      var noAlpha = g;
      var re = /rgb\((\d*)\,(\d*)\,(\d*)\)$/
      var m = r.match(re);
      if (m) {
        return draw.Rgb.mk(parseInt(m[1]),parseInt(m[2]),parseInt(m[3]));
      } else {
        if (noAlpha) return undefined;
        //var re = /rgba\((\d*)\,(\d*)\,(\d*)\,(1|(?:\d*\.\d*))\)/
        var re = /rgba\((\d*)\,(\d*)\,(\d*)\,(1|(?:\d*\.\d*))\)/
        var m = r.match(re);
        if (m) {
          return draw.Rgb.mk(parseInt(m[1]),parseInt(m[2]),parseInt(m[3]),parseFloat(m[4]));
        } else {
          return m;
          
        }
      }
    }
  }
  
  draw.Rgb.toString = function () {
    var a = this.alpha;
    var r = this.r;
    var g = this.g;
    var b = this.b;
    if (typeof a==="number") {
      return "rgba("+r+","+g+","+b+","+a+")";
    } else {
      return "rgb("+r+","+g+","+b+")";

    }
  }
  
  // no color names allowed
  
  draw.checkRgb = function (v) {
    return om.check(v,"expected rgb(r,g,b)",
      function (x) {
        var rgb = draw.Rgb.mk(x,true);
        if  (!rgb) return undefined;
        return rgb.toString();
      });
  }
  
  draw.checkColor = function (v) {
    return om.check(v,"expected a lower case color name, or rgb(r,g,b) or rgba(r,g,b,a)",
      function (x) {
        var sx = String(x);
        var re = /^[a-z]+$/
        if (sx.match(re)) return sx;
        var rgb = draw.Rgb.mk(x);
        if  (!rgb) return undefined;
        return rgb.toString();
      });
  }
  
  
  draw.Style.setInputF("strokeStyle",draw,"checkColor");
  draw.Style.setInputF("fillStyle",draw,"checkColor");
  draw.Style.setFieldType("fillStyle","draw.Rgb");
  draw.Style.setFieldType("strokeStyle","draw.Rgb");

  draw.randomRgb = function () {
    function rint() { return Math.floor(Math.random()*255); }
    return draw.Rgb.mk(rint(),rint(),rint()).toString();
  }
  
  
  draw.randomGray = function () {
    function rint() { return Math.floor(Math.random()*255); }
    var c = rint();
    return draw.Rgb.mk(c,c,c).toString();
  }
  
   draw.randomColor = function (ilb,iub,alpha) {
    if (typeof ilb === "string") {
      var lb = draw.Rgb.mk(ilb);
      var ub = draw.Rgb.mk(iub);
    } else {
      lb = ilb;
      ub = iub;
    }
    function rint(lb,ub) {return Math.floor(lb + (ub-lb)*Math.random());}
    return draw.Rgb.mk(rint(lb.r,ub.r),rint(lb.g,ub.g),rint(lb.b,ub.b),alpha).toString();
  }
  
  // generated with
  /*
  ss = "";
  for (var i=0;i<20;i++) ss += '"'+p.draw.randomRgb()+'",';
  */
  draw.stdColors = ["rgb(244,105,33)","rgb(99,203,154)","rgb(207,121,0)","rgb(209,224,58)","rgb(191,112,227)","rgb(216,40,165)",
                     "rgb(109,244,128)","rgb(77,134,9)","rgb(1,219,43)","rgb(182,52,141)","rgb(48,202,20)","rgb(191,236,152)",
                     "rgb(112,186,127)","rgb(45,157,87)","rgb(80,205,24)","rgb(250,172,121)","rgb(200,109,204)","rgb(125,10,91)",
                     "rgb(8,188,123)","rgb(82,108,214)"];
   draw.stdColor = function (n) {
    if (n < draw.stdColors.length) {
      return draw.stdColors[n];
    } else {
      return draw.randomRgb();
    }
  }
   // generated with
  /*
   ss = "";
  for (var i=0;i<20;i++) ss += '"'+p.draw.randomGray()+'",';
  */
  draw.stdGrays = ["rgb(17,17,17)","rgb(195,195,195)","rgb(185,185,185)","rgb(43,43,43)","rgb(235,235,235)","rgb(199,199,199)",
                  "rgb(68,68,68)","rgb(93,93,93)","rgb(252,252,252)","rgb(61,61,61)","rgb(128,128,128)","rgb(179,179,179)",
                  "rgb(107,107,107)","rgb(19,19,19)","rgb(111,111,111)","rgb(159,159,159)","rgb(29,29,29)","rgb(144,144,144)",
                  "rgb(2,2,2)","rgb(4,4,4)"]
  draw.stdGray = function (n) {
    if (n < draw.stdGrays.length) {
      return draw.stdGrays[n];
    } else {
      return draw.randomGray();
    }
  }
  draw.indexToRgb = function (i) {
    var n = i*30;
    var base = 256;
    var b = n % base;
    var g = Math.floor(n/base)%base;
    var bsq = base*base;
    var r = Math.floor(n/bsq)%base;
    return "rgba("+r+","+g+","+b+",1)";    
  }
  
  draw.rgbToIndex = function (r,g,b) {
    var base = 256;
    var bsq = base * base;
    return b + base*g + bsq * r;
  }
  
  

  draw.selectCallbacks = [];
  
  om.DNode.select = function (src,dontDraw) { // src = "canvas" or "tree"
    if (src === "canvas") {
      om.unselect();
    }
    om.selectedNodePath =this.pathOf(__pj__);
    // this selectedNode is only for debugging
    om.selectedNode = this;
    this.__selected__ = 1;
    if (!this.selectable) {
      //this.deepSetProp("__selectedPart__",1);
      this.setPropForAncestors("__descendantSelected__",1,om.root);
    }
    if (src === "canvas") {
      // this will need modification when there is more than one canvas

      draw.refresh();
      var thisHere = this;
      draw.selectCallbacks.forEach(function (c) {
        c(thisHere);
      });
    } else if (om.inspectMode) {
        draw.mainCanvas.surrounders = (this===om.root)?undefined:this.computeSurrounders(5000);
      draw.refresh();
    }


  }
 
    
  om.LNode.select = om.DNode.select;
  
  draw.mSelect = function (nodes) {
    om.unselect();
    nodes.forEach(function (n) {
      n.select("tree");
    });
    draw.refresh();
  }
  
  function allSelected(rs,nd) {
    if (nd.__selected__) {
      rs.push(nd);
    } else {
      nd.iterTreeItems(function (c) {
        allSelected(rs,c)
      },true);
    }
  }
  
  draw.allSelected = function () {
    var rs = [];
    allSelected(rs,om.root);
    return rs;
  }
  
    
  om.DNode.unselect = function () {
    var dd = this.__descendantSelected__;
    if (!dd) return;
    this.__descendantSelected__ = 0;
    if (this.__selected__) {
      //this.deepSetProp("__selectedPart__",0);
      this.__selected__ = 0;
    }
    this.iterTreeItems(function (c) {
      c.unselect();
    },true);
  }
  
  om.LNode.unselect = om.DNode.unselect;

  om.unselect = function () {
    var ws = om.root;
    if (ws) ws.unselect();
  }
 
  // The drawn nodes which are affected by modifying p on nd; return the set drawn nodes which inherit, treewise from nd[p]
  om.DNode.visibleProtoEffects1 = function (rs,nd,p) {
    if (om.hasMethod(this,"draw")) {
      var isP = p !== undefined;
      if (isP) {
        if (this.treeInheritsPropertyFrom(nd,p)) {
          rs.push(this);
        }
      } else {
        if (this.treeInheritsSomePropertyFrom(nd)) {
          rs.push(this);
        }
      }
    } else {
      this.iterTreeItems(function (cnd) {
        cnd.visibleProtoEffects1(rs,nd,p)
      },true);
      //code
    }
  } 
  
  om.LNode.visibleProtoEffects1  = om.DNode.visibleProtoEffects1;
  
  
  om.DNode.visibleProtoEffects = function (p) {
    var rs = [];
    om.root.visibleProtoEffects1(rs,this,p);
    return rs;
  }
  
  
  // highlighting for the main/shape tree
  // a node may be selected above, at, or below the frontier of drawn nodes (with a draw method)
  om.DNode.drawnAncestor= function () { 
    // look for a drawn ancestor, the most distant one
    var cnd  = this;
    var rs = undefined;
    while (cnd !== om.root) {
      if (om.hasMethod(cnd,"draw")) {
        rs = cnd;
      }
      cnd = cnd.__parent__;
    }
    return rs;
  }
  
  om.LNode.drawnAncestor  = om.DNode.drawnAncestor;


   om.DNode.drawnDescendants1 = function (rs) {
    if (om.hasMethod(this,"draw")) {
      rs.push(this);
      return;
    }
    this.iterTreeItems(function (nd) {
      nd.drawnDescendants1(rs);
    },true);
   }
   
   om.LNode.drawnDescendants1  = om.DNode.drawnDescendants1;
   
   om.DNode.drawnDescendants = function () {
    var rs = [];
    this.drawnDescendants1(rs);
    return rs;
   }

   om.LNode.drawnDescendants =  om.DNode.drawnDescendants;
 
 
  om.DNode.hide = function () {
    this.hidden = 1;
    /*
    var st = this.style;
    if (!st) {
      var st = this.set("style",om.DNode.mk());
    }
    st.hidden = 1;
    */
    this.hideDom();
    return this;
  }
  
  om.DNode.show = function () {
    /*
    var st = this.style;
    if (st) {
      st.hidden = 0;
    }
    */
    this.hidden = 0;
    this.showDom();
    return this;
  }
  
  draw.measureText = function (txt,font) {
    var sp = draw.measureSpan;
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
  
  
})(prototypeJungle);

