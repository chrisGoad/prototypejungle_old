
core.require('/connector/connector0.js','/line/wavyLine.js',function (connectorP,lineP) {
let rs = connectorP.instantiate();
rs.cornerFraction = 0.4;
rs.waveAmplitude = 1;
rs.waveLength = 10;
rs.stroke = 'black';
rs['stroke-width'] =2;
rs.set('shaftProperties',core.lift(['cornerFraction','waveAmplitude','waveLength','stroke','stroke-width']));
core.replacePrototype(rs,'lineP',lineP);
ui.hide(rs,['shaft','shaftProperties']);
return rs;
});
