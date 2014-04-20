// this creates the root of the prototype jungle world, held in the global prototypeJungle.  In the unlikely event that
// you wish to change to another name, changing  it here, in error.js (where it alsoe occurs more than once) and in the last  line in each source code file will suffice.


var pj = prototypeJungle =(function () {
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
  om.isDev = location.href.indexOf('http://prototype-jungle.org:8000')===0;
  om.atLive = location.href.indexOf('http://prototype-jungle.org')===0;
  om.liveDomain = om.isDev?"prototype-jungle.org:8000":"prototype-jungle.org";
  om.useMinified = !om.isDev;
  om.homePage = "/tstIndex.html"; // change to "" on release
  return rs;
})();
 
 
