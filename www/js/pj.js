// this creates the root of the prototype jungle world, __pj__.  In the unlikely event that
// you wish to change to another name, changing  it here, in error.js (where it alsoe occurs more than once) and in the last  line in each source code file will suffice.


var prototypeJungle =(function () {
  var DNode = {}; // dictionary node
  if (!Object.create) { //archaic browser
    var rs = {};
    rs.om = {};
    rs.page = {};
    return rs;
  }
  var rs = Object.create(DNode);
  var om = Object.create(DNode);
  om.DNode = DNode;
  rs.om = om;
  rs.page = Object.create(DNode);
  om.storage = localStorage;
  return rs;
})();
 
 
//var __pj__ = prototypeJungle; // for the transition