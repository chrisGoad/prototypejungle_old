


core.require('/connector/connector0.js','/line/connectedSpots.js',function (connectorP,linePP) {
  
let rs = connectorP.instantiate();

/* adjustable parameters */
rs.interval = 20;
rs['stroke-width'] = 4;
rs.stroke = 'black';
rs.lineStroke = 'black';
rs.lineWidth = 1;
/* end adjustable parameters */

rs.initializePrototype = function () {  
  core.assignPrototype(this,'lineP',linePP);
}

rs.shaftProperties = core.lift(['interval','stroke-width','stroke','lineStroke','lineWidth']);
rs.setFieldType('stroke','svg.Rgb');
rs.setFieldType('lineStroke','svg.Rgb');

return rs;
});
