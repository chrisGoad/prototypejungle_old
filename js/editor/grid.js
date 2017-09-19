

ui.findGrid = function () {
  if (pj.root.grid) {
    return pj.root.grid;
  } else {
    return pj.root.main.grid;
  }
}
ui.addGrid = function () {
  let grid = ui.grid;
  if (grid) {
    return;
  }
  grid = svg.Element.mk('<path fill="none" stroke="grey"  stroke-opacity="1" stroke-linecap="round" stroke-width="1"/>');
  grid.interval = 25;
  grid.active = true;
  grid.update = function () {ui.updateGrid(grid);}
  pj.root.set('grid',grid);
}

ui.gridRect  = geom.Rectangle.mk(geom.Point.mk(-50,-50),geom.Point.mk(100,100));
ui.updateGrid = function(grid) {
  if (!grid.active) {
    return;
    //code
  }
  debugger;
  let interval = grid.interval;
  let corner = ui.gridRect.corner;
  let extent = ui.gridRect.extent;
  let lowX = corner.x;
  let lowY = corner.y;
  let numX = Math.round(extent.x/interval);
  let numY = Math.round(extent.y/interval)
  let highX = lowX + interval*numX;
  let highY = lowY + interval*numY;
  let path = '';
  for (let i=0;i<=numY;i++) {//the horizontal lines
    let y=lowY + i*interval;
    path += 'M '+lowX+' '+y+' ';
    path += 'L '+highX+' '+y+' ';
  }
   for (let i=0;i<=numX;i++) {// the vertical lines
    let x=lowX + i*interval;
    path += 'M '+x+' '+lowY+' ';
    path += 'L '+x+' '+highY+' ';
  }
  grid.d = path;
}

ui.selectGrid = function () {
  pj.root.grid.__select('svg',false,true); 
}

ui.computeSvgBounds = function () {
  var svgMain = svg.main;
  var cn = svgMain.contents;

  var cxf = cn.transform;
  var wd = svgMain.__container.offsetWidth;
  var ht = svgMain.__container.offsetHeight;
  var screenBounds = geom.Point.mk(wd,ht).toRectangle();
  var tbnds = screenBounds.applyInverse(cxf);

   var rs = tbnds.scaleCentered(1);
   return rs;
}
 
ui.setGridRect = function () {
  debugger;
  ui.addGrid();
  let bnds = ui.computeSvgBounds();
  ui.gridRect = bnds;
  pj.root.grid.update();
  pj.root.grid.__draw();
}

ui.snapToGrid = function () {
  if (!pj.selectedNode || !ui.draggable(pj.selectedNode)) {
    return;
  }
  var interval = pj.root.grid.interval;
  var pos = pj.selectedNode.__getTranslation();
  var corner = ui.gridRect.corner;
  var relPos = pos.difference(corner);
  var xi = Math.round(relPos.x/interval);
  var yi = Math.round(relPos.y/interval);
  var newPos =  corner.plus(geom.Point.mk(xi,yi).times(interval));
  pj.selectedNode.__moveto(newPos);
  ui.updateControlBoxes();
  
}

var gridWasVisible;
ui.removeGridPath = function (itm) {
  gridWasVisible = false;
  let grid = itm.grid;
  if (grid) {
    grid.d = '';
    if (grid.__visible()) {
      gridWasVisible = true;
      grid.__hide();
    }
  }
}

pj.beforeStringify.push(ui.removeGridPath);

ui.restoreGridPath = function (itm) {
  if (gridWasVisible) {
    ui.setGridRect();
  }
}

pj.afterStringify.push(ui.restoreGridPath);

