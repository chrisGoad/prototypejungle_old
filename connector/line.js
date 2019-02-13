


core.require('/connector/connector0.js','/line/line.js',function (connectorP,lineP) {
let rs = connectorP.instantiate();
rs.stroke = 'black';
rs['stroke-width'] =2;
rs.set('shaftProperties',core.lift(['stroke','stroke-width']));
core.replacePrototype(rs,'lineP',lineP);
ui.hide(rs,['shaft','shaftProperties']);
return rs;
});
