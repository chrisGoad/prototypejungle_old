
// This is one of the code files assembled into pjui.js. 


// html components for the UI : pulldown (select), and tab; some utilities too
dom.Select = pj.Object.mk();

dom.Select.mk = function (o) {
  var rs = Object.create(dom.Select);
  pj.extend(rs,o);
  return rs;
}
  
dom.Select.build = function () {
  var el = this.domEl;
  var opts,oids,cnt,op,ln,thisHere,opels,sl,i,o,opel,opid;
  if (el) return el;
  var opts = this.options;
  oids = this.optionIds;
  cnt = this.containerP.instantiate();
  op = this.optionP;
  ln=opts.length;
  thisHere = this;
  // generate a separate closure for each n
  function selector(n) {
    return function () {
      thisHere.__select(n);
      thisHere.domEl.$css({"display":"none"})
    }
  }
  opels = [];
  sl = this.selected;
  this.disabled = {};
  for (i=0;i<ln;i++) {
    o = opts[i];
    opel = op.instantiate();
    opels.push(opel);
    cnt.addChild(opel);

    opid = oids[i];
    opel.$click(selector(i));
    opel.text = (this.isOptionSelector)&(i===sl)?"&#x25CF; "+o:o
  }
  this.optionElements = opels;
  this.domEl = cnt;
  return cnt;
}

dom.Select.hide = function () {
  if (this.domEl) {
    this.domEl.$hide();
  }
}
dom.Select.setDisabled = function (oId,iv) {
  var v = iv?true:false; 
  var  disabled = this.disabled;
  var cd = disabled[oId];
  var idx,opels,thisHere,opel;
  if (cd == v) return;//no change
  disabled[oId] = v;
  idx = this.optionIds.indexOf(oId);
  opels = this.optionElements;
  if (!opels) return;
  thisHere = this;
  opel = opels[idx];
  if (v) {
    opel.$css('color','gray');
  } else {
    opel.$css('color','black');
  }
}
   
   
  
dom.Select.updateDisabled = function () {
  var  disabled = this.disabled;
  var opIds = this.optionIds;
  var ln = opIds.length;
  var opEls = this.optionElements;
  var i,d,opel;
  for (i=0;i<ln;i++) {
    d = disabled[opIds[i]];
    opel = opEls[i];
    if (d) {
      opel.$css('color','gray');
    } else {
      opel.$css('color','black');
    }
  }
}

dom.Select.__select = function (n) {
 var opts = this.options;
 var optels = this.optionElements;
 var ln = opts.length;
 var i,oi,oe;
 this.selected = n;
 for (i=0;i<ln;i++) {
   oi = opts[i];
   oe  = optels[i];
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
  var p,pr,pof,ht,ofs,rofL,rofT;
  dom.unpop(nm);
  var p = dom.popped;
  if (p[nm]) {
    toPop.$css({"display":"none"});
    p[nm] = false;
    return;
  }
  pr = toPop.__parent;
  pof = pr.$offset();
  ht = button.$height();
  ofs = button.$offset();
  rofL = ofs.x-pof.x;
  rofT = ofs.y-pof.y;
  toPop.$css({"display":"block","left":rofL+"px","top":(rofT+ht)+"px"});
  p[nm] = toPop;
}
  

dom.unpop = function (except) {
  var p = dom.popped;
  var k,pp;
  for (k in p) {
    if (k === except) continue;
    pp = p[k];
    if (pp) {
      pp.$css({"display":"none"});
      p[k] = false;
    }
  }
}

dom.Tab = pj.Object.mk();

dom.Tab.mk = function (elements,initialState,action) {
  var rs = Object.create(dom.Tab);
  rs.elements = elements;
  rs.action = action;
  rs.initialState = initialState;
  return rs;
}
  
dom.Tab.build= function () {
  var jq = this.domEl;
  var cnt,els,jels,thisHere;
  if (jq) return jq;
  cnt =  html.Element.mk('<div style="border:solid thin black;position:absolute"/>');
  els = this.elements;
  jels = {};
  thisHere = this;
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
  var jels,jel,k,kel;
  if (elName === this.selectedElement) {
    return;
  }
  this.selectedElement = elName;
  jels = this.domElements;
  jel = jels[elName];
  jel.$css({"background-color":"#bbbbbb",border:"solid thin #777777"});
  for (k in jels) {
    if (k!==elName) {
      kel = jels[k];
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
  var isbk = (k==="backgroundColor") && (nd === pj.root);// special case
  var ipv = nd.__get(k);
  var pv = (ipv===undefined)?"inherited":pj.applyOutputF(nd,k,ipv);  // previous value
  var isnum = typeof(nd[k])==="number";
  var vl,nv,nwd;
  if (colorInput) {
    vl = colorInput.toName();
    if (!vl) {
      vl =  colorInput.toRgbString();
    }
  
  } else {
    vl = inp.$prop("value");
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
      nv = vl;
      pj.applyInputF(nd,k,vl,"colorChange");
    } else {
      nv = pj.applyInputF(nd,k,vl);
      if (nv) {
        if (pj.isObject(nv)) { // an object return means that the value is illegal for this field
          inp.$prop("value",pv);// put previous value back in
          return nv.message;
        }
      } else {
        if (isnum) {
          nv = parseFloat(vl);
          if (isNaN(nv)) {
            return "Expected number"; 
          }
        } else if (typeof nv === 'string') {

          nv = $.trim(nv); 
        }
      }
    }
    if (pv == nv) {
      pj.log("tree",k+" UNCHANGED ",pv,nv);
      return false;
    } else {
      pj.log("tree",k+" CHANGED",pv,nv);
    }
    nd.set(k,nv);
    nd.__update();
    if (isbk) {
      pj.svg.main.addBackground();
    }
    dom.afterSetValue(nd);
    nwd = computeWd(String(nv));
    if (inp) inp.$css({'width':nwd+"px"});
    return true;
  }
}

dom.afterSetValue = function (node) {
  if (node.__mark) { // part of a spread
    var marks = node.__parent.__parent;
    marks.assertModified(node);
  }
  ui.assertObjectsModified();  
}

dom.measureText = function (txt,font) {
  var sp = dom.measureSpan;
  var rs;
  if (sp) {
    sp.$show();
  } else {
    sp = html.Element.mk('<span/>');
    sp.$css('font','8pt arial');
    sp.__draw(document.body);
    dom.measureSpan = sp;
  }
  sp.$html(txt)
  rs = sp.$width();
  sp.$hide();
  return rs;
  }
 