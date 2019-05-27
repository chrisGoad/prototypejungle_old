

/* a mark is just something with a datum, a presentation, and a generator */

const defineSpread = function (groupConstructor) {


let Spread = codeRoot.set('Spread',groupConstructor()).__namedType(); 
let Mark = codeRoot.set('Mark',groupConstructor()).__namedType(); 


// each Spread should have a generator method, and optionally a bind metho.

Spread.mk = function () {
  let rs = Object.create(codeRoot.Spread);
  rs.set('marks',groupConstructor());
  rs.marks.unselectable = true;
  return rs;
}

Spread.reset = function () {
  this.set('marks',groupConstructor());
  this.data = undefined;
  this.marks.unselectable = true;

}

codeRoot.Spread.update = function () {
  if (this.__newData) {
    this.inSync = false;
  }
  let data = this.data;
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
    let p = thisHere.generator(marks,'m'+i,data[i],i);
    p.__dataIndex = i;
    declareComputed(p);
    p.__update();
  }
  this.inSync = true;
}

codeRoot.Spread.selectMark = function (n) {
  return this.marks['m'+n];
}

codeRoot.Spread.forEachMark = function (fn) {
  forEachTreeProperty(this.marks,function (child) {
    if (child.__dataIndex !== undefined) {
      fn(child);
    }
  });
}

codeRoot.Spread.length = function () {
  let data = this.data;
  return data?data.length:0;
}

}

export {defineSpread};