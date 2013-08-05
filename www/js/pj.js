// this creates the root of the prototype jungle world, __pj__.  In the unlikely event that
// you wish to change to another name, changing  it here, in error.js (where it alsoe occurs more than once) and in the last  line in each source code file will suffice.


var __pj__ =(function () {
  var DNode = {}; // dictionary node
  var rs = Object.create(DNode);
  om = Object.create(DNode);// NEEDS TO GO BACK TO A LOCAL VAR
  om.DNode = DNode;
  rs.om = om;
  rs.page = Object.create(DNode);
  return rs;
})();
 
