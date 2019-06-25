removeThis


core.require('/connector/connector0.js','/shape/u.js',function (connectorP,lineP) {
let rs = connectorP.instantiate();

rs.set('shaftProperties',core.lift(['stroke','stroke-width']));
core.replacePrototype(rs,'lineP',lineP);

rs.stroke = "black";
rs['stroke-width'] = 2;
rs.elbowWidth = 10;

rs.depth = -17; // fraction of along the way where the elbow appears
rs.set("end0",Point.mk(-14,18));
rs.set("end1",Point.mk(14,-18));

rs.text = '';

rs.set('shaftProperties',core.lift(['stroke','stroke-width','depth']));

rs.controlPoints = function () {
  return this.shaft.controlPoints();
}


rs.updateControlPoint = function (idx,rpos) {
  this.shaft.updateControlPoint(idx,rpos);
}
  
rs.connectionType = 'UpDown'; 

ui.hide(rs,['shaft','shaftProperties']);
return rs;
});
