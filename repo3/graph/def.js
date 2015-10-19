(function () {

var graphLib = pj.Object.mk();

graphLib.set('graph',pj.Object.mk());
var graph = graphLib.graph;

graphLib.mkGraph = function (v,e) {
  var rs = Object.create(graph);
  if (v) {
    rs.set('vertices',v);
    rs.set('edges',e);
  }
  return rs;
}


graphLib.set('Vertex',pj.Object.mk());
graphLib.Vertex.mk = function () {
  return Object.create(this.__parent.Vertex);
}

graphLib.set("Edge",pj.Object.mk());

graphLib.Edge.mk = function () {
  return Object.create(this.__parent.Edge);
}
// makes vertices from the likes of {a:[0,0],b:[1,1]}

graphLib.mkVertices = function (iverts) {
  var keys = Object.keys(iverts);
  var elements = pj.Object.mk();
  var thisHere = this;
  var category;
  keys.forEach(function (key) {
    var nv = thisHere.Vertex.mk();
    var v = iverts[key];
    var pnt = pj.geom.toPoint(v);
    nv.set('point',pnt);
    if (v[2]) { // set the category of this and subsequent uncategorized edges
      category = v[2];
    }
    nv.category = category;
    elements.set(key,nv);
  });
  var fields = [{id:'point',type:'object'},{id:'category',type:'string'}];
 var rs = Object.create(pj.dat.Series);
  rs.set('fields',pj.lift(fields));
  rs.set('elements',pj.lift(elements));
  rs.computeCategories();
  return rs;
}

// makes edges from the likes of [['a','b'],['b','c']]
graphLib.mkEdges = function (iedges) {
  var elements = pj.Array.mk();
  var thisHere = this;
  var kind;
  iedges.forEach(function (iedge) {
    var edge = thisHere.Edge.mk();
    edge.e0 = iedge[0];
    edge.e1 = iedge[1];
    if (iedge[2]) { // set the kind of this and subsequent unkinded edges
      kind = iedge[2];
    }
    if (kind) edge.category = kind;
    elements.push(edge);
  });
  var fields = [{id:'e0',type:'string'},{id:'e1',type:'string'},{id:'category',type:'string'}];
  var rs = Object.create(pj.dat.Series);
  rs.set('fields',pj.lift(fields));
  rs.set('elements',pj.lift(elements));
  rs.computeCategories();
  return rs;
}






graphLib.Edge.copy = function (e) {
  var rs = pj.Edge.mk();
  pj.setProperties(rs,e,['e0','e1','kind','label']);
  return rs;
}




graph.displace = function (displacement,suffix) {
  var rs = graphLib.mkGraph();
  var vertices = this.vertices;
  var nverts = pj.Object.create();
  var keys = Object.keys(vertices);
  keys.forEach(function (key) {
    var v = vertices[key];
    var nv = pj.Object.create();
    nv.point = v.point.plus(displacement);
    pj.setProperties(nv,v,['color','label']);
    nverts.set(key+suffix,nv);
  })
  return rs;
}

pj.returnValue(undefined,graphLib);
})();
