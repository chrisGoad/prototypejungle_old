// spots

core.require('/connector/connector0.js','/line/spots.js',function (connectorP,linePP) {
let rs = connectorP.instantiate();


/* adjustable parameters */
rs.interval = 10;
rs['stroke-width'] = 4;
rs.stroke = 'black';
/* end adjustable parameters */

rs.numSpots = 0;

rs.initializePrototype = function () {  
  core.assignPrototype(this,'lineP',linePP);
}

rs.set('shaftProperties',core.lift(['numSpots','stroke','stroke-width','interval']));
ui.hide(rs,['end0','end1','shaft','shaftProperties','numSpots']);

return rs;
});
