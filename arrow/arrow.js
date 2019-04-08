// arrow

core.require('/arrow/arrow0.js','/line/line.js','/arrow/solidHead.js',function (arrowP,linePP,headPP) {
core.standsAlone(['/line/line.js','/arrow/solidHead.js']);  // suitable for loading into code editor
let rs = arrowP.instantiate();
rs.initialLinePP = linePP;
rs.initialHeadPP = headPP;
return rs;
});



