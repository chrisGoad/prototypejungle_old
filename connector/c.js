

removeThis

core.require('/connector/connector0.js','/shape/c.js',function (connectorP,lineP) {
core.standsAlone('/shape/c.js');  // suitable for loading into code editor
let rs = connectorP.instantiate();

rs.set('shaftProperties',core.lift(['stroke','stroke-width']));
core.replacePrototype(rs,'lineP',lineP);

rs.stroke = "black";
rs['stroke-width'] = 2;
rs.elbowWidth = 10;
rs.width = 19; // fraction of along the way where the elbow appears
rs.set("end0",Point.mk(-20,12));
rs.set("end1",Point.mk(20,-12));



rs.text = '';

rs.set('shaftProperties',core.lift(['stroke','stroke-width','width']));

rs.controlPoints = function () {
  return this.shaft.controlPoints();
}


rs.updateControlPoint = function (idx,rpos) {
  this.shaft.updateControlPoint(idx,rpos);
}
  
rs.connectionType = 'EastWest'; 

ui.hide(rs,['shaft','shaftProperties']);
return rs;
});
