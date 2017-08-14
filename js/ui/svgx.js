
  
// This is one of the code files assembled into pjui.js.

// properties of a node relevant to mouse control. __draggable,__unselectable,__adjustPrototype

// if a node has a selectable part, a central control square is added, so it can be dragged around.

// at any given time when the mouse is down, there is a controlActivity, which is one of
// shifting, panning, draggingControl (dragging one of the little control boxes), draggingCustomControl,
// draggingControlled (dragging the whole controlled)
// There are, in the general case, two objects involved: pj.selectedNode, and controlled

var controlActivity = undefined;
var cZoomFactor;
var selectedPreShift;

var draggedControlName = 0;
var draggedCustomControlName = 0;
var surrounded = undefined;

svg.Element.__setSurrounders  = function (fromControl) {
  alert('setSurrounders (obsolete)');
  var sz,surs,rt,b,rct,cr,xt,lx,ly,efc,ext,efcm,st;
  if (!svg.surroundersEnabled) {
    return;
  }
  sz = 5000;
  surs = pj.root.surrounders;
  if (!surs) {
    surs = svg.main.addSurrounders();
  }
  rt = svg.main.contents;
  if (this.__draggable || (this.__adjustable && this.__setExtent)) {
    b = ui.computeControlBounds(this);//ui.setControlled(this);
  } else {
    b = this.__bounds(rt);
  }
  if (!b) {
    surs.__hide();
    surs.__draw();
    return;
  }
  surs.__show();
  surrounded = this;
  rct = b.expandTo(5,5); // Lines have 0 width in svg's opinion, but we want a surround anyway
  cr = rct.corner;
  xt = rct.extent;
  // first top and bottom
  lx = cr.x - sz;
  ly = cr.y - sz;
  pj.log("svg","surrounders ",lx,ly);
  efc = 1.05; // add this much space around the thing
  ext = 5;// absolute 
  efcm = efc - 1;
  st = {fill:"rgba(0,0,0,0.4)"};
  
  surs.s0.set({x:lx,y:ly,width:sz*2,height:sz-ext});// above
  surs.s1.set({x:lx,y:cr.y+xt.y + ext,width:sz*2,height:sz}); //below    
  surs.s2.set({x:lx,y:cr.y-ext,width:sz-ext,height:xt.y+2*ext});//to left
  surs.s3.set({x:cr.x+xt.x + ext,y:cr.y-ext,width:sz,height:xt.y + 2*ext});// to right
  surs.visibility = "inherit";
  surs.__draw();
}
  
svg.resetSurrounders = function () {
  alert('resetSurrounders (obsolete)');
  var slnd = pj.selectedNode;
  if (slnd) {
    slnd.__setSurrounders();
  }
}
 
  
svg.Root.setZoom = function (trns,ns) {
  var cntr = geom.Point.mk(this.width()/2,this.height()/2);// center of the screen
  var ocntr = trns.applyInverse(cntr);
  var ntx,nty,tr;
  trns.scale = ns;
  ntx = cntr.x - (ocntr.x) * ns;
  nty = cntr.y - (ocntr.y) * ns;
  tr = trns.translation;
  tr.x = ntx;
  tr.y = nty;
  ui.updateBoxSize();
}
  
  
ui.zoomStep = function (factor) {
  var trns = svg.main.contents.transform;
  var s;
  if (!trns) return;
  var s = trns.scale;
  pj.log("svg","zoom scaling",s);
  ui.updateControlBoxes('zooming');
  svg.main.setZoom(trns,s*factor);
  svg.draw();
}
  
var nowZooming = false;
var zoomFactor = 1.1;
var zoomInterval = 150;
var zoomer = function zoomer() {
  if (nowZooming) {
    ui.zoomStep(cZoomFactor);
    setTimeout(zoomer,zoomInterval);
  }
}


svg.startZooming = function () {
  pj.log("svg","start zoom");
  cZoomFactor = zoomFactor;
  if (!nowZooming) {
    nowZooming = true;
    zoomer();
  }
}
  
svg.startUnZooming = function () {
  cZoomFactor = 1/zoomFactor;
  if (!nowZooming) {
    nowZooming = true;
    zoomer();
  }
}

svg.stopZooming = function() {
  pj.log("svg","stop zoom");
  nowZooming = false;
}
  

