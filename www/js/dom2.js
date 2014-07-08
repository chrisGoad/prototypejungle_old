(function (__pj__) {
  var om = __pj__.om;
  var ui = __pj__.ui;
  var dom = __pj__.dom;
  var html = __pj__.html;

  dom.Select = om.DNode.mk();
  
  dom.Select.mk = function (o) {
    var rs = Object.create(dom.Select);
    om.extend(rs,o);
    return rs;
  }
  
  dom.Select.build = function () {
    var el = this.domEl;
    if (el) return el;
    var opts = this.options;
    var oids = this.optionIds;
    var cnt = this.containerP.instantiate();
    var op = this.optionP;
    var ln=opts.length;
    var thisHere = this;
    // generate a separate closure for each n
    function selector(n) {
      return function () {
        thisHere.__select(n);
        thisHere.domEl.$css({"display":"none"})
      }
    }
    var opels = [];
    var sl = this.selected;
    var disabled = this.disabled;

    for (var i=0;i<ln;i++) {
      var o = opts[i];
      var opel = op.instantiate();
      opels.push(opel);
      var opid = oids[i];
      //if (disabled && disabled[opid]) {
      //  opel.style.color = "gray";
      //} else {
      opel.$click(selector(i));
      //}
      opel.text = (this.isOptionSelector)&(i===sl)?"&#x25CF; "+o:o
      cnt.addChild(opel);
     
    }
    this.optionElements = opels;
    this.domEl = cnt;
    return cnt;
  
  }
  
  dom.Select.setDisabled = function (oId,iv) {
    var v = iv?1:0; 
    var  disabled = this.disabled;
    var cd = disabled[oId];
    if (cd == v) return;//no change
    disabled[oId] = v;
    var idx = this.optionIds.indexOf(oId);
    var jq = this.jq;
    if (!jq) return;
    var jel = jq.__element;
    if (!jel) return;
    var opels = this.optionElements;
    var thisHere = this;
    var opel = opels[idx];
    var oel = opel.__element;
    if (v) {
      oel.$css('color','gray');
    } else {
      oel.$css('color','black');
    }
  }
   
   
  
  dom.Select.updateDisabled = function () {
    var  disabled = this.disabled;
    var opIds = this.optionIds;
    var ln = opIds.length;
    var opEls = this.optionElements;
    for (var i=0;i<ln;i++) {
      var d = disabled[opIds[i]];
      var opel = opEls[i];
      //var oel = opel.__element;
      if (d) {
        opel.$css('color','gray');
      } else {
        opel.$css('color','black');
      }
    }
  }

   dom.Select.__select = function (n) {
    this.selected = n;
    var opts = this.options;
    var optels = this.optionElements;
    var ln = opts.length;
    for (var i=0;i<ln;i++) {
      var oi = opts[i];
      var oe  = optels[i];
      if (i===n) {
        oe.$html(((this.isOptionSelector)?"&#x25CF; ":"") + oi);
      } else {
        oe.$html(oi);
      }
    }
    if (this.onSelect) {
      this.onSelect(n);
    }
  }
 
  dom.popped = {};
  
  dom.popFromButton = function (nm,button,toPop) {
    dom.unpop(nm);
    var p = dom.popped;
    if (p[nm]) {
      toPop.$css({"display":"none"});
      p[nm] = 0;
      return;
    }
    var pr = toPop.__parent;
    var pof = pr.$offset();
    var ht = button.$height();
    var ofs = button.$offset();
    var rofL = ofs.x-pof.x;
    var rofT = ofs.y-pof.y;
    toPop.$css({"display":"block","left":rofL+"px","top":(rofT+ht)+"px"});
    p[nm] = toPop;
  }
  

  dom.unpop = function (except) {
    var p = dom.popped;
    for (var k in p) {
      if (k === except) continue;
      var pp = p[k];
      if (pp) {
        pp.$css({"display":"none"});
        p[k] = 0;
      }
    }
  }

  dom.Tab = om.DNode.mk();
  
  dom.Tab.mk = function (elements,initialState,action) {
    var rs = Object.create(dom.Tab);
    rs.elements = elements;
    rs.action = action;
    rs.initialState = initialState;
    return rs;
  }
  
  dom.Tab.build= function () {
    var jq = this.domEl;
    if (jq) return jq;
    //var cnt =  html.Element.mk('<div",id:"modeTag",style:{"border":"solid thin #e","position":"absolute"}});
    var cnt =  html.Element.mk('<div style="border:solid thin black;position:absolute"/>');
    var els = this.elements;
    var jels = {};
    var thisHere = this;
    els.forEach(function (el) {
      var del = html.Element.mk('<div class="tabElement"/>');
      del.$click(function () {thisHere.selectElement(el);});
      del.$html(el);
      cnt.set(el,del);
      jels[el] = del;
    });
    this.domEl = cnt;
    this.domElements = jels;
    if (this.initialState) {
      this.selectElement(this.initialState,true);
    }
    return cnt;    
  }
  
  dom.Tab.selectElement = function (elName,noAction) {
    if (elName === this.selectedElement) {
      return;
    }
    this.selectedElement = elName;
    var jels = this.domElements;
    var jel = jels[elName];
    jel.$css({"background-color":"#bbbbbb",border:"solid thin #777777"});
    for (var k in jels) {
      if (k!==elName) {
        var kel = jels[k];
        kel.$css({"background-color":"#dddddd",border:"none"});
      }
    }
    if (!noAction && this.action) this.action(elName);
  }
  
  dom.Tab.enableElement = function (elName,vl) {
    var jel = this.domElements[elName];
    jel.$css({color:vl?"black":"grey"});
  }
  
  // for processing an input field; checking the value, inserting it if good, and alerting otherwise. Returns a message if there is an error
  // the value true if there was a change, and false otherwise (no change);
  // inherited will be set to false if this fellow is at the frontier;
  
  // If the current value of a field is numerical, it is enforced that it stay numerical.
  dom.processInput = function (inp,nd,k,inherited,computeWd,colorInput) { //colorInput comes from the color chooser
    debugger;
    var isbk = (k==="backgroundColor") && (nd === ui.root);// special case
    var ipv = nd.__get(k);
    var pv = ipv?nd.__applyOutputF(k,ipv):"inherited";  // previous value
    var isnum = typeof(nd[k])==="number";
    if (colorInput) {
      var vl = colorInput.toName();
      if (!vl) {
        var vl =  colorInput.toRgbString();
      }
    
    } else {
      var vl = inp.$prop("value");
    }
    if (vl === "") {
      if (inherited) {
        inp.$prop("value","inherited");
      } else {
        delete nd[k];
      }
    } else {
      if (vl === "inherited") return false;
      if (colorInput) { // no need for check in this case, but the input function might be present as a monitor
        var nv = vl;
        nd.__applyInputF(k,vl,"colorChange");
      } else {
        var nv = nd.__applyInputF(k,vl);
        if (nv) {
          if (om.isObject(nv)) { // an object return means that the value is illegal for this field
            inp.$prop("value",pv);// put previous value back in
            return nv.message;
          }
        } else {
          if (isnum) {
            var nv = parseFloat(vl);
            if (isNaN(nv)) {
              return "Expected number";
            }
          } else {
            nv = $.trim(vl);
          }
        }
      }
      if (pv == nv) {
        om.log("tree",k+" UNCHANGED ",pv,nv);
        return false;
      } else {
        om.log("tree",k+" CHANGED",pv,nv);
      }
      nd.set(k,nv);
      if (isbk) {
        pj.svg.main.addBackground();
      }
      if (om.isComputed(nd)){
        om.transferToOverride(ui.root,nd,k);
        //nd.__transferToOverride(om.overrides,om.root,[k]);
      }
      var nwd = computeWd(String(nv));
      if (inp) inp.$css({'width':nwd+"px"});
      ui.assertObjectsModified();
      return true;
    }
  }
  
 

  dom.measureText = function (txt,font) {
    var sp = dom.measureSpan;
    if (!sp){
      var sp = html.Element.mk('<span/>');
      sp.$css('font','8pt arial');
      sp.draw(document.body);
      sp.$hide();
      dom.measureSpan = sp;
    }
    sp.$html(txt)
    var rs = sp.$width();
    return rs;
  }
 

})(prototypeJungle);
 
