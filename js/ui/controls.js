
// By "controls" I mean the the little boxes and lines used to manipulate a shape in drawing (eg the eight control points for a rectangle)
// These are utilites supporting the work - each shape out in the prototypejungle store has its own control methods.

// Each item might have a __getBounds property, which returns rectangle.
// If it does, it should also have an  __enactBounds method which causes the item
// to lie within those bounds.

(function (pj) {
  var actionHt;
  
  var ui = pj.ui;
  var dom = pj.dom;
  var html = pj.html;
  var geom = pj.geom;
  var svg = pj.svg;
  var tree = pj.tree;
  var lightbox = pj.lightbox;
 
// This is one of the code files assembled into pjdraw.js. //start extract and //end extract indicate the part used in the assembly
//start extract
var proportion; // y/x
var controlled;
var controlPoints; // in global coords
var customControlPoints; // in the local coords of controlled, and set by code in controlled
var protoBox;
var protoOutline;
var protoCustomBox;
var controlledShiftOnly = false;
//var controlledAdjustPrototype = 1;
var shifter;
var svgRoot;

ui.protoToAdjust = 1; // for mark sets, adjust the prototype of the selected  object by default
  //  for now, always centered on 0,0
var controlBounds = geom.Rectangle.mk(geom.Point.mk(),geom.Point.mk());
var controlCenter = geom.Point.mk();
// all adjustable objects have their origins at center
ui.updateControlPoints = function () {
  ui.computeControlBounds(controlled);
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
  cp['shifter'] = cp['c10'];
  cp['c12'] = geom.Point.mk(cx+hex,cy+ey);
  cp['c20'] = geom.Point.mk(cx+ex,cy);
  cp['c21'] = geom.Point.mk(cx+ex,cy+hey);
  cp['c22'] = geom.Point.mk(cx+ex,cy+ey);
  return cp;
}
  
  
  
ui.initControlProto = function () {
  if  (!protoBox) {
    protoBox = svg.Element.mk(
       '<rect  fill="rgba(0,0,255,0.5)" stroke="black" stroke-width="1" x="-5" y="-5" width="10" height="10"/>');
   ui.protoBox = protoBox;
   protoOutline = svg.Element.mk('<rect  fill="transparent" stroke="black" stroke-width="1" x="-50" y="-50" width="100" height="100"/>');
   ui.protoOutline = protoOutline;
  }
}
  
  
ui.mkShifter = function () {
  var reflectX = function (p) {
    return geom.Point.mk(p.x,-p.y);
  }
  var reflectY = function (p) {
    return geom.Point.mk(-p.x,p.y);
  }
  var reflectXY = function (p) {
    return geom.Point.mk(-p.x,-p.y);
  }
  var dim = 10;
  var headFraction = 0.4;
  var widthFraction = 0.1;
  var smallDim = dim * widthFraction;
  var top = geom.Point.mk(0,-dim);
  var right = geom.Point.mk(dim,0);
  var bottom = geom.Point.mk(0,dim);
  var left = geom.Point.mk(-dim,0);
  var topToRight = right.difference(top);
  var topArrowR = top.plus(topToRight.times(headFraction))
  var topArrowHBR = geom.Point.mk(smallDim,topArrowR.y);
  var topArrowBR = geom.Point.mk(smallDim,-smallDim);
  var rightArrowT =right.plus(topToRight.minus().times(headFraction));
  var rightArrowHBT = geom.Point.mk(rightArrowT.x,-smallDim);
  var pstring = '';
  var bstring = '';
  var pseq =
    [top,topArrowR,topArrowHBR,topArrowBR,
     rightArrowHBT,rightArrowT,right,reflectX(rightArrowT),reflectX(rightArrowHBT),
     reflectX(topArrowBR),reflectX(topArrowHBR),reflectX(topArrowR),
     bottom,reflectXY(topArrowR),reflectXY(topArrowHBR),reflectXY(topArrowBR),
     reflectXY(topArrowBR),reflectXY(rightArrowHBT),reflectXY(rightArrowT),
     left,reflectY(rightArrowT),reflectY(rightArrowHBT),
     reflectY(topArrowBR),reflectY(topArrowHBR),reflectY(topArrowR),top];
  pseq.forEach(function (p) {
    pstring += p.x + ',' + p.y + ' ';
  });
  var bseq = [top,right,bottom,left,top];
  bseq.forEach(function (p) {
    bstring += p.x + ',' + p.y + ' ';
  });
  var pline = '<polyline stroke-width="1" fill="red" stroke="black" points="'+pstring+'"/>'
  var bline = '<polyline stroke-width="1" fill="rgba(0,0,255,0.5)" stroke="black" points="'+bstring+'"/>'
  pj.log('control',pline);
  var rs = svg.Element.mk('<g/>');
  rs.set('bline',svg.Element.mk(bline));
  rs.bline.__unselectable = true;
  rs.set('pline',svg.Element.mk(pline));
  rs.pline.__unselectable = true;
  return rs;
}
  
ui.initCustomProto = function () {
  if  (!protoCustomBox) {
    protoCustomBox = svg.Element.mk(
       '<rect  fill="yellow" stroke="black" stroke-width="1" x="-5" y="-5" width="10" height="10"/>');
    ui.protoCustomBox = protoCustomBox;
  }
   
}

 
ui.initBoundsControl = function () {
  ui.initControlProto();
  var boxes = pj.root.__controlBoxes;
  if (boxes) {
    boxes.__bringToFront();
  } else {
    boxes = pj.root.set("__controlBoxes",svg.Element.mk('<g/>'));
    boxes.set('outline',protoOutline.instantiate());
    boxes.outline["pointer-events"] = "none";
    boxes.outline.__unselectable = true; 
    for (var nm in controlPoints) {
      if (nm !== 'shifter') {
        var box = protoBox.instantiate();
        box.__controlBox = true;
        boxes.set(nm,box);   
      }
      shifter = ui.mkShifter();
      boxes.set('shifter',shifter);
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
    var hbx = 0.5 * boxSize;
    pj.log('control','clickIsInBox',hbx,cx,cy,px,py);
   return (Math.abs(px - cx) < hbx) && (Math.abs(py -cy) < hbx);
  } else {
    return false;
  }
}

ui.updateCustomBoxes = function (points) {
  var boxes,ln,sc,nm,ps,sps,idx,i;
  pj.log('control','UPDATECUSTOMBOXES');
  ui.updateBoxSize();
  controlCenter = geom.toGlobalCoords(controlled);//,localCenter);
  boxes = pj.root.__customBoxes;
  boxes.__moveto(controlCenter);
  ln = points.length;
  sc = geom.scalingDownHere(controlled);
  clickedBoxIndex = -1;
  for (i=0;i<ln;i++) {
    nm = "c"+i;
    ps = points[i];
    sps = ps.times(sc); //geom.toGlobalCoords(controlled,points[i]);//,localCenter);
    if (clickIsInBox(sps)) {
      
      pj.log('control','CLICKED BOX INDEX',i);
      clickedInBox = true;
      svgRoot.dragee = boxes[nm];
      controlActivity = 'draggingCustomControl';
      svgRoot.refPos = sps;
      draggedCustomControlName = nm;
      idx = parseInt(nm.substr(1));
//      ui.showAdjustSelectors(idx);
      svgRoot.clickedPoint = undefined;
    }
    boxes[nm].__moveto(sps);
  }
  boxes.__draw();
  ui.showAdjustSelectors(idx);
}
 
  ui.initCustomControl = function (points) {
    var ln,boxes,i,nm,box,n,nm,box;
    ui.initCustomProto();
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
    ui.updateCustomBoxes(points);
  }
    


var boxSize = 15; // in pixels
var boxDim; // in global coords
ui.updateBoxSize = function () {
  var sc,setDim;
  if (!controlled && !shifter) {
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
  if (shifter) {
    setDim(shifter);
    shifter.__draw();
  }
  if (protoBox) {
    setDim(protoBox);
  }
  if (protoCustomBox) {
    setDim(protoCustomBox);
  }
}
  
var boxesToHideForScaling = {c00:1,c10:1,c20:1,c02:1,c12:1,c22:1,shifter:1};
  
ui.updateControlBoxes = function (firstCall) {
  pj.log('control','updateControlBoxes')
  var boxes,updateControlBox,showBox,box,extent,corner,element,dst;
  if (!controlled) {
    return;
  }
  ui.updateBoxSize();  
  if (controlled.__controlPoints) {
    points = controlled.__controlPoints();
    pj.log('control','ncp',points[0].y);
    ui.updateCustomBoxes(points);
  }
  if (controlled.__customControlsOnly) return;
  ui.updateControlPoints();
  boxes = pj.root.__controlBoxes;
  updateControlBox = function(nm) {
    showBox = true;
    box = boxes[nm];
    if (proportion) {
      if (boxesToHideForScaling[nm]) {
        showBox = false;
      }
    } else {
       if (nm === 'c10') {
         showBox = !controlled.__draggable;
         pj.log('control','c01',showBox,firstCall);
       } else if (!controlled.__adjustable) {
         showBox = false;
       }
    }
    if (nm === 'shifter') {
        showBox = controlled.__draggable;
    }
    if (controlled.__showBox) {
      var sb = controlled.__showBox(nm);
      if (sb !== undefined) {
        showBox = sb;
        firstCall = true;
      }
    }
    //if (nm == 'extent') {
    //  showBox = 0;
    //}
    if (showBox) {
      if (firstCall) box.__show();
      if (nm === 'outline') {
        extent = controlBounds.extent;
        corner = controlBounds.corner;
        element = box.__element;
        element.setAttribute('x',corner.x);
        element.setAttribute('y',corner.y);
        element.setAttribute('width',extent.x);
        element.setAttribute('height',extent.y);
     
      } else {
        dst = controlPoints[nm];//.plus(geom.Point.mk(-0.5*boxDim,-0.5*boxDim))
        box.__moveto(dst);
      }
    } else if (firstCall) {
      box.__hide();
      box.__draw();
    }
  }
  for (nm in controlPoints) {
    updateControlBox(nm);
  }
  updateControlBox('outline');
  boxes.__moveto(controlCenter);
  boxes.__draw();
  if (!controlled) {
    debugger;
  }

}

  
ui.hideControl = function () {
  var boxes = pj.root.__controlBoxes;
  var nm;
  if (boxes) {
    for (nm in controlPoints) {
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
  proportion = 0;
  ui.controlled = controlled = undefined;
  ui.hideControl();
  ui.hideCustomControl();
  controlActivity = undefined;
  if (shifter) {
    shifter.__hide();
  }
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

ui.computeControlBounds = function (node) {
  var localExtent = node.__getExtent();
  var sc = geom.scalingDownHere(node);
  var controlExtent = localExtent.times(sc);
  controlCenter = geom.toGlobalCoords(node);//,localCenter);
  controlBounds = geom.Rectangle.mk(controlExtent.times(-0.5),controlExtent);
  proportion = node.__scalable?(controlExtent.y)/(controlExtent.x):0;
  return controlBounds; 
}
  
      
ui.setControlled = function (node) {
  var points;
  ui.controlled = controlled  = node; 
  ui.computeControlBounds(controlled);
  if (!controlled.__customControlsOnly) {
    ui.updateControlPoints();
    ui.initBoundsControl();
  }
  if (controlled.__controlPoints) {
    points = controlled.__controlPoints(1);
    ui.initCustomControl(points);
  } else {
    if (pj.root.__customBoxes) {
      pj.root.__customBoxes.__hide();
      pj.root.__customBoxes.__draw();
    }
  }
  return  controlBounds;
}
  
ui.showControl = function () {
  if (controlled) {
    ui.computeControlBounds(controlled);
    ui.updateControlBoxes(true);
  }
}

  // standard method, which adjusts the bounds 
  
  
   ui.dragBoundsControl = function (controlled,nm,ipos) {
      var bnds,corner,extent,outerCorner,localExtent,cr,originalPos,pos,ULpos,gtr,bx,allowDisplace;
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
    bx.__moveto(pos);
    pj.log("control","NEW EXTENT",bnds.extent);
    var sc =1/geom.scalingDownHere(controlled);
    pj.log("control","OLD CENTER",controlCenter);
    bnds.corner =  bnds.extent.times(-0.5);
  
    localExtent = bnds.extent.times(sc);
    pj.log('control','WHAT TO ADJUST ',ui.whatToAdjust);
    if (ui.whatToAdjust) {
      var wta  = ui.whatToAdjust;
      wta.__setExtent(localExtent,nm);
      if (wta.__mark) {
        marks = wta.__parent.__parent;
        if (marks.assertModified) marks.assertModified(wta);
      }
      pj.root.__draw();
      ui.needsUpdate = false;
    } else {
      ui.needsUpdate = true;
    }
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
    var points = controlled.__controlPoints();
    ui.updateCustomBoxes(points);
    return;
  }
  sc = geom.scalingDownHere(controlled);
  if (!npos.times) {
    debugger;
  }
  bxnpos = npos.times(sc); // the new point relative to the control boxes
  bx.__moveto(bxnpos);
  bx.__draw();
   ui.needsUpdate = true;
}
  
//end extract


})(prototypeJungle);