svg.initDiv = function (dv) {
  var jdv = $(dv);
  var wd = jdv.width();
  var ht = jdv.height();
  var dom = pj.dom;
  var svgDiv =  dom.El('<div style="postion:absolute;background-color:white;border:solid thin black;display:inline-block"/>');;
  svgDiv.install(dv);
  svg.init(svgDiv.__element[0],wd,ht);
}


svg.surrounderP = svg.Element.mk('<rect fill="rgba(0,0,0,0.4)"  x="0" y="0" width="100" height="10"/>');
svg.surrounderP["pointer-events"] = "none";

pj.selectCallbacks = [];

var shiftee; // used in the __noShifter case, where objects are dragged directly
  // what to do when an element is selected by clicking on it in graphics or tree

pj.Object.__select = function (src,dontDraw) { // src = "svg" or "tree"
  if (ui.forking) {
    ui.performFork(this);
    return;
  
  }
  if (pj.selectedNode === this) {
    return;
  }
  if (ui.nowReplacingFromClone) {
    ui.replaceFromClone(this);
    return;
  }
  ui.unselect();
  if (ui.closeSidePanel) {
    ui.closeSidePanel();
  }
  pj.selectedNodePath =this.__pathOf(pj.root);
  if (pj.selectedNode && (pj.selectedNode !== this) && pj.selectedNode.__whenUnselected) {
    pj.selectedNode.__whenUnselected();
  }
  pj.selectedNode = this;
  this.__selected = true;

  if (src === 'tree') {
    controlActivity = undefined;
    ui.clearControl();
  }
  ui.nowAdjusting = this.__draggable || (this.__adjustable && (this.__setExtent || this.__controlPoints));
  
  ui.setControlled(this);
  ui.updateControlBoxes();//!ui.nowAdjusting);
 // ui.hideSurrounders();
  if (src === "svg") {
    var thisHere = this;
    pj.selectCallbacks.forEach(function (c) {
      c(thisHere);
    });
  }
}
   
ui.zoomToSelection = function () {
  var rt = svg.main;
  var snd = pj.selectedNode;
  var bnds,xf;
  if (snd) { 
    var bnds = snd.__bounds(rt.contents);
    var xf = rt.fitBounds(0.2,bnds);
  }
}
ui.hideSurrounders =  function () {
  alert('hideSurrounders (obsolete)');
  var surs = pj.root.surrounders;
  if (surs) {
    surs.__hide();
    surs.__draw();
  }
  surrounded = undefined;
}

pj.unselectCallbacks = [];
ui.unselect = function () {
  if (pj.selectedNode) {
    if (pj.selectedNode.__whenUnselected) {
      pj.selectedNode.__whenUnselected();
    }
    pj.selectedNode.__selected = false;
    pj.selectedNode = undefined;
    controlActivity = undefined;
    ui.clearControl();
    svg.unhighlight();
    ui.nowAdjusting = undefined;
 
  }
  //ui.hideSurrounders();
  if (!ui.nowCloning) {
    svg.main.__element.style.cursor = "default";
  }
  pj.unselectCallbacks.forEach(function (fn) {fn();})
}
  
//  refresh the whole UI, 
ui.refresh = function (doFit) {
  var selectedPath;
  selectedPath = undefined;
  if (pj.selectedNode) {
    selectedPath = pj.pathOf(pj.selectedNode,pj.root);
  }
  svg.main.updateAndDraw(doFit);
  if (pj.tree) {
    pj.tree.refresh();
  }
  if (selectedPath) {
    var cselection = pj.evalPath(pj.root,selectedPath);
    if (cselection) {
      if  (cselection !== pj.selectedNode) {
        cselection.__select();
      }
    } else {
      ui.unselect();
    }
  }
  ui.needsUpdate = false;
}
  
  
svg.Root.addSurrounders = function () {
  alert('addSurrounders (obsolete)');
  var cn,surs,rct,nm;
  if (!svg.surroundersEnabled) {
    return;
  }
  cn = this.contents;
  if (cn.surrounders) {
    return cn.surrounders;
  }
  surs = svg.tag.g.mk();
  for (var i=0;i<4;i++) {
    var rct = svg.surrounderP.instantiate();
    var nm = "s"+i;
    surs.set(nm,rct);
  }
  surs.visibility="visible";
  cn.set("surrounders",surs);
  return surs;
}
 
  
// this is the nearest ancestor of the hovered object which has a forHover method
 
 svg.hoverAncester = undefined;
 // the node currently hovered over
 
 svg.hoverNode = undefined;
 
 
 pj.Object.__isSelectable = function () {
   return !this.__unselectable;
 }
 
 pj.Array.__isSelectable = function () {
   return false;
 }
 
 ui.selectableAncestor = function (node) {
   return pj.ancestorWithoutProperty(node,"__unselectable");
 }
  
 
