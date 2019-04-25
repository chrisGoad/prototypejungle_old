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

// knd = the kind of the initial child (L or R)
item.newFamily = function () {
  let rs = svg.Element.mk('<g/>');
  rs.set('multi',core.installPrototype('multiInP',multiInPP));
  this.multiInP.vertical = true;  
  let child = this.addNode();
  rs.set('children',core.ArrayNode.mk());
  rs.children.plainPush(child);
  //this.families.push(rs);
  return rs;
}

item.addChild(person) {
  let node = person.nodeOf;
  let which;
  if (node.leftPerson === person) {
    which = 'left';
  } else if ((node.leftSpouse === person) || (node.rightSpouse === person)) {
    which = 'center';
  } else {
    which = 'right';
  }
  let familyProp = which==='left'?'leftFamily':(which === 'center'?'mainFamily':'rightFamily';
  let family = node[familyProp];
  if (!family) {
    family = this.newFamily();
    node.set(familyProp,family);
  }
  let child = this.newNode();
  family.children.plainPush(child);
  return child;
}
    
    
  
  
// a node might involve four people
// leftPartner leftSpouse rightSpouse rightPartner; heteronormative family: leftSpouse = wife, rightSpouse = husband

// a node is a principle [0], and set of partners, horizontally posisionted
// node first added is always the right spouse, if a family should develop
item.addNode  = function () {
  let nodes = this.nodes;
  let newNode = svg.Element.mk('<g/>');
  nodes.push(newNode);
  let person = this.personP.instantiate().show();
  person.text = 'd'+ (this.nameCount++);

 // let bracket = this.multiInP.instantiate().show();
  //bracket.unselectable = true;
 // bracket.ends.push(Point.mk(0,0));
  //newNode.set('principle',principle);
  //principle.text = 'name';
  newNode.set('rightSpouse',person);
  person.nodeOf = newNode;
  newNode.set('lines',core.ArrayNode.mk());
  newNode.set('position',Point.mk(0,0));
  return newNode;
  // later add texts
};

item.nameCount = 0;
item.addSpouse = function (node) {
  debugger;
  let left = node.leftSpouse;
  let right = node.rightSpouse;
  if (right && left) {
    return;
  }
  if (right) {
    left = node.set('leftSpouse',this.personP.instantiate().show());
    left.nodeOf = node;
  } else {
    right = node.set('rightSpouse',this.personP.instantiate().show());
    right.nodeOf = node;
  }
  let line = this.lineP.instantiate().show();
  node.set('centralLine',line);
  graph.connect1end(line,0,left,'periphery');
  graph.connect1end(line,1,right,'periphery');
  /*let partners = node.partners;
  let prevPartner;
  let ln = partners.length;
  //if (ln > 0) {
    prevPartner = partners[ln-1];
 // } else {
 //   prevPartner = node.principle;
 // }
  let newPartner = this.personP.instantiate().show();
  newPartner.text = 'p'+ (this.nameCount++);
  partners.push(newPartner);
  let pos = prevPartner.getTranslation();
  newPartner.moveto(pos.plus(Point.mk(-this.partnerSep)));
  let newLine = this.lineP.instantiate().show();
  node.lines.push(newLine);
  graph.connect1end(newLine,0,newPartner,'periphery');
  graph.connect1end(newLine,1,prevPartner,'periphery');
  //let multis = node.multis;
  //let families = node.families;
  if (ln > 1) {
    node.multis.push(null);
    node.families.push(null);
  }
  node.familyRelxs.push(0);
  let toLayout = node;
  if (node.parents) {
    toLayout = node.parents;
  }
  this.layoutNode(toLayout,toLayout.position);
  */
};
  
item.addPartner = function (kind) {
  debugger;
  let person = this.personP.instantiate().show();
  if (kind === 'L') {
    spouse = node.leftSpouse;
    if ((!spouse) ||node.leftPartner) {
      return;
    }
    partner = node.set('leftPartner',person);
  } else {
    spouse = node.rightSpouse;
    if ((!spouse) || node.rightPartner) {
      return;
    }
    partner = node.set('rightPartner',person);
  }
  let line = this.lineP.instantiate().show();
  if (kind === 'L') {
    node.set('leftLine',line);
    graph.connect1end(partner,0,spouse,'periphery');
  } else {
    node.set('rightLine',line);
    graph.connect1end(spouse,0,partner,'periphery');
  }
}
item.multiConnectPoint = function (node,kind) { // kind = L C R
  let line = (kind === 'L')?node.leftLine:((kind === 'C')?node.centerLine:node.rightLine);
  let e0 = line.end0;
  let e1 = line.end1;
  return e0.plus(e1).times(0.5);
};
  
item.initialize = function () {
  this.set('nodes',core.ArrayNode.mk());
  this.set('families',core.ArrayNode.mk());
  
  this.multiInP = core.installPrototype('multiInP',multiInPP);
  this.multiInP.vertical = true;
  this.lineP = core.installPrototype('lineP',linePP);
  this.personP = core.installPrototype('personP',personPP);
  this.personP.width = 30;
  this.personP.height = 20;
  this.personP.draggableInKit = true;
};

item.relLayoutNode = function(node) { // computes relative positions (in x) to left end
  let LP = node.leftPartner;
  let LS = node.leftSpouse;
  let RS = node.rightSpouse;
  let RP = node.rightPartner;
  let partnerSep = this.partnerSep;
  let cx = 0;
  if (LP) {
    LP.relX = cx;
    cx = cx + partnerSep;
  }
  LS.relX = cx;
  cx = cx + partnerSep;
  RS.relX = cx;
  if (RP) {
    cx = cx + partnerSep;
    RP.relX = cx;
  }
  node.width = cx;
}

item.absLayoutNode = function (node,pos) { // computes absolute positions given relative ones, and moves people
  let LP = node.leftPartner;
  let LS = node.leftSpouse;
  let RS = node.rightSpouse;
  let RP = node.rightPartner;
  let cx = -0.5*(node.width);
  const movePerson = (person) => {
    if (person) {
      person.moveto(pos.plus(Point.mk(person.relX,0)));
    }
  }
  movePerson(LP);
  movePerson(LS);
  movePerson(RS);
  movePerson(RP);
}


item.layoutTree = function() {
  this.relLayoutNode(this.root,Point.mk(0,0));
  this.absLayoutNode(this.root,Point.mk(0,0));
}
  

item.firstUpdate = true;

item.update = function () {
  debugger;
  if (this.firstUpdate) {
    this.root = this.addNode('R');
    this.addSpouse(this.root);
    this.firstUpdate = false;
    this.layoutTree();
  }
  //this.layout();
}

item.addLeftPartner = function (node) {
  this.addPartner(node,'L');
  this.layoutTree();
  
}


item.addRightPartner = function (node) {
  this.addPartner(node,'R');
  this.layoutTree();
}

item.actions = function (node) {
  let rs = [];
  if (!node) return;
  if (node.role === 'vertex') {
     rs.push({title:'Select Kit Root',action:'selectTree'});
   //  rs.push({title:'Add Child',action:'addChild'});
     rs.push({title:'Add Left Partner',action:'addLeftPartner'});
     rs.push({title:'Add Right Partner',action:'addRightPartner'});
              
   /* if (node.parentVertex) {
      rs.push({title:'Add Sibling',action:'addSibling'});
    }
    rs.push({title:'Reposition Subtree',action:'reposition'});*/
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

item.addDescendant = function (node,partnerNum) { //0 = principle
  debugger;
  let familyNum = Math.max(partnerNum-1,0);
  let multis = node.multis;
  let families = node.families;
  let family = families[familyNum];
  let multi = multis[familyNum];
  let newFamily = false;
  if (!family) {
    newFamily = true;
    family = core.ArrayNode.mk();
    families.set(familyNum,family);
    multi = this.multiInP.instantiate().show();
    multis.set(familyNum,multi);
    
  }
 // let descendants = node.descendants;
  let ln = family.length;
  let newNode = this.addNode();
  newNode.parents = node;
  family.plainPush(newNode);
 
 // newNode.principle.moveto(pos);
  if (!newFamily) {
    multi.ends.push(Point.mk(0,0)); // a new branch on the multi
    multi.update();
  }
  debugger;
  graph.connectMultiVertex(multi,ln,newNode.partners[0]);
  this.layoutNode(node,node.position);
  return newNode;
};

// here the relxs are to center
item.relLayoutFamily = function (family) {
  if (!family) {
    return 0;
  }
  debugger;
  let cx = 0;
  family.forEach((node) => {
    let wd = this.relLayoutNode(node);
    //node.relX = cx;
    cx = cx + wd + this.siblingSep;
  });
  let width = cx - this.siblingSep;
  cx = width/2;
  family.forEach((node) => {
    let wd = node.width;
    node.relX = cx - 0.5 * wd;
    cx = cx - wd - this.siblingSep;
  });
  return width;
}
    
item.relLayoutNode = function(node) { // computes relative positions (in x) to right end 
debugger;
  if (!node) {
    return 0;
  }
  let familySep = this.familySep;
  let partnerSep = this.partnerSep;
  let partners = node.partners;
  let families = node.families;
  let familyRelxs= node.familyRelxs;
  let widths = families.map((family) => this.relLayoutFamily(family));
  let ln = partners.length;
  let cx = 0;
  let lastWide = false;
  partners[0].relX = cx;
  let fam0 = families[0];
  let fam1,wd0,wd1,numPartnersPositioned;
  if (ln>2) {
    let fam1 = families[1];
  }
  let totalWidth;
  if (fam0 && fam1) {
     numPartnersPositioned = 3;
  } else if (fam0) {
    numPartnersPositioned = 2;
  } else {
    if (ln>1) {
      numPartnersPositioned = 2;
    } else {
      numPartnersPositioned = 1;
    }
  }
  let extras = ln - numPartnersPositioned;
  let extraWidth = extras * partnerSep;
  
  if (fam0 && fam1) {
    wd0 = Math.max(widths[0],partnerSep);
    wd1 = Math.max(widths[1],partnerSep);
    if (0.5*wd1 < extraWidth) {
      totalWidth = wd0 + familySep + extraWidth;
    } else {
      totalWidth = wd0 + wd1 + familySep;
    }
    let cx = 0.5*totalWidth;
    familyRelxs[0] = cx - 0.5*wd0; 
    partners[0].relX = familyRelxs[0] + 0.5*partnerSep;
    cx = cx - wd0 - familiySep;
    familyRelxs[1] = cx - 0.5*wd1; 
    partners[1].relX = 0.5* (familyRelxs[0] + familyRelxs[1]);
    partners[2].relX = familyRelxs[1] - 0.5*partnerSep;
  } else if (fam0) {
    wd0 = Math.max(widths[0],partnerSep);
    if (0.5*wd0 < extraWidth) {
      totalWidth = wd0 + extraWidth;
    } else {
      totalWidth = wd0;
    }
    cx = 0.5*totalWidth;
    debugger;
    let center =  cx - 0.5*wd0;
    familyRelxs[0]  = center;
    partners[0].relX = center + 0.5* partnerSep;
    partners[1].relX = center - 0.5 *partnerSep;

  } else {
    if (ln>1) {
      totalWidth = partnerSep + extraWidth;
      partners[0].relX =  0.5* totalWidth;
      partners[1].relX = 0.5 * totalWidth - partnerSep;
    } else {
      totalWidth = 0;//personWidth;
      partners[0].relX = 0;

    }
  }
  cx = partners[numPartnersPositioned-1].relX;
  for (let i = numPartnersPositioned;i<ln;i++) {
    cx = cx - partnerSep;
    partners[i].relX = cx;
  }  
  node.width = totalWidth;
  return node.width;
};



item.absLayoutFamily = function (family,pos) { // computes absolute positions given relative ones, and moves people
  family.forEach((node) => 
    this.absLayoutNode(node,pos.plus(Point.mk(node.relX,0))));
}

item.absLayoutNode = function (node,pos) { // computes absolute positions given relative ones, and moves people
  debugger;
  let hwd = 0.5 *node.width;
  let partners = node.partners;
  let families = node.families;
  let familyRelxs = node.familyRelxs;
  let ln = partners.length;
  let descendantSep = this.descendantSep;
  //let rpos = pos.plus(Point.mk(hwd,0));
  node.position.copyto(pos);
  let lastPartner = partners[0];
  if (ln === 1) {
    partners[0].moveto(pos);
  } else {
    partners[0].moveto(pos.plus(Point.mk(partners[0].relX,0)));
    for (let i=1;i<ln;i++) {
      let family = families[i-1];
      let partner = partners[i];
      partner.moveto(pos.plus(Point.mk(partner.relX,0)));
      if (family) {
        let fpos = pos.plus(Point.mk(familyRelxs[i-1],descendantSep));
        this.absLayoutFamily(family,fpos);
      }
      lastPartner = partner;
    }
  }
}

  
item.positionMultis = function (node) {
  let multis = node.multis;
  let ln = multis.length;
  for (let i=0;i<ln;i++) {
    let multi = multis[i];
    if (multi) {
      let cn = this.multiConnectPoint(node,i);
      multi.singleEnd.copyto(cn);
      multi.update();
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
  

item.nodeOf = function (person) {
    return person.__parent.__parent;
 
}

item.dragStep = function (person,pos) {
  debugger;
  let node = this.nodeOf(person);
  person.moveto(pos);
  this.layout(node);
}
  
item.firstUpdate = true;

item.update = function () {
  debugger;
  if (this.firstUpdate) {
    this.set('nodes',core.ArrayNode.mk());
    this.root = this.addNode();
    this.addPartner(this.root);
    //this.addDescendant(this.root,0);
    this.firstUpdate = false;
  }
  this.layout();
}


item.selectTree = function () {
  this.__select('svg');
}

item.addChild = function (vertex) {
  debugger;
  let node = this.nodeOf(vertex);
  let partners = node.partners;
  let idx = partners.findIndex((p) => (p===vertex));;
  this.addDescendant(node,idx);
  graph.graphUpdate();
    this.layout();

  this.draw();
  //core.saveState();
  vertex.__select('svg');
}


item.addPartnerAction = function (vertex) {
  debugger;
  let node = this.nodeOf(vertex);
  this.addPartner(node);
  graph.graphUpdate();
  this.draw();
  //core.saveState();
  vertex.__select('svg');
}


item.actions = function (node) {
  let rs = [];
  if (!node) return;
  if (node.role === 'vertex') {
     rs.push({title:'Select Kit Root',action:'selectTree'});
     rs.push({title:'Add Child',action:'addChild'});
     rs.push({title:'Add Partner',action:'addPartnerAction'});
               
   /* if (node.parentVertex) {
      rs.push({title:'Add Sibling',action:'addSibling'});
    }
    rs.push({title:'Reposition Subtree',action:'reposition'});*/
  }
  return rs;
  if (node === this) {
    rs.push({title:'Reposition Tree',action:'repositionTree'});
  }
  return rs;
}
item.setFieldType('editMode','boolean');

return item;
});
     
