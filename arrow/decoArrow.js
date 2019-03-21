
core.require('/arrow/arrow0.js','/line/decoLine.js','/arrow/curvedHead.js',function (arrowP,linePP,headPP) {
let rs = arrowP.instantiate();
rs.initialLinePP = linePP;
rs.initialHeadPP = headPP;
//rs..solidHead = false;
//rs.headP.wavesToSkip = 2;
return rs;
});
