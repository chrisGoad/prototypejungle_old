// arrow

core.require('/arrow/arrow0.js','/line/line.js','/arrow/solidHead.js',function (arrowP,linePP,headPP) {
let rs = arrowP.instantiate();
rs.initialLinePP = linePP;
rs.initialHeadPP = headPP;
//core.replacePrototype(rs,'lineP',lineP);
//core.replacePrototype(rs,'headP',headP);
return rs;
});



