
// By "controls" I mean the the little boxes and lines used to manipulate a shape in drawing (eg the eight control points for a rectangle)
// These are utilites supporting the work - each shape out in the prototypejungle store has its own control methods.

 
// This is one of the code files assembled into pjui.js.

var proportion; // y/x
var controlled;
var controlPoints; // in global coords
var customControlPoints; // in the local coords of controlled, and set by code in controlled
var protoBox;
var protoOutline;
var protoCustomBox;
var controlledShiftOnly = false;
var svgRoot;

  //  for now, always centered on 0,0
var controlBounds = geom.Rectangle.mk(geom.Point.mk(),geom.Point.mk());
var controlCenter = geom.Point.mk();
// all adjustable objects have their origins at center
var updateControlPoints = function () {
  if (!ui.computeControlBounds(controlled)) {
    return;
  }
  // the control points are c00, c01, c02 for the left side of the rectangle. c10, c12 for the middle, c20,c21,c22 for the right 
  var bnds = controlBounds,
    corner = bnds.corner,
    extent = bnds.extent,
    cp = controlPoints,
    cx = corner.x,cy = corner.y,
    ex = extent.x,ey = extent.y,
    hex = 0.5 * ex,hey = 0.5 * ey;
  if (!cp) {
    cp = controlPoints = {};
  }
  pj.log('control','controlBounds',cx,cy,ex,ey);
  cp['c00'] = geom.Point.mk(cx,cy);
  cp['c01'] = geom.Point.mk(cx,cy+hey);
  cp['c02'] = geom.Point.mk(cx,cy+ey);
  cp['c10'] = geom.Point.mk(cx+hex,cy);
  cp['c12'] = geom.Point.mk(cx+hex,cy+ey);
  cp['c20'] = geom.Point.mk(cx+ex,cy);
  cp['c21'] = geom.Point.mk(cx+ex,cy+hey);
  cp['c22'] = geom.Point.mk(cx+ex,cy+ey);
  return cp;
}
  

//called from the editor module
  
ui.initControlProto = function () {
  if  (!protoBox) {
    protoBox = svg.Element.mk(
       '<rect   fill="rgba(0,0,255,0.5)" stroke="black" stroke-width="1" x="-5" y="-5" width="10" height="10"/>');
   ui.protoBox = protoBox;//__hide();
   protoOutline = svg.Element.mk('<rect   fill="transparent" stroke="black" stroke-width="1" x="-50" y="-50" width="100" height="100"/>');
   ui.protoOutline = protoOutline;
  }
}
 
var initCustomProto = function () {
  if  (!protoCustomBox) {
    protoCustomBox = svg.Element.mk(
       '<rect  fill="yellow" stroke="black" stroke-width="1" x="-5" y="-5" width="10" height="10"/>');
    ui.protoCustomBox = protoCustomBox;
  }
   
}



var installMoveCursor = function () {
  if (!ui.nowCloning) {
    svg.main.__element.style.cursor = 'move';
  }
};


var installDefaultCursor = function () {
  if (!ui.nowCloning) {
    svg.main.__element.style.cursor = 'default';
  }
};


var installPointerCursor = function () {
  if (!ui.nowCloning) {
    svg.main.__element.style.cursor = 'pointer';
  }
};

var svCursor;
ui.initBoundsControl = function () {
  ui.initControlProto();
  var boxes = pj.root.__controlBoxes;
  if (boxes) {
    boxes.__bringToFront();
  } else {
    boxes = pj.root.set("__controlBoxes",svg.Element.mk('<g/>'));
    boxes.set('outline',protoOutline.instantiate());
    //boxes.outline.__show();
    boxes.outline["pointer-events"] = "none";
    if (controlled.__draggable) {
      var outlineEl = boxes.outline.__element;
      outlineEl.addEventListener('mouseover',installMoveCursor);
      outlineEl.addEventListener('mouseleave',installDefaultCursor);
    }
    boxes.outline.__unselectable = true;
    for (var nm in controlPoints) {
      var box = protoBox.instantiate();
      box.__controlBox = true;
      boxes.set(nm,box);
      var boxel = box.__element;
      boxel.addEventListener("mouseover",installPointerCursor);//function (e) {
      boxel.addEventListener("mouseleave",installDefaultCursor);//function (e) {
    }
  }
}
 
  
/*
 * if a user clicks where a custom box appears, then treat matters as if the box had been clicked
 */
