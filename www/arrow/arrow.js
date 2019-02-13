// arrow

core.require('/arrow/arrow0.js','/line/line.js','/arrow/solidHead.js',function (arrowP,lineP,headP) {
let rs = arrowP.instantiate();
core.replacePrototype(rs,'lineP',lineP);
core.replacePrototype(rs,'headP',headP);
return rs;
});



