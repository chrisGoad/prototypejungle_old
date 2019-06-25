removeThis




core.require('/connector/connector0.js','/shape/twoBends.js',function (connectorP,lineP) {



let rs = connectorP.instantiate();

rs.vertical = false;
core.replacePrototype(rs,'lineP',lineP);

rs.stroke = "black";
rs['stroke-width'] = 2;
rs.elbowWidth = 10;
rs.depth = 20; // fraction of along the way where the elbow appears
rs.set("end0",Point.mk(-20,12));
rs.set("end1",Point.mk(20,-12));



rs.text = '';

rs.set('shaftProperties',core.lift(['stroke','stroke-width','depth','vertical']));

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