var clickedInBox = false;
var clickIsInBox = function (p) {
  if (svgRoot.clickedPoint) {
    var cx = svgRoot.clickedPoint.x;
    var cy = svgRoot.clickedPoint.y;
    var px = p.x;
    var py = p.y;
    var hbx = 0.5 * boxDim;
    pj.log('control','clickIsInBox',boxDim,hbx,cx,cy,px,py);
   return (Math.abs(px - cx) < hbx) && (Math.abs(py -cy) < hbx);
  } else {
    return false;
  }
}

ui.updateCustomBoxes = function (points,checkForClick) {
  var boxes,ln,sc,nm,ps,sps,idx,i;
  pj.log('control','UPDATECUSTOMBOXES');
  ui.updateBoxSize();
  controlCenter = geom.toGlobalCoords(controlled);//,localCenter);
  boxes = pj.root.__customBoxes;
  boxes.__moveto(controlCenter);
  ln = points.length;
  sc = geom.scalingDownHere(controlled);
  for (i=0;i<ln;i++) {
    nm = "c"+i;
    ps = points[i];
    sps = ps.times(sc); 
    if (checkForClick && clickIsInBox(sps)) {
      pj.log('control','CLICKED BOX INDEX',i);
      clickedInBox = true;
      svgRoot.dragee = boxes[nm];
      controlActivity = 'draggingCustomControl';
      svgRoot.refPos = sps;
      draggedCustomControlName = nm;
      idx = parseInt(nm.substr(1));
      svgRoot.clickedPoint = undefined;
    }
    boxes[nm].__moveto(sps);
  }
  boxes.__draw();
  ui.showAdjustSelectors(idx);
}
// called when shifting - the points are in coordinates of the shiftee so need not be recomputed

ui.refreshCustomControlBoxes = function () {
  if (customControlPoints) {
    ui.updateCustomBoxes(customControlPoints);
  }
}
ui.initCustomControl = function (points) {
  var ln,boxes,i,nm,box,n,nm,box;
  initCustomProto();
  ln = points.length;
  boxes = pj.root.__customBoxes;
  if (boxes) {
     boxes.__unhide();
     boxes.__bringToFront();
  } else {
    boxes = pj.root.set("__customBoxes",svg.Element.mk('<g/>'));
  }
  for (i=0;i<ln;i++) {
    nm = "c"+i;
    box = boxes[nm];
    if (box) {
      box.__unhide();
    } else {
      boxes.set(nm,protoCustomBox.instantiate());
      var boxEl = boxes[nm].__element;
      boxEl.addEventListener('mouseover',installPointerCursor);
      boxEl.addEventListener('mouseleave',installDefaultCursor);
      
    }
  }
  // now hide the unused boxes, if any
  n = ln;
  while (true) {
    nm = "c"+n;
    box = boxes[nm];
    if (box) {
      box.__hide();
    } else {
      break;
    }
    n++;
  }
  ui.updateCustomBoxes(points,true);
}
    

var boxSize = 15; // in pixels
var boxDim; // in global coords
ui.updateBoxSize = function () {
  var sc,setDim;
  if (!controlled) {
    return;
  }
  sc = pj.root.__getScale();
  boxDim = boxSize/sc;
  setDim = function (bx) {
    bx.width = boxDim;
    bx.height = boxDim;
    bx.x = bx.y = -0.5*boxDim;
    bx["stroke-width"] = 0.05 * boxDim;
  }
  if (protoBox) {
    setDim(protoBox);
  }
  if (protoCustomBox) {
    setDim(protoCustomBox);
  }
}
  
var boxesToHideForScaling = {c00:1,c10:1,c20:1,c02:1,c12:1,c22:1};
  
