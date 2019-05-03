core.require('/arrow/multiIn.js','/connector/line.js','/container/rectangle.js',function (multiInPP,linePP,personPP) {
  
let item = svg.Element.mk('<g/>');

item.partnerSep = 40;
item.siblingSep = 50;

item.familySep = 20;

item.descendantSep = 60;
item.numLevels = 2;
item.height = 140;
item.width = 200;
item.bracketWidth = 50;
item.textUp = 4;
item.textPad = 5;
item['font-size'] = 8;
item.editMode = true;
item.resizable = false;
item.isKit = true;
item.partnerCount = 0;
item.Node = svg.Element.mk('<g/>');
item.Family = svg.Element.mk('<g/>');


// knd = the kind of the initial child (L or R)
item.newFamily = function () {
  //let rs = svg.Element.mk('<g/>');
  let rs = this.Family.instantiate();//svg.Element.mk('<g/>');

  this.families.push(rs);

  rs.set('multi',this.multiInP.instantiate().show());
  rs.multi.vertical = true;  
 // let child = this.newNode();
  rs.set('children',core.ArrayNode.mk());
 // rs.children.plainPush(child);
  rs.set('position',Point.mk(0,0));
  return rs;
}

// max num partners = 4.Add child to 
item.addChild = function (person,ichild) {
  let node = person.nodeOf;
  let partners = node.partners;
  let families = node.families;
  let ln = partners.length;
  let famIdx = 0;
  let multi;
  if (ln > 2) {  // add to family to the left of the person
    let pidx = partners.findIndex((x) => (x === person));
    famIdx = Math.max(0,pidx-1);
  }
  let family = families[famIdx];
  if (family) {
    multi = family.multi;
    multi.ends.push(Point.mk(0,0)); // a new branch on the multi
    multi.update();
  } else {
    family = this.newFamily();
    families[famIdx] = family;
    family.parents = node;
    multi = family.multi;
  }
  let child,childNode;
  if (ichild) {
    child = ichild;
    childNode = ichild.nodeOf;
  } else {
    childNode = this.newNode();
    child = childNode.partners[0];
  }
  child.inFamily = family;
  if (!ichild) {
    child.text = 'c'+ (this.partnerCount++);
  }

   debugger;
  graph.connectMultiVertex(multi,family.children.length,child);
  family.children.plainPush(childNode);
  return childNode;
}
    
    
  
  
// a node might involve four people
// leftPartner leftSpouse rightSpouse rightPartner; heteronormative family: leftSpouse = wife, rightSpouse = husband

// a node is a principle [0], and set of partners, horizontally posisionted
// node first added is always the right spouse, if a family should develop
item.newNode  = function () {
  let nodes = this.nodes;
  let newNode = this.Node.instantiate();//svg.Element.mk('<g/>');
  nodes.push(newNode);
  newNode.isNew  = 'yes';
  let person = this.personP.instantiate().show();
  person.nodeOf = newNode;
  let partners =  core.ArrayNode.mk();
  newNode.set('partners',partners);
  partners.push(person);
  newNode.set('families',core.ArrayNode.mk());

  newNode.set('lines',core.ArrayNode.mk());
  newNode.set('position',Point.mk(0,0));
  return newNode;
  // later add texts
};

item.nameCount = 0;
item.Node.addPartner = function () {
   debugger;
  let node = this;
  let kit = node.__parent.__parent;
  let line = kit.lineP.instantiate().show();
  node.lines.push(line);
  node.families.push(null);
  let right =  kit.personP.instantiate().show();
  right.text = 'p'+ (kit.partnerCount++);
  right.nodeOf = node;
  let partners = node.partners;
  let ln = partners.length;
  if (ln === 1) {
    let handle = kit.handleP.instantiate().show();
    node.set('handle',handle);
  }
  partners.push(right);
  right.update();
  let left  = partners[ln-1];
  graph.connectVertices(line,left,right);
  let family = node.inFamily;
  if (family) {
    let pr = family.parents;
    kit.layoutTree(pr);
  } else {
    kit.layoutTree(node);
  }
}
item.addPartner = function (node) {
  debugger;
  let line = this.lineP.instantiate().show();
  node.lines.push(line);
  node.families.push(null);
  let right =  this.personP.instantiate().show();
  right.text = 'p'+ (this.partnerCount++);
  right.nodeOf = node;
  let partners = node.partners;
  let ln = partners.length;
  if (ln === 1) {
    let handle = this.handleP.instantiate().show();
    node.set('handle',handle);
  }
  partners.push(right);
  right.update();
  let left  = partners[ln-1];
  graph.connectVertices(line,left,right);
  let family = node.inFamily;
  if (family) {
    let pr = family.parents;
    this.layoutTree(pr);
  } else {
    this.layoutTree(node);
  }
};

item.addParents = function (person) {
  let parentsNode = this.newNode();
  parentsNode.addPartner();
  let parents = parentsNode.partners;
  this.addChild(parents[0],person);
  let pos = person.getTranslation();
  parentsNode.position.copyto(pos.plus(Point.mk(0,-this.descendantSep)));
  parents[0].moveto(pos.plus(Point.mk(-0.5*this.partnerSep,-this.descendantSep)));
  parents[1].moveto(pos.plus(Point.mk(0.5*this.partnerSep,-this.descendantSep)));
  return parentsNode;
}
  
  
  
  
item.initialize = function () {
  this.set('nodes',core.ArrayNode.mk());
  this.set('families',core.ArrayNode.mk());
  this.multiInP = core.installPrototype('multiInP',multiInPP);
  this.multiInP.vertical = true;
  this.lineP = core.installPrototype('lineP',linePP);
  this.personP = core.installPrototype('personP',personPP);
  this.personP.width = 30;
  this.personP.height = 20;
  this.handleP = core.installPrototype('handleP',personPP);
  this.handleP.width = 5;
  this.handleP.height = 5;
  this.handleP.isHandle = true;
  this.handleP.fill = "red";
  this.personP.draggableInKit = true;
  this.handleP.draggableInKit = true;
};

item.Family.relLayout = function () {
  debugger;
  let family = this;
  let children = family.children;
  let cx = 0;
  let siblingSep = this.siblingSep;
  let cwd;
  children.forEach( (child) => {
    child.relLayout();
    //this.relLayoutNode(child);
    let wd = child.width;
    child.relX = cx + 0.5*wd;
    cwd = cx + wd;
    cx = cx +  wd + siblingSep;
  });
  family.width = cwd;
}


item.Family.absLayout = function (pos) {
  debugger;
  let family = this;
  let kit = this.__parent.__parent;
  family.position.copyto(pos);
  let children = family.children;
  let wd = family.width;
  let mhwd = -0.5*wd;
  let descendantSep = kit.descendantSep;
  children.forEach((child) => {
    let cpos = pos.plus(Point.mk(mhwd+child.relX,descendantSep));
    child.absLayout(cpos);
  });
}

  
  

item.Node.relLayout = function() { // computes relative positions (in x) to left end
  let node = this;
  let kit = this.__parent.__parent;
  let partners = node.partners;
  let families = node.families;
  let partnerSep = kit.partnerSep;
  let cx = 0;
  let ln = partners.length;
  partners[0].relX = 0;
  for (let i=1;i<ln;i++) {
    let partner = partners[i];
    let family = families[i-1];
    let famwd = 0;
    if (family) {
      family.relLayout();
      famwd = family.width;
    }
    let wd = ln>2?Math.max(famwd,partnerSep):partnerSep;
    cx = cx + wd;
    partner.relX = cx;
  }
  node.width = cx;
}

item.Node.absLayout = function (pos) { // computes absolute positions given relative ones, and moves people
  debugger;
  let node = this;
  node.position = pos;
  let partners = node.partners;
  let families = node.families;
  let handle = node.handle;
  let mhwd = -0.5*(node.width);
  let ln = partners.length;
  let lastPartner = partners[0];
  lastPartner.moveto(pos.plus(Point.mk(mhwd,0)));
  for (let i=1;i<ln;i++) {
    let partner = partners[i];
    partner.moveto(pos.plus(Point.mk(mhwd + partner.relX,0)));
    let family = families[i-1];
    if (family) {
      let fpos = pos.plus(Point.mk(mhwd + 0.5*(lastPartner.relX + partner.relX),0));
      family.absLayout(fpos);
    }
  }
}


  

item.layoutTree = function(inode) {
  debugger;
  let node = inode?inode:this.root;
  let pos = node&&node.position?node.position:Point.mk(0,0);
  node.relLayout();
 // this.relLayoutNode(node,pos);
  node.absLayout(pos);
  // two updates needed to get arms pointing right direction (to do with armDirections)
  graph.graphUpdate();
  graph.graphUpdate();
  this.layout();
  this.draw();
}

item.Node.move_to = function (pos) {
  let node = this;
  let partners = node.partners;
  let cpos = node.position;
  let rpos = pos.difference(cpos);
  partners.forEach( (partner) => {
    let ppos = partner.getTranslation();
    partner.moveto(ppos.plus(rpos));
  });
  let families = node.families;
  families.forEach((family) => {
    if (family) {
      let fpos = family.position;
      family.move_to(fpos.plus(rpos));
    }
  });
  node.position.copyto(pos);
}


item.Family.move_to = function (pos) {
  let family = this;
  let children = family.children;
  let fpos = family.position;
  let rpos = pos.difference(fpos);
  children.forEach( (child) => {
    let cpos = child.position;
    child.move_to(cpos.plus(rpos));
  });
}



item.midPoint = function (line) { // kind = L C R
  let e0 = line.end0;
  let e1 = line.end1;
  return e0.plus(e1).times(0.5);
};
 
item.positionMultis = function (node) {
  let partners = node.partners;
  let families = node.families;
  let lines = node.lines;
  let ln = partners.length;
  for (let i=1;i<ln;i++) {
    if (i === 1) {
      let handle = node.handle;
      let line = node.lines[0];
      let mp = this.midPoint(line);
      handle.moveto(mp);
    }
    let family = families[i-1];
    if (family) {
      let line = lines[i-1];
      let mp = this.midPoint(line);
      let multi = family.multi;
      multi.singleEnd.copyto(mp);
      multi.update();
      multi.draw();
    }
  }
}

 item.layout = function () {
  debugger;
  let nodes = this.nodes;
  nodes.forEach( (nd) => {
    this.positionMultis(nd);
  });
 } 
 
item.firstUpdate = true;

item.update = function () {
  debugger;
  if (this.firstUpdate) {
    this.root = this.newNode('R');
    this.root.addPartner();
    //this.addPartner(this.root);
    this.firstUpdate = false;
    this.layoutTree();
  }
  
  //let nodes = this.nodes();
  //nodes.forEach((node) =>
  this.layout();
}

item.startOfDrag = Point.mk(0,0);
item.nodePosAtStartDrag = Point.mk(0,0);


item.dragStart = function (x,pos) {
  //console.log('drag start',pos.x,pos.y);
  let localPos = this.toLocalCoords(pos,true);
  this.startOfDrag.copyto(localPos);
  if (x.isHandle) {
    let node = x.__parent
    this.nodePosAtStartDrag.copyto(node.position);
  }
}

item.dragStep = function (x,pos) {
  //console.log(pos.x,pos.y);
  let localPos = this.toLocalCoords(pos,true);

  if (Math.abs(localPos.y) > 0.1) {
    debugger;
  }
  let node = x.nodeOf;
  if (node) {
    x.moveto(localPos);
    this.positionMultis(node);
  } else if (x.isHandle)  {
    let opos = this.nodePosAtStartDrag;
    let rpos = localPos.difference(this.startOfDrag);
    node = x.__parent;
    x.moveto(localPos);
    node.move_to(opos.plus(rpos));
    graph.graphUpdate();
    this.layout();
  }
}

item.addPartnerAction = function (person) {
  debugger;
  let node = person.nodeOf;
  node.addPartner();
  //this.addPartner(node,'L');
  this.layoutTree();
  
}


item.addChildAction = function (person) {
  debugger;
  this.addChild(person);
  this.layoutTree(person.nodeOf);
  dom.svgMain.fitContentsIfNeeded();

}

item.addParentsAction = function (person) {
  debugger;
  let parents = this.addParents(person);
  core.updateParts(parents);
   // two graph updates needed to get arms pointing right direction (to do with armDirections)
  graph.graphUpdate();
  graph.graphUpdate();
  this.update();
  this.draw();
  dom.svgMain.fitContentsIfNeeded();

 // parents.draw();
}

item.layoutTreeAction = function (person) {
  this.layoutTree(person.nodeOf);
}

item.actions = function (node) {
  let rs = [];
  if (!node) return;
  if (node.role === 'vertex') {
     rs.push({title:'Select Kit Root',action:'selectTree'});
     rs.push({title:'Add Child',action:'addChildAction'});
     rs.push({title:'Add Partner',action:'addPartnerAction'});
     rs.push({title:'Add Parents',action:'addParentsAction'});
     rs.push({title:'Layout Family',action:'layoutTreeAction'});
              
  }
  return rs;
  if (node === this) {
    rs.push({title:'Reposition Tree',action:'layoutTree'});
  }
  return rs;
}


item.selectTree = function () {
  this.__select('svg');
}

return item;

});
     
