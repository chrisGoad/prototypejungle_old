
(function (pj) {
  
  var ui = pj.ui;
  var geom  = pj.geom;
  var svg = pj.svg;
  var html = pj.html;

  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract


// properties of a node relevant to mouse control. __draggable,__undraggable,__unselectable,__adjustPrototype
// adjustable nodes are draggable too, unless asserted otherwise by __undraggable.  __dragOnly means that the extent
// of the item cannot be modified

// if a node has a selectable part, a central control square is added, so it can be dragged around.

// at any given time when the mouse is down, there is a controlActivity, which is one of
// shifting, panning, draggingControl (dragging one of the little control boxes), draggingCustomControl,
// draggingControlled (dragging the whole controlled)
// There are, in the general case, three objects involved: pj.selectedNode, shiftee, and controlled

var controlActivity = undefined;

  ui.needsUpdate = 0; // this should be set if an update is expected with a mouseUp 

  
  var draggedControlName = 0;
  var draggedCustomControlName = 0;
  //var draggingCustomControl = 0;
  var surrounded = undefined;
  svg.Element.__setSurrounders  = function (fromControl) {
    if (!svg.surroundersEnabled) {
      return;
    }
    var sz = 5000;
    var surs = pj.root.surrounders;
    if (!surs) {
      surs = svg.main.addSurrounders();
    }
    var rt = svg.main.contents;
    if (this.__setExten) {
      var b = ui.computeControlBounds(this);//ui.setControlled(this);
    } else {
      b = this.__bounds(rt);
    }
    //var b = this.bounds();
    if (!b) {
      surs.hide();
      surs.draw();
      return;
    }
    surs.show();
    surrounded = this;
    var rct = b.expandTo(5,5); // Lines have 0 width in svg's opinion, but we want a surround anyway
    var cr = rct.corner;
    var xt = rct.extent;
    // first top and bottom
    var lx = cr.x - sz;
    var ly = cr.y - sz;
    pj.log("svg","surrounders ",lx,ly);
    var efc = 1.05; // add this much space around the thing
    var ext = 5;// absolute 
    var efcm = efc - 1;
    var st = {fill:"rgba(0,0,0,0.4)"};
    surs.s0.set({x:lx,y:ly,width:sz*2,height:sz-ext});// above
    surs.s1.set({x:lx,y:cr.y+xt.y + ext,width:sz*2,height:sz}); //below    
    surs.s2.set({x:lx,y:cr.y-ext,width:sz-ext,height:xt.y+2*ext});//to left
    surs.s3.set({x:cr.x+xt.x + ext,y:cr.y-ext,width:sz,height:xt.y + 2*ext});// to right
    surs.visibility = "inherit";
    surs.draw();
    return;
    if (this.__setExtent  && !fromControl) {
      ui.updateControlBoxes();
      return;
      controlled = this;
      ui.showControl();
      return;
      if (controlled.__updateControlBoxes) {  // custom method?
        controlled.__updateControlBoxes();
      } else {
        b.__updateControlBoxes(); // the standard method which updates bounds
      }
    } 
      
  }
  
  svg.resetSurrounders = function () {
    var slnd = pj.selectedNode;
    if (slnd) {
      slnd.__setSurrounders();
    }
  }
 
  
  // The xdom element means "externalDom; a "regular" page dom element that appears over the svg viewport.
  // It comes with a regular svg rect to delimit it's area.
  //Of course, it behaves differently from other shapes; cannot be scaled or rotated
  // and held in the canvas.domElements Array
  // fields: omElement /is a dom.OmElement(ement, and __dom__ is the for-real DOM
  // rename to DomShape?

  
  svg.Root.setZoom = function (trns,ns) {
    var cntr = geom.Point.mk(this.width()/2,this.height()/2);// center of the screen
    var ocntr = trns.applyInverse(cntr);
    trns.scale = ns;
    var ntx = cntr.x - (ocntr.x) * ns;
    var nty = cntr.y - (ocntr.y) * ns;
    var tr = trns.translation;
    tr.x = ntx;
    tr.y = nty;
    ui.updateBoxSize();
  }
  
  
  // zooming is only for the main canvas, at least for now
  function zoomStep(factor) {
    var trns = svg.main.contents.transform;
    if (!trns) return;
    var s = trns.scale;
    pj.log("svg","zoom scaling",s);
    svg.main.setZoom(trns,s*factor);
    svg.draw();
  }
  
  var nowZooming = false;
  var zoomFactor = 1.1;
  var zoomInterval = 150;
  var zoomer = function zoomer() {
    if (nowZooming) {
      zoomStep(cZoomFactor);
      setTimeout(zoomer,zoomInterval);
    }
  }
  
  
  svg.startZooming = function () {
    pj.log("svg","start zoom");
    cZoomFactor = zoomFactor;
    if (!nowZooming) {
      nowZooming = 1;
      zoomer();
    }
  }
  
  svg.startUnZooming = function () {
    cZoomFactor = 1/zoomFactor;
    if (!nowZooming) {
      nowZooming = 1;
      zoomer();
    }
  }
  
  svg.stopZooming = function() {
    pj.log("svg","stop zoom");
    nowZooming = 0;
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

  // what to do when an element is selected by clicking on it in graphics or tree
  pj.Object.__select = function (src,dontDraw) { // src = "svg" or "tree"
    pj.selectedNodePath =this.__pathOf(pj.root);
    console.log("__UNSELECT",pj.selectedNode?pj.selectedNode.__name:'null');
    if (pj.selectedNode && (pj.selectedNode !== this) && pj.selectedNode.__whenUnselected) {
      pj.selectedNode.__whenUnselected();
    }
    pj.selectedNode = this;
    this.__selected = 1;
    if (src === 'tree') {
      controlActivity = undefined;
      ui.clearControl();
    }
    ui.nowAdjusting = (this.__setExtent || this.__controlPoints);

    if (src === "svg") {

      var thisHere = this;
      pj.selectCallbacks.forEach(function (c) {
        c(thisHere);
      });
    }
    if (ui.nowAdjusting) {
          ui.whatToAdjust = undefined;
          ui.setControlled(this);
          ui.updateControlBoxes(1);
          ui.hideSurrounders();
    } else {
      ui.nowAdjusting = 0;
      //ui.whatToAdjust = undefined;
      ui.clearControl();
      this.__setSurrounders();// highlight
      shiftee = setShiftee(this);//pj.ancestorWithProperty(this,'__shiftable');
      pj.log('control','shiftee',shiftee);
      ui.initShifter();
    }
  }
   
  ui.zoomToSelection = function () {
    var rt = svg.main;
    var snd = pj.selectedNode;
    if (snd) { 
      var bnds = snd.__bounds(rt.contents);
      var xf = rt.fitBounds(0.2,bnds);
    }
  }
  ui.hideSurrounders =  function () {
    var surs = pj.root.surrounders;
    if (surs) {
      surs.hide();
      surs.draw();
    }
    surrounded = undefined;
  }
  
  ui.unselect = function () {
    if (pj.selectedNode) {
      console.log("UNSELECT",pj.selectedNode.__name);
      if (pj.selectedNode.__whenUnselected) {
        pj.selectedNode.__whenUnselected();
      }
      pj.selectedNode.__selected = 0;
      pj.selectedNode = undefined;
    }
    ui.hideSurrounders();
    ui.clearControl();
   // pj.tree.showTop();
  }
  
  //  refresh the whole UI, 
  ui.refresh = function (doFit) {
    var selectedPath;
    selectedPath = 0;
    if (pj.selectedNode) {
      selectedPath = pj.pathOf(pj.selectedNode,pj.root);
    }
    svg.main.updateAndDraw(undefined,doFit);
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
    ui.needsUpdate = 0;
  }
  
  
  svg.Root.addSurrounders = function () {
    if (!svg.surroundersEnabled) {
      return;
    }
    var cn = this.contents;
    if (cn.surrounders) {
      return cn.surrounders;
    }
    var surs = svg.tag.g.mk();//pj.Array.mk();
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
  
  
   // for selection in the inspector, and hovering generally
  svg.Root.activateInspectorListeners = function () {
    if (this.inspectorListenersActivated) {
      return;
    }
      var cel = this.__element;
      var thisHere = this;
    
    cel.addEventListener("mousedown",function (e) {
      svgRoot = thisHere;
      ui.mouseDownEvent = e;
      // for bubbles, the front Element is the bubble over which the user is now hovering. When there is a click, this is the target
     e.preventDefault();
    // thisHere.draggingControlled = thisHere.panning = draggingControl = draggingCustomControl = 0;
     //controlActivity = undefined;
     //ui.hideControl();
      // draggingControlled as opposed to draggingControl, which means dragging one of the control boxes
      //debugger;
      var trg = e.target;
      var id = trg.id;
      var cp = thisHere.cursorPoint(e);
      thisHere.refPoint = cp; // refpoint is in svg coords (ie before the viewing transformation)
      //pj.log('control','refPoint',cp.x,cp.y);
      var xf = thisHere.contents.transform;
      var cp = thisHere.clickedPoint = xf.applyInverse(thisHere.refPoint);// in coordinates of content
      //pj.log('control','clickedPoint',cp.x,cp.y);
      //pj.log('control','TARGET',trg);
      var iselnd = trg.__prototypeJungleElement;
      if (iselnd) {
        //pj.log('control','ISELND',iselnd.__name);
        if (ui.protoOutline && ui.protoOutline.isPrototypeOf(iselnd)) {
          iselnd = undefined;
          //pj.log('control',"SELECTED OUTLINE");
        }
      }
      pj.log("svg","mousedown ",id);
      //debugger;
      if (iselnd) {
        if (iselnd === shifter) {
          pj.log('control','SHiFTEEE');

        }
        iselnd = ui.selectableAncestor(iselnd);
        pj.log('control','iselnd',iselnd.__name);
        //thisHere.draggingControlled =  controlledIsDraggable = 0; //initialize to not-dragging
      } else {
        thisHere.refTranslation = thisHere.contents.__getTranslation().copy();
        if (controlled) { // this happens when the user clicks on nothing, but something is under adjustment
          var b = controlled.__bounds(thisHere.contents);
          var xf = thisHere.contents.transform;
          var xfip = xf.applyInverse(thisHere.refPoint);
          if (b.contains(xfip)) {
            iselnd = controlled;
            if (controlledIsDraggable) {
              controlActivity = 'draggingControlled';
              pj.log('control','controlActivity set to ',controlActivity);
            }
           // thisHere.draggingControlled =  controlledIsDraggable;
          } else {
            ui.unselect();
            controlActivity = 'panning';
            pj.log('control','controlActivity set to ',controlActivity);

            ui.noShifter();
            return;
          }
        } else {
          ui.unselect();
          controlActivity = 'panning';
          pj.log('control','controlActivity set to ',controlActivity);

          ui.noShifter();
          return;
        }
      }
      
      //if (protoBox && protoBox.isPrototypeOf(iselnd)) {
      pj.log('control',"ZUUUB");
      if (iselnd.isoControl) { // isolated control  with custom methods
        pj.log('control',"ISOCONTROL");
        controlledIsDraggable = 1;
        dra = iselnd;
      } else if (iselnd === shifter) {
        pj.log('control',"SHIFTER111RRR!!");
        controlActivity = 'shifting';
        selectedPreShift = pj.selectedNode;
        ui.hideSurrounders();

        pj.log('control','controlActivity set to ',controlActivity);

        dra = shiftee;
      } else if (iselnd.__controlBox) {
        var dra = iselnd;
        controlActivity = 'draggingControl';
        pj.log('control','controlActivity set to ',controlActivity);
        ui.showAdjustSelectors();

        draggedControlName = iselnd.__name;
        pj.log('control','dragging '+draggedControlName);
      } else if (protoCustomBox && protoCustomBox.isPrototypeOf(iselnd)) {
        dra = iselnd;
        var idx = parseInt(iselnd.__name.substr(1));
        ui.showAdjustSelectors(idx);
        //if (idx === 0) {
        //  debugger;
        //  tree.setWhatToAdjust(ui.whatToAdjust?ui.whatToAdjustIndex:tree.lastAdjustable(controlled));
        //}

        controlActivity = 'draggingCustomControl';
       pj.log('control','controlActivity set to ',controlActivity);

        draggedCustomControlName = iselnd.__name;
        pj.log('control','dragging custom control '+draggedCustomControlName);
      } else {
        iselnd.__select("svg");
        dra = controlledIsDraggable?iselnd:undefined;
        pj.log('control',"DRA",dra);
        if (controlledIsDraggable) {
          controlActivity = 'draggingControlled';
          pj.log('control','controlActivity set to ',controlActivity);

        }
      }
      if (dra) {
        thisHere.dragee = dra;
        pj.log('control','dragee on');
        var rfp = geom.toGlobalCoords(dra);
        pj.log("control",'dragging ',dra.__name,'refPos',rfp.x,rfp.y);
        thisHere.refPos = rfp;
        if (controlledIsDraggable && dra.startDrag) {
          dra.startDrag(rfp);
        }
      } else if (!clickedInBox) {
      delete thisHere.dragee;
      pj.log('control','dragee off');
      delete thisHere.refPos;
    }
  }); 
    
     
      
    cel.addEventListener("mousemove",function (e) {
      e.preventDefault();
      pj.log('control','mousemove  controlActivity',controlActivity);
        var cp = thisHere.cursorPoint(e);
      if (controlActivity === 'panning') { 
        var pdelta = cp.difference(thisHere.refPoint);
        var tr = thisHere.contents.__getTranslation();
        var s = thisHere.contents.transform.scale;
        tr.x = thisHere.refTranslation.x + pdelta.x;// / s;
        tr.y = thisHere.refTranslation.y + pdelta.y;//
        pj.log("svg","drag","doPan",pdelta.x,pdelta.y,s,tr.x,tr.y);
        svg.main.draw();
        return;
      }
      var refPoint = thisHere.refPoint;
      if (refPoint) { 
        var delta = cp.difference(refPoint); 
      } 
      var dr = thisHere.dragee;
      if (dr) {
        var trg = e.target;
        var id = trg.id;
         var rfp = thisHere.refPos;
        var s = thisHere.contents.transform.scale;
        var npos = rfp.plus(delta.times(1/s));
        //if (draggingControl) {
        if (controlActivity === 'draggingControl') {
          ui.dragBoundsControl(controlled,draggedControlName,npos);
          if (controlled.update) {
            controlled.update();
            controlled.draw();
          }
        } else if (controlActivity === 'draggingCustomControl') {
          pj.log('control','NOW DOING THE CUSTOM DRAG');
          ui.dragCustomControl(controlled,draggedCustomControlName,npos);
        } else {
          ui.draggee = dr;
          ui.hideControl();
          //if (shifting) {
          //   pj.log('control','now shifting');
          //}
         // if (controlledIsDraggable || shifting) {
          if ((controlActivity === 'draggingControlled') || (controlActivity === 'shifting')) {
            if (dr.dragStep && (controlActivity !== 'shifting')) { 
              dr.dragStep(npos);
            } else {
              geom.movetoInGlobalCoords(dr,npos);
              //dr.__setSurrounders();// highlight
              if (controlActivity === 'shifting') {
                ui.placeShifter();
              } else {
                controlCenter = geom.toGlobalCoords(dr);
                ui.updateControlBoxes();
              }
            }
          }
        }
        var drm = dr.onDrag;
        if (drm) {
          dr.onDrag(delta);
        }
      }
    });  
      
    var mouseUpOrOut = function (e) { 
      pj.log('control',"mouseUpOrOut");
      delete thisHere.refPoint;
      delete thisHere.refPos;
      delete thisHere.dragee;
      pj.log('control','dragee off');
      delete thisHere.refTranslation;
      if (controlActivity === 'shifting') {
        if (selectedPreShift) { 
          selectedPreShift.__select();
        }
      }
      controlActivity = undefined;
      pj.log('control','controlActivity set to ',controlActivity);

      //thisHere.panning = 0;
      svg.mousingOut = 1;
      svg.main.updateAndDraw();
      //if (ui.needsUpdate) ui.updateAndDraw();
      ui.showControl();
      svg.mousingOut = 0;

    }
    cel.addEventListener("mouseup",mouseUpOrOut);
    cel.addEventListener("mouseleave",mouseUpOrOut);
    this.inspectorListenersActivated = 1;
  }
   
   
  
   
  // when inspecting dom, the canvas is a div, not really a canvas
  svg.Root.addButtons = function (navTo) {
    this.navbut = navbut = html.Element.mk('<div class="button" style="position:absolute;top:0px">'+navTo+'</div>');
    navbut.__addToDom(div);
    var plusbut,minusbut,navbut;
    var div = this.__container;
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

//end extract


})(prototypeJungle);

  