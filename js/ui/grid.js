// support for grids in the UI (only in network diagrams for now)
ui.addGrid = function () {
  let grid = pj.root.__grid;
  if (grid) {
    return;
  }
  grid = svg.Element.mk('<path fill="none" stroke="grey"  stroke-opacity="1"  stroke-width="0.5"/>');
  grid.__unselectable = true;
  grid.interval = 30;
  ui.hide(grid,['d','fill'])
  pj.root.set('__grid',grid);
}

ui.gridRect  = geom.Rectangle.mk(geom.Point.mk(-50,-50),geom.Point.mk(100,100));
ui.adjustGridRect = function (bnds) { // assure that the corner is an even count of intervals from (0,0)
  let corner = bnds.corner;
  let interval = pj.root.__grid.interval;
  let newCx = Math.round(corner.x/interval)*interval;
  let newCy = Math.round(corner.y/interval)*interval;
  console.log('adjusted corner by ',newCx - corner.x);
  corner.x = newCx;
  corner.y = newCy;
}
  
  
ui.updateGrid = function(grid) {
  if (grid.__hidden()) {
    return;
  }
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
  pj.root.__grid.__select('svg',false,true); 
}

ui.gridCoversSvg = function () {
  let grid = pj.root.__grid;
  let gridBnds = grid.__bounds();
  let svgBnds = svg.main.visibleBounds();
  return gridBnds.containsRectangle(svgBnds);
}

ui.setGridRect = function () {
  ui.addGrid();
  pj.root.__grid . update = function () {ui.updateGrid(pj.root.__grid)};
  let bnds = svg.main.visibleBounds().scaleCentered(1.5);;
  ui.adjustGridRect(bnds);
  ui.gridRect = bnds;
  ui.updateGrid(pj.root.__grid);
  //pj.root.grid.update();
  pj.root.__grid.__draw();
}

ui.adjustGrid = function () {
  let grid = pj.root.__grid;
  if (grid && grid.__visible()) {
    if (!ui.gridCoversSvg()) {
      console.log('adjusting grid');
      ui.setGridRect();
    }
  }
}


ui.snapPointToGrid = function (pos) {
  let interval = pj.root.__grid.interval;
  let corner = ui.gridRect.corner;
  let relPos = pos.difference(corner);
  let xi = Math.round(relPos.x/interval);
  let yi = Math.round(relPos.y/interval);
  return corner.plus(geom.Point.mk(xi,yi).times(interval));
}
ui.snapToGrid = function (node) {
  if (!node.__draggable) {
    return;
  }
  let interval = pj.root.__grid.interval;
  let pos = node.__getTranslation();
  let newPos = ui.snapPointToGrid(pos);
  node.__moveto(newPos);
 // ui.updateControlBoxes();
  
}

let gridWasVisible;
ui.removeGridPath = function (itm) {
  gridWasVisible = false;
  let grid = itm.__grid;
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
    pj.root.__grid.__show();
    ui.setGridRect();
  }
}

pj.afterStringify.push(ui.restoreGridPath);