ui.updateControlBoxes = function (shifting) {
  if (!controlled) {
    
    return;
  }
  if (!controlBounds) {
    svg.highlightNodes([controlled]);
    return;
  }
  var outlineOnly = !ui.nowAdjusting;
  pj.log('control','updateControlBoxes');
  var allBoxes = !outlineOnly;
  var boxes,updateControlBox,showBox,box,extent,corner,element,dst;
  ui.updateBoxSize();  
  if (allBoxes && controlled.__controlPoints) {
    if (shifting) {
      ui.refreshCustomControlBoxes();
    } else {
      customControlPoints = controlled.__controlPoints();
      ui.updateCustomBoxes(customControlPoints,true);
    }
  }
  if (allBoxes && controlled.__customControlsOnly) return;
  if (allBoxes) {
    updateControlPoints();
  }
  boxes = pj.root.__controlBoxes;
  var updateControlBox = function(nm) {
    box = boxes[nm];
    if (outlineOnly) {
      showBox = nm === 'outline'
    } else {
      showBox = true;
      if (!box) {
        return;
      }
      if (proportion) {
        if (boxesToHideForScaling[nm]) {
          showBox = false;
        }
      } else if (!controlled.__adjustable) {
        showBox = false;
      }
    }
    pj.log('control','UUpdateControlBox',nm,showBox);

    if (showBox) {
      box.__show();
      if (nm === 'outline') {
        extent = controlBounds.extent;
        corner = controlBounds.corner;
        element = box.__element;
        box.x = corner.x;
        box.y = corner.y;
        box.width = extent.x;
        box.height = extent.y;
      } else {
        dst = controlPoints[nm];
        box.__moveto(dst);
      }
    } else {
      box.__hide();
      box.__draw();
    }
  }
  for (var nm in controlPoints) {
    updateControlBox(nm);
  }
  updateControlBox('outline');
  boxes.__moveto(controlCenter);
  boxes.__draw();
}

ui.hideControl = function () {
  var boxes = pj.root.__controlBoxes;
  var nm;
  if (boxes) {
    for (var nm in controlPoints) {
      if (boxes[nm]) {
        boxes[nm].__hide();
      }
    }
    boxes.outline.__hide();
    boxes.__draw();
  }
}
  
ui.hideCustomControl = function () {
  var boxes = pj.root.__customBoxes;
  if (boxes) {
    boxes.__hide();
    boxes.__draw();
  }
}
    
ui.clearControl = function () {
  pj.log('control','CLEAR CONTROL');
  proportion = 0;
  ui.controlled = controlled = undefined;
  ui.hideControl();
  ui.hideCustomControl();
  controlActivity = undefined;
}

ui.hasSelectablePart = function (node) {
  return pj.someTreeProperty(node,function (child) {
    if (svg.Element.isPrototypeOf(child)) {
      if (!(child.__unselectable)) return 1;
      return ui.hasSelectablePart(child);
    } else {
      return false;
    }
  });
}


ui.getExtent = function (item) {
  var dim = item.dimension;
  if (dim !== undefined) {
    return geom.Point.mk(dim,dim);
  }
  var width = item.width;
  if (width !== undefined) {
    return geom.Point.mk(width,item.height);
  }
}
ui.computeControlBounds = function (node) {
  var localExtent = ui.getExtent(node);
  if (!localExtent) {
    controlExtent = undefined;
    controlCenter = undefined;
    controlBounds = undefined;
    return undefined;
  }
  //var localExtent = node.__getExtent();
  var sc = geom.scalingDownHere(node);
  var controlExtent = localExtent.times(sc);
  controlCenter = geom.toGlobalCoords(node);//,localCenter);
  controlBounds = geom.Rectangle.mk(controlExtent.times(-0.5),controlExtent);
  proportion = node.__scalable?(controlExtent.y)/(controlExtent.x):0;
  return controlBounds; 
}
  
      
ui.setControlled = function (node) {
  ui.controlled = controlled  = node;
  ui.computeControlBounds(controlled);

  if (ui.nowAdjusting && !controlled.__customControlsOnly) {
    updateControlPoints();
  }
  if (!controlled.__customControlsOnly) {
    ui.initBoundsControl();
  }

  if (controlled.__controlPoints) {
    customControlPoints = controlled.__controlPoints(1);
    ui.initCustomControl(customControlPoints);
  } else {
    if (pj.root.__customBoxes) {
      pj.root.__customBoxes.__hide();
      pj.root.__customBoxes.__draw();
    }
    customControlPoints = undefined;
  }
  return  controlBounds;
}
  
ui.showControl = function () {
  if (controlled) {
    ui.computeControlBounds(controlled);
    ui.updateControlBoxes();//true);
  }
}

  // standard method, which adjusts the bounds 
  
ui.currentZoom = function () {
  return svg.main.contents.transform.scale;
}

ui.ownsExtent = function (item) {
  return item.hasOwnProperty('width') ||  item.hasOwnProperty('dimension');
}