// returns the  node, if any, over which mouse event e takes place
var overNode = function (e,operation) {
    var trg = e.target;
    pj.log('control',"svg",operation,trg.id);
    return trg.__prototypeJungleElement;
}

// for selection 

var mouseDownListener = function (root,e) {
  if (ui.hideFilePulldown) {
    ui.hideFilePulldown();
  }
  var trg,id,cp,xf,iselnd,oselnd,b,xf,xfip,dra,rfp,idx,clickedPoint;
  pj.log('control','MOUSEDOWN');
  svgRoot = root;
  ui.mouseDownEvent = e;
  e.preventDefault();
  cp = root.cursorPoint(e);
  root.refPoint = cp; // refpoint is in svg coords (ie before the viewing transformation)
  xf = root.contents.transform;
  ui.clickedPoint = clickedPoint = xf.applyInverse(cp);// in coordinates of content
  if (ui.whichPage === 'code_editor') {  // only panning, no selection, allowed in code editor
      root.refTranslation = root.contents.__getTranslation().copy();
      controlActivity = 'panning';
      return;

  }
  //var inserting = ui.nowInserting || ui.nowCloning;
  if (ui.nowCloning) {
    ui.finalizeInsert(clickedPoint,svg.main.contents.transform.scale);
    return;
  }
  root.clickedPoint = clickedPoint;// in coordinates of content
  oselnd = overNode(e,'mousedown');
  if (oselnd) {
    pj.log('control','oselnd',oselnd);
    if (ui.protoOutline && ui.protoOutline.isPrototypeOf(oselnd)) {
      oselnd = controlled;
      pj.log('control','protoOutline');
    }
  }
  if (oselnd) {
    iselnd = ui.selectableAncestor(oselnd);
    if (iselnd.__controlBox) {
      dra = iselnd;
      controlActivity = 'draggingControl';
      pj.log('control','controlActivity set to ',controlActivity);
      draggedControlName = iselnd.__name;
      pj.log('control','dragging '+draggedControlName);
    } else if (protoCustomBox && protoCustomBox.isPrototypeOf(iselnd)) {
      dra = iselnd;
      idx = parseInt(iselnd.__name.substr(1));
      controlActivity = 'draggingCustomControl';
      pj.log('control','controlActivity set to ',controlActivity);
      draggedCustomControlName = iselnd.__name;
      root.refControlledPos = ui.controlled.__getTranslation().copy();
      pj.log('control','dragging custom control '+draggedCustomControlName);
    } else  {
      pj.log('control','control',"SHIFTER111RRR!!");
        iselnd.__select("svg");
      if (iselnd.__draggable) {
        controlActivity = 'shifting';
        selectedPreShift = pj.selectedNode;
        dra = controlled;
      }
      //ui.hideSurrounders();
      pj.log('control','control','controlActivity set to ',controlActivity);
    }
    if (dra) {
      root.dragee = dra;
      pj.log('control','dragee on');
      rfp = geom.toGlobalCoords(dra);
      pj.log("control",'dragging ',dra.__name,'refPos',rfp.x,rfp.y);
      root.refPos = rfp;
      var diagram = ui.containingDiagram(dra);
      if (diagram && diagram.__dragStart) {
        diagram.__dragStart(dra,rfp);
      }
    } else if (!clickedInBox) {
      delete root.dragee;
      pj.log('control','dragee off');
      delete root.refPos;
    }
  } else { // if not iselnd; nothing selected
    root.refTranslation = root.contents.__getTranslation().copy();
    if (controlled) { // this happens when the user clicks on nothing, but something is under adjustment
      b = controlled.__bounds(root.contents);
      xf = root.contents.transform;
      xfip = xf.applyInverse(root.refPoint);
      ui.unselect();
      controlActivity = 'panning';
      pj.log('control','controlActivity set to ',controlActivity);  
    } else {
      ui.unselect();
      controlActivity = 'panning';
      pj.log('control','controlActivity set to ',controlActivity);
    }
  }
}

