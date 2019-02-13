
core.require('/arrow/arrow0.js','/line/decoLine.js','/arrow/curvedHead.js',function (arrowP,lineP,headP) {
let rs = arrowP.instantiate();
core.replacePrototype(rs,'lineP',lineP);
core.replacePrototype(rs,'headP',headP);
rs.headP.solidHead = false;
rs.headP.wavesToSkip = 2;
return rs;
});
