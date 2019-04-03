


core.require('/connector/connector0.js','/line/bulbous.js',function (connectorP,lineP) {
core.standsAlone('/line/bulbous.js');  // suitable for loading into code editor
let rs = connectorP.instantiate();
rs.bulbWidth0 = 5;
rs.bulbWidth1 = 10;
rs.stroke = 'black';
rs.set('shaftProperties',core.lift(['bulbWidth0','bulbWidth1','stroke']));
core.replacePrototype(rs,'lineP',lineP);
ui.hide(rs,['shaft','shaftProperties']);
return rs;
});
