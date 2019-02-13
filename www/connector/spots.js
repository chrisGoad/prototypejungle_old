


core.require('/connector/connector0.js','/line/spots.js',function (connectorP,lineP) {
let rs = connectorP.instantiate();
rs.stroke = 'black';
rs['stroke-width'] =4;
rs.interval = 10;
rs.numSpots = 0;
core.replacePrototype(rs,'lineP',lineP);
rs.set('shaftProperties',core.lift(['numSpots','stroke','stroke-width','interval']));

//core.setProperties(rs,lineP,lineP.adjustableProperties);
//ui.hide(rs,['shaft','stroke-width']);
return rs;
});
