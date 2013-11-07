
/*
 notes on lampba
 
 lambda(<var name>,<type>,<body>)
 
 then om.var.mk
*/
(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;
  // circles are represented by {center:,radius} ; need not be DNodes
  geom.CCircle = {}; // circle for computation only; has center and radius, need not be DNnode
  
  geom.CCircle.mk = function (r,c) {
    var rs = Object.create(geom.CCircle);
    rs.radius = r;
    rs.center = c;
    return rs;
  }
  geom.CircleSet = {}; // an array of circles, and a subject (also a circle), and a contact (a circle to which the subject is tangent)
  // Operations on a circle set move the subject around 
  geom.CicrleSet.nearest= function () { // find the nearest circle to the subject, excluding the contact
    var d = Infinity;
    var ln = this.circles.length;
    var rs;
    var p = this.subject.center;
    for (var i=0;i<ln;i++) {
      var c = this.circles[i];
      if (c === this.contact) continue;
      var cd = p.distance(s.center) - s.radius;
      if (cd < d) {
        rs = i;
      }
    }
    return rs;
  }
  // bring into tangency with nearest circle, while maintaining the contact, if any.
  // sub problem: find intersection of two circles
  
    /*let p be a solution.  Consider the triangle T with long side joining the centers of c1 and c2,
     and the two right triangles T1 and T2 that join to form T.
     let a be the radius of c1, b of c2, c the distance between the centers of c1  , c2
     x and y the lenghts the bases of T1 T2, and z the height of T,T1,T2.
     Then we have:
     
     x*x + z*z = a*a
     y*y + z*z = b*b
     x + y = c
     
    so
    y = c-x
    z*z = a*a - x*x;
    (c-x)*(c-x) + z*z = b*b
    (c-x)*(c-x) + (a*a - x*x) = b*b
    c*c - 2*c*x + x*x + a*a - x*x = b*b
    c*c - 2*c*x + a*a = b*b
    2*c*x = c*c + a*a - b*b;
    x = (c*c + a*a - b*b)/2*c
    I had a hard time believing this was linear.*/
    
  geom.CCircle.intersect = function (circle2) {
    var circle1 = this;
    var a = circle1.radius;
    var b = circle2.radius;
    var c1 = circle1.center;
    var c2 = circle2.center;
    var c = c1.distance(c2);
    var cv = c2.difference(c1)/c;
    var x = (c*c + a*a - b*b)/(2*c);
    var z = Math.sqrt(a*a - x*x);
    var xv = cv * x;
    var p1 = c1.plus(xv);
    var zv = cv.normal();
    var rs1 = p1.plus(zv);
    var rs2 = p1.minus(zv);
    return [rs1,rs2];
  }
  
    
        
     
  geom.CircleSet.moveToNearest = function  () {
    var n = this.nearest();
    var cn = this.circles[n];
    var sc = this.subject.center;
    var nc = cn.center;
    if (this.contact) { // a trig problem; find the point to put subject at which will contact both the existing contact, and cn
      var contact = this.contact;
      if (contact) {
        var c1fi = geom.CCircle.mk(cn.radius + this.radius);
        var c2fi = geom.CCircle.mk(contact.radius + this.radius);
        var ints = c1fi.intersection(c2fi);
        var d0 = sc.distance(ints[0]);
        var d1 = sc.distance(ints[1]);
        var cint = (d0<d1)?ints[1]:int[1]; // choose the closer of the intersections
        this.subject.center = cint;
        return;
      }
    }
    var v = sc.difference(nc).normalize();
    var rsc = nc.plus(v.times(this.subject.radius + cn.radius));
    this.subject.center = rsc;
  }
    
  
  
 

})(prototypeJungle);

