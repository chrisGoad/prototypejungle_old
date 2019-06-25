
core.require('/connector/connector0.js','/line/decoLine.js',function (connectorP,linePP) {

let rs = connectorP.instantiate();

/* adjustable parameters */
rs.wavesToSkip = 0;
rs.waveAmplitude = 0.2;
rs.waveLength = 40;
rs.stroke = 'black';
rs['stroke-width'] =2;
/* end adjustable parameters */

rs.initializePrototype = function () {
  core.assignPrototype(this,'lineP',linePP);
}

rs.set('shaftProperties',core.lift(['wavesToSkip','waveAmplitude','waveLength','stroke','stroke-width']));

ui.hide(rs,['shaft','shaftProperties']);
return rs;
});
