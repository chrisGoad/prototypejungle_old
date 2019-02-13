
//core.require('/line/bulbous.js',function (linePP) {
core.require('/line/line.js',function (linePP) {

let item = svg.Element.mk('<g/>');

item.lineP = core.installPrototype(linePP);

item.lineP.waveLength = 20;
//item.halfWaveCount = 15;
item.waveAmplitude = 15; // as a fraction of the wave length
item.lineP['stroke-width'] = 0.3;


const genRandomPoint = function (dimx,dimy) {
  let rx = Math.floor(Math.random() * dimx);
  let ry = Math.floor(Math.random() * dimy);
  return Point.mk(rx,ry);
}

const genRandomLinee = function (lineP,dimx,dimy) {
  let e0 = genRandomPoint(dimx,dimy);
  let e1 = genRandomPoint(dimx,dimy);
  let rs = lineP.instantiate();
  rs.show();
  rs.setEnds(e0,e1);
  return rs;
}

const genRandomLine = function (lineP,dimx,dimy) {
  let horizontal = Math.random() > 0.5;
  let s0 = Math.floor(Math.random() * dimx);
  let v0 = Math.floor(Math.random() * dimx);
 // let s1 = Math.floor(Math.random() * dimx);
 // let v1 = Math.floor(Math.random() * dimx);
 let v1 = v0 + Math.min(dimx,Math.random() * dimx * 0.3);
  //Math.floor(Math.random() * dimx);
  let e0,e1;
  if (horizontal) {
     e0 = Point.mk(v0,s0);
     e1 = Point.mk(v1,s0);
  } else {
     e0 = Point.mk(s0,v0);
     e1 = Point.mk(s0,v1)
  }
  
  let rs = lineP.instantiate();
  let rcol = () => Math.floor(Math.random()*256);
 // rs.stroke = 'rgb('+rcol()+','+rcol()+','+rcol()+')';
 // console.log(rs.stroke);
  rs['stroke-width'] = 0.5 +1 * Math.random();
  rs.show();
  rs.setEnds(e0,e1);
  return rs;
}


 item.addLines = function (n,dimx,dimy) {
   let lines = [];
   let cnt=0;
   while (cnt<n) {
     let nm = 'L'+cnt;
     let ln = genRandomLine(this.lineP,dimx,dimy);
     let seg = geom.LineSegment.mk(ln.end0,ln.end1);
     let intersects = false;
     let num = lines.length;
     for (let i=0;i<num;i++) {
       if (seg.intersect(lines[i])) {
         intersects = true;
         break;
       }
     }
     if (!intersects) {
       this.set(nm,ln);
       lines.push(seg);
     }
     
     cnt++;
   }
 }
 
  //item.addLines(500,200,1000);

 item.addLines(1500,200,200);
 return item;
});