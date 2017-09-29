

(function (pj) {
/* a mark is just something with a datum, a presentation, and a generator */



pj.defineSpread = function (groupConstructor) {
  
pj.set('Spread',groupConstructor()).__namedType(); 
pj.set('Mark',groupConstructor()).__namedType(); 


// each Spread should have a generator method, and optionally a bind metho.

pj.Spread.mk = function () {
  let rs = Object.create(pj.Spread);
  rs.set('marks',groupConstructor());
  rs.marks.__unselectable = true;
  return rs;
}
/*
pj.Mark.mk = function (index,presentation) {
  let rs = Object.create(pj.Mark);
  rs.index = index;
  rs.set('presentation',presentation);
  return rs;
}
*/
pj.Spread.update = function () {
  if (this.__newData) {
    this.inSync = false;
  }
  let data = this.__data;
  if (!data) {
    return;
  }
  if (this.inSync) {
    return;
  }
  let marks = this.marks;
  let ln = data.length;
  let thisHere = this;
  for (let i=0;i<ln;i++) {
    let p = thisHere.generator(data[i],i);
    p.__dataIndex = i;
    //let mark = pj.Mark.mk(i,p);
    pj.declareComputed(p);
    marks.set('m'+i,p);
    p.__update();
  }
  this.inSync = true;
}

pj.Spread.selectMark = function (n) {
  return this.marks['m'+n];
}

pj.Spread.forEachMark = function (fn) {
  pj.forEachTreeProperty(this.marks,function (child) {
    if (child.__dataIndex !== undefined) {
      fn(child);
    }
  });
}

pj.Spread.length = function () {
  let data = this.__data;
  return data?data.length:0;
}

}