ui.containingDiagram = function (item) {
  return pj.ancestorWithProperty(item,'__diagram');

}
var mouseMoveListener = function (root,e) {
  var cp,pdelta,tr,s,refPoint,delta,dr,trg,id,rfp,s,npos,drm,xf,clickedPoint;
    trg = e.target;
  if (ui.nowReplacingFromClone) {
    dragOverListener(root,e);
    return;
  }
  cp = root.cursorPoint(e);
  xf = root.contents.transform;
  if (!xf) {
    return;
  }
  clickedPoint = xf.applyInverse(cp);// in coordinates of content
  e.preventDefault();
  if (controlActivity === 'panning') { 
    pdelta = cp.difference(root.refPoint);
    tr = root.contents.__getTranslation();
    s = root.contents.transform.scale;
    tr.x = root.refTranslation.x + pdelta.x;// / s;
    tr.y = root.refTranslation.y + pdelta.y;//
    pj.log("svg","drag","doPan",pdelta.x,pdelta.y,s,tr.x,tr.y);
    svg.main.draw();
    return;
  }
  refPoint = root.refPoint;
  if (refPoint) { 
    delta = cp.difference(refPoint); 
  } 
  dr = root.dragee;
  if (dr) {
    pj.log('control','dragEEE',dr.__name);
    trg = e.target;
    id = trg.id;
     rfp = root.refPos;
    s = root.contents.transform.scale;
    npos = rfp.plus(delta.times(1/s));
    pj.log('control','ZZZ');
    if (controlActivity === 'draggingControl') {
      ui.dragBoundsControl(controlled,draggedControlName,npos);
      pj.root.__draw();
    } else if (controlActivity === 'draggingCustomControl') {
      pj.log('control','NOW DOING THE CUSTOM DRAG');
      ui.dragCustomControl(controlled,draggedCustomControlName,npos);
    } else {
      ui.draggee = dr;
      if (controlActivity === 'shifting') {
        var diagram = ui.containingDiagram(dr);
        if (diagram && diagram.__dragStep) { 
          pj.log('control','drag stepping');
          diagram.__dragStep(dr,npos);
          //dr.__dragStep(npos);
        };
        pj.log('control',"SHIFTING ",dr.__name);
        if (controlled.__dragVertically) {
          npos.x = rfp.x;
        }
        var toDrag = dr.__affixedChild?dr.__parent:dr;
        geom.movetoInGlobalCoords(toDrag,npos);
        controlCenter = geom.toGlobalCoords(toDrag);
        ui.updateControlBoxes(true);
      }
    }
    drm = dr.onDrag;
    if (drm) {
      dr.onDrag(delta);
    }
  }
}

ui.updateOnNextMouseUp = false;

var draggingOver;
var dragOverHighlighted = undefined;

var mouseUpOrOutListener = function (root,e) {
  var cp,xf,clickedPoint;
 
  cp = root.cursorPoint(e);
  xf = root.contents.transform;
  clickedPoint = xf.applyInverse(cp);// in coordinates of content
  ui.lastPoint = {a:cp,b:clickedPoint};
  if (controlActivity === 'draggingControl') {
    if (controlled.__stopAdjust) {
      controlled.__stopAdjust();
    }
  }
  if (controlActivity === 'shifting') {
    if (controlled && controlled.__stopDrag) {
      controlled.__stopDrag();
    }
    controlActivity = 'panning';
    pj.log('control','controlActivity set to ',controlActivity);
  }
  pj.log('control',"mouseUpOrOut");
  delete root.refPoint;
  delete root.refPos;
  delete root.dragee;
  pj.log('control','dragee off');
  delete root.refTranslation;
  svg.mousingOut = true;
  if (ui.updateOnNextMouseUp) { 
    svg.main.updateAndDraw();
    ui.updateOnNextMouseUp = false;
  }
  if (e.type === 'mouseup') {
    pj.tree.refresh();
  }
  controlActivity = undefined;
  pj.log('control','controlActivity set to ',controlActivity);
  ui.showControl();
  svg.mousingOut = false;
}


