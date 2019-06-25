
core.require('/connector/connector0.js','/line/wavyLine.js',function (connectorP,linePP) {

let rs = connectorP.instantiate();

/* adjustable parameters */
rs.cornerFraction = 0.4;
rs.waveAmplitude = 10;
rs.waveLength = 20;
rs.stroke = 'black';
rs['stroke-width'] =2;
/* end adjustable parameters */

rs.initializePrototype = function () {
  core.assignPrototype(this,'lineP',linePP)
}

rs.set('shaftProperties',core.lift(['cornerFraction','waveAmplitude','waveLength','stroke','stroke-width']));
ui.hide(rs,['shaft','shaftProperties']);
return rs;
});