ui.dragBoundsControl = function (controlled,nm,ipos) {
  var bnds,corner,extent,outerCorner,localExtent,marks,cr,originalPos,pos,ULpos,gtr,bx,allowDisplace;
  pj.log('control','dragging bounds control ',nm,ipos.x,ipos.y);
  bx = pj.root.__controlBoxes[nm];
  allowDisplace = false;
  bnds = controlBounds;
  pos = geom.toOwnCoords(pj.root.__controlBoxes,ipos);
  ULpos = pos.plus(bnds.extent.times(0.5)); // relative to the upper left corner
  corner = bnds.corner;
  extent = bnds.extent;
  outerCorner = corner.plus(extent);
  // generate new bounds with corner at upper left (recenter later)  
  switch (nm) {
    case "c00":
      bnds.extent =  outerCorner.difference(pos);
      break;
    case "c01":
      extent.x = outerCorner.x - pos.x;
      if (proportion) {
        extent.y = (extent.x)*proportion;
      }
      break;
    case "c02":
      extent.x = outerCorner.x - pos.x;
      extent.y = pos.y - corner.y;
      break;
    case "c10": 
      extent.y = outerCorner.y - pos.y;
      if (proportion) {
        extent.x = (extent.y)/proportion;
      }
      break;
    case "c12":
      extent.y = pos.y - corner.y;
      if (proportion) {
        extent.x = (extent.y)/proportion;
      }
      break;
    case "c20":
      extent.x = pos.x - corner.x;
      extent.y = outerCorner.y - pos.y;
      break;
    case "c21": 
      extent.x = pos.x - corner.x;
      if (proportion) {
        extent.y = (extent.x)*proportion;
      }
      break;
    case "c22":
      bnds.extent = pos.difference(corner);
      break;
  }
  var minExtent = 10/ui.currentZoom();
  bnds.extent.x = Math.max(minExtent,bnds.extent.x); // don't allow the box to disappear
  bnds.extent.y = Math.max(minExtent,bnds.extent.y); // don't allow the box to disappear
  bx.__moveto(pos);
  pj.log("control","NEW EXTENT",bnds.extent);
  var sc =1/geom.scalingDownHere(controlled);
  pj.log("control","OLD CENTER",controlCenter);
  bnds.corner =  bnds.extent.times(-0.5); 
  localExtent = bnds.extent.times(sc);
  var wta  = controlled.hasOwnProperty('__beenResized')?controlled:ui.whatToAdjust;
  if (wta) {
    if (wta.__mark) {
      marks = wta.__parent.__parent;
      if (marks.assertModified) marks.assertModified(wta);
    }
  } else {
    wta = controlled;
  }
  wta.__setExtent(localExtent,nm);
  wta.__beenResized = true;
  ui.setSaved(false);
  wta.__forVisibleInheritors(function (inh) {
    if (inh.update) {
      inh.update(true);
    }
  });
  wta.__beenAdjusted = true;
  pj.root.__draw();
  ui.updateControlBoxes();
}

   // ipos is in global coords 
ui.dragCustomControl = function (controlled,nm,ipos) {
  var pos = geom.toOwnCoords(controlled,ipos); 
  var idx,boxes,bx,npos,sc,bxnpos;
  pj.log('control','dragging custom control ',nm);
  idx = parseInt(nm.substr(1));
  boxes = pj.root.__customBoxes;
  bx = boxes[nm];
  npos = controlled.__updateControlPoint(idx,pos);
  ui.setSaved(false);
  pj.log('control','npos',idx,npos);
  if (npos === 'drag') {
    var rf  = pj.svg.main.refPos;
    var delta = ipos.difference(rf);
    pj.log('control','delta',rf.x,rf.y,' ',ipos.x,ipos.y,' ',delta.x,delta.y);
    var rfcontrolled = pj.svg.main.refControlledPos;
    controlled.__moveto(rfcontrolled.plus(delta));
    npos = undefined;
  }
  if (!npos) {
    pj.log('control','updatingBOxes');
    var customControlPoints = controlled.__controlPoints();
    ui.updateCustomBoxes(customControlPoints,true);
    return;
  }
  sc = geom.scalingDownHere(controlled);
  bxnpos = npos.times(sc); // the new point relative to the control boxes
  bx.__moveto(bxnpos);
  bx.__draw();
}
  