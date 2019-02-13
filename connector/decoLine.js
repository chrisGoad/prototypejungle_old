
core.require('/connector/connector0.js','/line/decoLine.js',function (connectorP,lineP) {

let rs = connectorP.instantiate();
rs.wavesToSkip = 0;
rs.waveAmplitude = 0.2;
rs.waveLength = 40;
rs.stroke = 'black';
rs['stroke-width'] =2;
rs.set('shaftProperties',core.lift(['wavesToSkip','waveAmplitude','waveLength','stroke','stroke-width']));
core.replacePrototype(rs,'lineP',lineP);
ui.hide(rs,['shaft','shaftProperties']);
return rs;
});
