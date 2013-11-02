


(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  var draw = __pj__.set("draw",__pj__.om.DNode.mk());
  draw.__externalReferences__ = [];
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

  draw.randomRgb = function (lb,ub) {
    function rint() { return Math.floor(Math.random()*255); }
    return draw.Rgb.mk(rint(),rint(),rint()).toString();
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
  
  
  om.DNode.inWs = function () {
    if (this === draw.wsRoot) return true;
    var pr = this.get("__parent__");
    if (!pr) return false;
    return pr.inWs();
  }
  
  om.LNode.inWs = om.DNode.inWs;

  draw.selectCallbacks = [];
  
  om.DNode.select = function (src) { // src = "canvas" or "tree"
    if (src === "canvas") {
      om.unselect();
    }
    om.selectedNodePath =this.pathOf(__pj__);
    
    this.__selected__ = 1;
    this.deepSetProp("__selectedPart__",1);
    this.setPropForAncestors("__descendantSelected__",1,draw.wsRoot);
    draw.refresh();

    if (src === "canvas") {
      var thisHere = this;
      draw.selectCallbacks.forEach(function (c) {
        c(thisHere);
      });
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
    allSelected(rs,draw.wsRoot);
    return rs;
  }
  
    
  om.DNode.unselect = function () {
    var dd = this.__descendantSelected__;
    if (!dd) return;
    this.__descendantSelected__ = 0;
    if (this.__selected__) {
      this.deepSetProp("__selectedPart__",0);
      this.__selected__ = 0;
    }
    this.iterTreeItems(function (c) {
      c.unselect();
    },true);
  }
  
  om.LNode.unselect = om.DNode.unselect;

  om.unselect = function () {
    var ws = draw.wsRoot;
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
    draw.wsRoot.visibleProtoEffects1(rs,this,p);
    return rs;
  }
  
  
  // highlighting for the main/shape tree
  // a node may be selected above, at, or below the frontier of drawn nodes (with a draw method)
  om.DNode.drawnAncestor= function () { 
    // look for a drawn ancestor, the most distant one
    var cnd  = this;
    var rs = undefined;
    while (cnd !== draw.wsRoot) {
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
    var st = this.style;
    if (!st) {
      var st = this.set("style",om.DNode.mk());
    }
    st.hidden = 1;
    this.hideDom();
    return this;
  }
  
  om.DNode.show = function () {
    var st = this.style;
    if (st) {
      st.hidden = 0;
    }
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

