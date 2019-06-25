//bulbous
core.require('/connector/connector0.js','/line/bulbous.js',function (connectorP,linePP) {

let rs = connectorP.instantiate();

/* adjustable parameters */
rs.bulbWidth0 = 5;
rs.bulbWidth1 = 10;
rs.stroke = 'black';
/* end adjustable parameters */

rs.initializePrototype = function () {
  core.assignPrototype(this,'lineP',linePP)
}

rs.set('shaftProperties',core.lift(['bulbWidth0','bulbWidth1','stroke']));
ui.hide(rs,['shaft','shaftProperties']);
return rs;
});
