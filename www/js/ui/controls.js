
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
  var controlledIsDraggable = 0;
  var controlledDragOnly = 0;
  var controlledShowCenterDragger = 0;
  var controlledAdjustPrototype = 0;
  var protoToAdjust = 0;
  //  for now, always centered on 0,0
  var controlBounds = geom.Rectangle.mk(geom.Point.mk(),geom.Point.mk());
  var controlCenter = geom.Point.mk();
  // all adjustable objects have their origins at center
  ui.updateControlPoints = function () {
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
    cp['center'] = geom.Point.mk(cx+hex,cy+hey);
    //cp['extent'] = extent; 
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
  
  
  ui.initCustomProto = function () {
    if  (!protoCustomBox) {
      //boxes = ui.root.set("__controlBoxes",svg.Element.mk('<g/>'));
      protoCustomBox = svg.Element.mk(
         '<rect  fill="yellow" stroke="black" stroke-width="1" x="-5" y="-5" width="10" height="10"/>');
      ui.protoCustomBox = protoCustomBox;
    }
     
  }

  
  ui.initBoundsControl = function () {
    ui.initControlProto();
    var boxes = pj.root.__controlBoxes;
    if (boxes) {
      boxes.bringToFront();
    
    } else {
      boxes = pj.root.set("__controlBoxes",svg.Element.mk('<g/>'));
      boxes.set('outline',protoOutline.instantiate());
      boxes.outline.__unselectable = 1; 
      for (var nm in controlPoints) {
          boxes.set(nm,protoBox.instantiate());
      } 
    }
    var showCenter = controlledShowCenterDragger
    for (var nm in controlPoints) {
      var box = boxes[nm];
      if (nm === "center") {
        if (controlledShowCenterDragger) {
          box.show();
        } else {
          box.hide();
        }
      } else {
        if (controlledDragOnly) {
          box.hide();
        } else {
          box.show();
        }
      }
    }
  }
  
  // the custom boxes are called c0...cn-1
  
  ui.updateCustomBoxes = function (points) {
    var boxes = pj.root.__customBoxes;
    boxes.moveto(controlCenter);
    var ln = points.length;
    var sc = geom.scalingDownHere(controlled);

    for (var i=0;i<ln;i++) {
      var nm = "c"+i;
      var ps = points[i];
      var sps = ps.times(sc); //geom.toGlobalCoords(controlled,points[i]);//,localCenter);
      boxes[nm].moveto(sps);
    }
    boxes.draw();
  }
 
  ui.initCustomControl = function (points) {
    ui.initCustomProto();
    var ln = points.length;
    var boxes = pj.root.__customBoxes;
    if (boxes) {
      //boxes.unhide();
      boxes.bringToFront();
    
    } else {
      boxes = pj.root.set("__customBoxes",svg.Element.mk('<g/>'));
      for (var i=0;i<ln;i++) {
        var nm = "c"+i;
        boxes.set(nm,protoCustomBox.instantiate());
      }
    }
    ui.updateCustomBoxes(points);
  }
    


  var boxSize = 15; // in pixels
  var boxDim; // in global coords
  ui.updateBoxSize = function () {
    if (!controlled) {
      return;
    }
    var sc = pj.root.getScale();
    var extent = controlBounds.extent,

    //boxDim = Math.min(boxSize/sc,extent.x/3,extent.y/3);
     boxDim = Math.min(boxSize/sc,extent.x/2);
   
    protoBox.width = boxDim;
    protoBox.height = boxDim;
    protoBox.x = protoBox.y = -0.5*boxDim;
    protoBox["stroke-width"] = 0.05 * boxDim;
  }
  
  var boxesToHideForScaling = {c00:1,c10:1,c20:1,c02:1,c12:1,c22:1};
  
  ui.updateControlBoxes = function (firstCall) {
    ui.updateControlPoints();
    ui.updateBoxSize();  
    var boxes = pj.root.__controlBoxes;
    var updateControlBox = function(nm) {
      var showBox = 1;
      var box = boxes[nm];
      if (proportion) {
        if (boxesToHideForScaling[nm]) {
          showBox = 0;
        }
      }
      if (nm == "center") {
        showBox = controlledShowCenterDragger;
      } else if (nm == 'extent') {
        showBox = 0;
      }
      if (showBox) {
        if (firstCall) box.show();
        if (nm === 'outline') {
          var extent = controlBounds.extent;
          var corner = controlBounds.corner;
          var element = box.__element;
          element.setAttribute('x',corner.x);
          element.setAttribute('y',corner.y);
          element.setAttribute('width',extent.x);
          element.setAttribute('height',extent.y);
       
        } else {
          var dst = controlPoints[nm];//.plus(geom.Point.mk(-0.5*boxDim,-0.5*boxDim))
          box.moveto(dst);
        }
      } else if (firstCall) {
        box.hide();
      }
    }
    for (nm in controlPoints) {
      updateControlBox(nm);
    }
    updateControlBox('outline');
    boxes.moveto(controlCenter);
    boxes.draw();
    if (controlled.controlPoints) {
      var points = controlled.controlPoints();
      pj.log('control','ncp',points[0].y);
      ui.updateCustomBoxes(points);
      //code
    }
  }
  
  
  ui.hideControl = function () {
    var boxes = pj.root.__controlBoxes;
    if (boxes) {
      //boxes.hide();
      for (nm in controlPoints) {
        boxes[nm].hide();
      }
      boxes.outline.hide();
      boxes.draw();
    }
  }


ui.clearControl = function () {
  proportion = 0;
  ui.controlled = controlled = undefined;
  ui.hideControl();
}

ui.hasSelectablePart = function (node) {
  return pj.someTreeProperty(node,function (child) {
    if (svg.Element.isPrototypeOf(child)) {
      if (!(child.__unselectable)) return 1;
      return ui.hasSelectablePart(child);
    } else {
      return 0;
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
    //console.log('controlCenter',controlCenter.x,controlCenter.y);
    return controlBounds; 
  }
  
  ui.setControlled = function (node) {
    ui.controlled = controlled  = node; 
    controlledIsDraggable = !(node.__undraggable);
    controlledDragOnly = node.__dragOnly;
    controlledShowCenterDragger = controlledDragOnly || (controlledIsDraggable && ui.hasSelectablePart(node));
    if (pj.isComputed(node) ) {
      protoToAdjust  = Object.getPrototypeOf(controlled);
      inheritorsToAdjust = pj.inheritors(protoToAdjust);
      controlledIsDraggable = !!(node.startDrag);
    } else { 
      protoToAdjust = 0;
      inheritorsToAdjust = 0;
    }
    ui.computeControlBounds(controlled);
    ui.updateControlPoints();
    ui.initBoundsControl();
    if (controlled.controlPoints) {
      var points = controlled.controlPoints();
      ui.initCustomControl(points);
      //code
    }
    return  controlBounds;
  }
  
  ui.showControl = function () {
    if (controlled) {
      ui.computeControlBounds(controlled);
      ui.updateControlBoxes(1);
    }
  }

  // standard method, which adjusts the bounds 
  
  
   ui.dragBoundsControl = function (controlled,nm,ipos) {
      pj.log('control','dragging bounds control ',nm,ipos.x,ipos.y);
      debugger;
      var bnds,corner,extent,outerCorner,newExtent,cr,originalPos,pos,gtr,
      bx = pj.root.__controlBoxes[nm];
    var allowDisplace = 0;
    var bnds = controlBounds;
    var pos = geom.toOwnCoords(pj.root.__controlBoxes,ipos);
    var ULpos = pos.plus(bnds.extent.times(0.5)); // relative to the upper left corner
    corner = bnds.corner;
    extent = bnds.extent;
    outerCorner = corner.plus(extent);
    // generate new bounds with corner at upper left (recenter later)  
    switch (nm) {
      case "c00":
        if (controlledIsDraggable) bnds.corner = pos;
        bnds.extent =  outerCorner.difference(pos);
        break;
      case "c01":
        if (controlledIsDraggable) corner.x = pos.x;
        extent.x = outerCorner.x - pos.x;
        if (proportion) {
          extent.y = (extent.x)*proportion;
        }
        break;
      case "c02":
        if (controlledIsDraggable) corner.x = pos.x;
        extent.x = outerCorner.x - pos.x;
        extent.y = pos.y - corner.y;
        break;
      case "c10": 
        if (controlledIsDraggable) corner.y = pos.y;
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
        if (controlledIsDraggable) corner.y = pos.y;
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
      case "center":
        if (controlledIsDraggable) {
          corner.x = pos.x - 0.5 * extent.x;
          corner.y = pos.y - 0.5 * extent.y;
        }
    }
    bx.moveto(pos);
    pj.log("control","NEW EXTENT",bnds.extent);
    var sc =1/geom.scalingDownHere(controlled);
    pj.log("control","OLD CENTER",controlCenter);
    if (controlledIsDraggable) { // || (nm === "center")) {
      controlCenter = controlCenter.plus(bnds.center());
      geom.movetoInGlobalCoords(controlled,controlCenter);

    }
    pj.log("control","NEW CENTER",controlCenter);
    bnds.corner =  bnds.extent.times(-0.5);
  
    var localExtent = bnds.extent.times(sc);
    if (protoToAdjust) {
      protoToAdjust.__adjustExtent(localExtent);
      pj.root.draw();
    } else {
      controlled.__adjustExtent(localExtent);
      controlled.draw();
    }
    ui.updateControlBoxes();
    ui.needsUpdate = 1;
  }
 
   // ipos is in global coords 
   ui.dragCustomControl = function (controlled,nm,ipos) {
      pj.log('control','dragging custom control ',nm);
      var idx = parseInt(nm.substr(1));
      var bnds,corner,extent,outerCorner,newExtent,cr,originalPos,gtr,
      pos = geom.toOwnCoords(controlled,ipos); 
      var npos = controlled.updateControlPoint(idx,pos);
      var sc = geom.scalingDownHere(controlled);
      var bxnpos = npos.times(sc); // the new point relative to the control boxes
      bx = pj.root.__customBoxes[nm];
      bx.moveto(bxnpos);
      bx.draw();
      ui.needsUpdate = 1;
   }
  
//end extract


})(prototypeJungle);

/*
 
item.update = function () {
  var rct = this.rect.toRectangle();
  rct.__updateControlBoxes(this)
}
*/
