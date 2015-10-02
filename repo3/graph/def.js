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
  var rs = pj.Object.mk();
  var thisHere = this;
  keys.forEach(function (key) {
    var nv = thisHere.Vertex.mk();
    var v = iverts[key];
    var pnt = pj.geom.toPoint(v);
    nv.set('point',pnt);
    nv.kind = v[2];
    rs.set(key,nv);
  });
  return rs;
}

// makes edges from the likes of [['a','b'],['b','c']]
graphLib.mkEdges = function (iedges) {
  var rs = pj.Array.mk();
  var thisHere = this;
  var kind;
  iedges.forEach(function (iedge) {
    var edge = thisHere.Edge.mk();
    edge.e0 = iedge[0];
    edge.e1 = iedge[1];
    if (iedge[2]) { // set the kind of this and subsequent unkinded edges
      kind = iedge[2];
    }
    if (kind) edge.kind = kind;
    rs.push(edge);
  });
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