var dragOverListener = function (root,e) {
  e.preventDefault();
  if (ui.replaceMode ||  ui.draggingText || ui.nowReplacingFromClone) {
    var ovr = overNode(e);
    draggingOver = ovr? ui.selectableAncestor(ovr):undefined;
    if (draggingOver && ui.replaceable(draggingOver)) {
      if (dragOverHighlighted !== draggingOver) {
        //if (ui.nowReplacingFromClone) {
        svg.highlightExtraNode(draggingOver);
        //svg.highlightNodes([draggingOver]);
        dragOverHighlighted = draggingOver;
      }
    } else {
      if (dragOverHighlighted) {
        dragOverHighlighted = undefined;
        svg.highlightExtraNode(undefined);
        //svg.unhighlight();
      }
    }
    if (draggingOver) {
      console.log('DRAG OVER',draggingOver.__name);
    } else {
      console.log('DRAG  OVER NOTHING');
    }
  }
}



var dropListener = function (root,e) {
  var cp,xf;
  if (draggingOver) {
      console.log('DRAG OVER',draggingOver.__name);
  } else {
      console.log('DRAG  OVER NOTHING');
  }
  debugger;
  controlActivity = undefined;
  if (!ui.dropListener) {
    return;
  }
  pj.log('control','drop');
  e.preventDefault();
  if ((ui.draggingText || ui.replaceMode)  && dragOverHighlighted) {
    dragOverHighlighted = undefined;
    svg.unhighlight();
  }
  if (ui.replaceMode && !ui.replaceable(draggingOver)) {		
    return;		
  }
  svgRoot = root;
  cp = root.cursorPoint(e);
  xf = root.contents.transform;
  root.clickedPoint = xf.applyInverse(cp);// in coordinates of content
  ui.dropListener(draggingOver,root.clickedPoint,svg.main.contents.transform.scale);
}

svg.Root.activateInspectorListeners = function () {
  var cel,thisHere;
  if (this.inspectorListenersActivated) {
    return;
  }
  cel = this.__element;
  thisHere = this;
  cel.addEventListener("mousedown",function (e) {mouseDownListener(thisHere,e)});     
  cel.addEventListener("mousemove",function (e) {mouseMoveListener(thisHere,e)});     
  cel.addEventListener("mouseup",function (e) {mouseUpOrOutListener(thisHere,e)});
  cel.addEventListener("mouseleave",function (e) {mouseUpOrOutListener(thisHere,e)});
  //cel.addEventListener("mouseover",(e) => {mouseOverListener(thisHere,e)});     
  //cel.addEventListener("mouseout",(e) => {mouseOutListener(thisHere,e)});     
  cel.addEventListener("dragover", (e) => {dragOverListener(this,e)},false);
      // prevent default to allow drop
  //    event.preventDefault();
 // }, false);

  cel.addEventListener("drop",function (e) {dropListener(thisHere,e)});
  
  
  // dropListener(thisHere,e)});

  this.inspectorListenersActivated = true;
}
   
   
  
   
// when inspecting dom, the canvas is a div, not really a canvas
svg.Root.addButtons = function (navTo) {
  var plusbut,minusbut,navbut,div;
  this.navbut = navbut = html.Element.mk('<div class="button" style="position:absolute;top:0px">'+navTo+'</div>');
  navbut.__addToDom(div);
  div = this.__container;
  this.plusbut = plusbut = html.Element.mk('<div class="button" style="position:absolute;top:0px">+</div>');
  this.minusbut = minusbut = html.Element.mk('<div class="button" style="position:absolute;top:0px">&#8722;</div>');
  plusbut.__addToDom(div);
  minusbut.__addToDom(div);
  this.initButtons();
  }
  

svg.Root.positionButtons = function (wd) {
  this.plusbut.$css({"left":(wd - 50)+"px"});
  this.minusbut.$css({"left":(wd - 30)+"px"});
  this.navbut.$css({"left":"0px"});
}

svg.Root.initButtons = function () {
  this.plusbut.addEventListener("mousedown",svg.startZooming);
  this.plusbut.addEventListener("mouseup",svg.stopZooming);
  this.plusbut.addEventListener("mouseleave",svg.stopZooming);
  this.minusbut.addEventListener("mousedown",svg.startUnZooming);
  this.minusbut.addEventListener("mouseup",svg.stopZooming);
  this.minusbut.addEventListener("mouseleave",svg.stopZooming);
}
