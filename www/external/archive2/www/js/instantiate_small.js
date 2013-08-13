(function () {

// a hole 
var om = __pj__.om;




om.DNode.copyNode = function () {
  var rs = Object.create(this);
  var thisHere = this;
  this.iterTreeItems(function (v,k) {
    var cp = v.copyNode();
    cp.__parent__ = rs;
    cp.__name__= k;
    rs[k] = cp;
  },true);
  return rs;
}


// no prototype chains for LNodes
om.LNode.copyNode = function () {
  var rs = om.LNode.mk();
  this.forEach(function (v) {
    if (om.isNode(v)) {
      var cp = v.copyNode();
      rs.pushChild(cp);
    } else {
      rs.push(v);
    }
  });
  return rs;
}




om.DNode.instantiate = function () {
  var rs = this.copyNode();
  return rs;
}


})();

