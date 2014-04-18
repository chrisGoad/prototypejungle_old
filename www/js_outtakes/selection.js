  //NOT YET IN USE; a starting point for the development of D3 like selections
  
  // a selection is a subcollection of the members and data of marks, and is transient, used in the midst of code.
  // it does not appear in the pj tree, but just records arrays of shapes and data
  
  geom.set("Selection",om.DNode.mk()).namedType();
  // a selection holds a map of ids to  values, where each is an object of the form {id:,markSet:m,data:,member:} . Either data or member can be undefined.
  
  // mode = "enter","exit"; default is all
  geom.Selection.mk = function (marks,mode) { // arrays not LNodes; members are not children
    var rs = Object.create(geom.Selection);
    var vls = {};
    rs.values = vls;
    var s = marks.shapes;
    var d = marks.data;
    var sln = s.length;
    var dln = d.length;
    var ln = Math.max(sln,dln);
    if (mode=="enter") {
      var lb = sln;
    } else if (mode=="exit") {
      lb = dln;
    }
    for (var i=lb;i<ln;i++) {
      var cvl = {id:i,marks:marks};
      if (i<dln) {
        cvl.data = d[i];
      }
      if (i<sln) {
        cvl.shape = s[i];
      }
      vls[i]=cvl;
    }
    return rs;
  }