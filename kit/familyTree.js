core.require('/arrow/multiIn.js','/connector/line.js','/container/rectangle.js',function (multiInPP,linePP,personPP) {
  
let item = svg.Element.mk('<g/>');

item.partnerSeparation = 20;
item.siblingSeparation = 20;

item.familySep = 20;

item.descendantSeparation = 60;
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

item.personWidth = function (person) {
  return person.dimension?person.dimension:person.width;
}


item.personHeight = function (person) {
  return person.dimension?person.dimension:person.height;
}

item.partnerSep = function () {
  let wd = this.personWidth(this.personP);
  return wd + this.partnerSeparation;
}


item.siblingSep = function () {
  let wd = this.personWidth(this.personP);
  return wd + this.siblingSeparation;
}


item.descendantSep = function () {
  let ht = this.personHeight(this.personP);
  return ht + this.descendantSeparation;
}



// knd = the kind of the initial child (L or R)
item.newFamily = function () {
  let rs = svg.Element.mk('<g/>');
  this.families.push(rs);

  rs.set('multi',this.multiInP.instantiate().show());
  rs.multi.vertical = true;  
 // let child = this.newNode();
  rs.set('children',core.ArrayNode.mk());
 // rs.children.plainPush(child);
  rs.set('position',Point.mk(0,0));
  return rs;
}

item.childrenOf = function(person) {
  let node = person.nodeOf;
  let partners = node.partners;
  let families = node.families;
  let ln = partners.length;
  if (ln == 1) {
    return null;
  }
  let famIdx = 0;
  if (ln > 2) {  // relevant family is to left of person
    let pidx = partners.findIndex((x)=>(x===person));
    famIdx = Math.max(0,pidx-1);
  }
  let family = families[famIdx];
  return family?family.children:null;
}
  
  
// max num partners = 4.Add child to 
item.addChild = function (person,ichild,isLeft) {
  let node = person.nodeOf;
  let partners = node.partners;
  let families = node.families;
  let ln = partners.length;
  if (ln == 1) {
    editor.popInfo('Add a partner before adding a child');
    return;
  }
  let famIdx = 0;
  let multi;
  if (ln > 2) {  // add to family to the left of the person
    let pidx = partners.findIndex((x)=>(x===person));
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

  graph.connectMultiVertex(multi,family.children.length,child);
  let children = family.children;
  if (isLeft) {
    let ln = children.length;
    children.plainPush(null);
    for (let i=ln;i>0;i--) {
      children[i] = children[i-1];
    }
    children[0] = childNode;
  } else {
    family.children.plainPush(childNode);
  }
  return childNode;
}
    
    
  
  
// a node might involve four people
// leftPartner leftSpouse rightSpouse rightPartner; heteronormative family: leftSpouse = wife, rightSpouse = husband

// a node is a principle [0], and set of partners, horizontally posisionted
// node first added is always the right spouse, if a family should develop
item.newNode  = function () {
  let nodes = this.nodes;
  let newNode = svg.Element.mk('<g/>');
  nodes.push(newNode);
  let person = this.personP.instantiate().show();
  person.text = 'p'+ (this.partnerCount++);
  person.nodeOf = newNode;
  this.people.push(person);
  let partners =  core.ArrayNode.mk();
  newNode.set('partners',partners);
  partners.plainPush(person);
  newNode.set('families',core.ArrayNode.mk());

  newNode.set('lines',core.ArrayNode.mk());
  newNode.set('position',Point.mk(0,0));
  return newNode;
  // later add texts
};

item.nameCount = 0;
item.addPartner = function (node,toLeft) {
  let left,right;
  let partners = node.partners;
  let families = node.families;
  let lines = node.lines;
  let ln = partners.length;
  let line = this.lineP.instantiate().show();
  this.lines.push(line);
  //line.nodeOf = node;
  this.draw();
  line.ignoreClick = true;
  //node.lines.plainPush(line);
  //node.families.push(null);
  let person =  this.personP.instantiate().show();
  this.people.push(person);
  person.text = 'p'+ (this.partnerCount++);
  person.nodeOf = node;
  if (ln === 1) {
    let handle = this.handleP.instantiate().show();
    node.set('handle',handle);
    handle.nodeOf = node;
  }
  if (toLeft) {
    partners.push(null);
    families.push(null);
    lines.push(null);
    for (let i = ln;i>0;i--) {
      partners[i] = partners[i-1];
      if (i > 1) {
        families[i-1] = families[i-2];
        lines[i-1] = lines[i-2];
      }
    }
    partners[0] = person;
    families[0] = null;
    lines[0] = line;
    left = person;
    right = partners[1];
  } else {
    partners.plainPush(person);
    families.plainPush(null);
    lines.plainPush(line);
    left = partners[ln-1];
    right = partners[ln];
  }
  graph.connectVertices(line,left,right);
  let family = node.inFamily;
  if (0 && family) {
    let pr = family.parents;
    this.layoutTree(pr);
  } else {
    this.layoutTree(node);
  }
};

item.addParents = function (person) {
  debugger;
  if (person.inFamily) {
    editor.popInfo('This person already has parents');
    return;
  }
  let parentsNode = this.newNode();
  this.addPartner(parentsNode);
  let parents = parentsNode.partners;
  this.addChild(parents[0],person);
  let pos = person.getTranslation();
  let partnerSep = this.partnerSep();
  let descendantSep = this.descendantSep();
  parentsNode.position.copyto(pos.plus(Point.mk(0,-descendantSep)));
  parents[0].moveto(pos.plus(Point.mk(-0.5*partnerSep,-descendantSep)));
  parents[1].moveto(pos.plus(Point.mk(0.5*partnerSep,-descendantSep)));
  return parentsNode;
}
  
  
item.initializePositionStore = function () {
  if (this.positionStore) {
    return;
  }
  this.set('positionStore',core.ArrayNode.mk()); // used in dragging
  for (let i=0;i<5;i++) {
    this.positionStore.push(Point.mk(0,0));
  }
}
  
item.initialize = function () {
  this.set('lines',core.ArrayNode.mk());
  this.set('nodes',core.ArrayNode.mk());
  this.set('families',core.ArrayNode.mk());
  this.set('people',core.ArrayNode.mk());
  this.multiInP = core.installPrototype('multiInP',multiInPP);
  this.multiInP.vertical = true;
  this.multiInP.controlOnlyJoin = true;
  this.lineP = core.installPrototype('lineP',linePP);
  this.lineP.isHandle = true;
  this.personP = core.installPrototype('personP',personPP);
  this.personP.width = 40;
  this.personP.height = 20;
  this.personP.textProperties['font-size'] = 8;
  this.handleP = core.installPrototype('handleP',personPP);
  this.handleP.width = 10;
  this.handleP.height = 5;
  this.handleP.isHandle = true;
  this.handleP.fill = "red";
  this.personP.draggableInKit = true;
  this.handleP.draggableInKit = true;
  
};

item.relLayoutFamily = function (family) {
  let children = family.children;
  let cx = 0;
  let siblingSep = this.siblingSep();
  let cwd;
  children.forEach( (child) => {
    this.relLayoutNode(child);
    let wd = child.width;
    child.__relX = cx + 0.5*wd;
    cwd = cx + wd;
    cx = cx +  wd + siblingSep;
  });
  family.width = cwd;
}


item.absLayoutFamily = function (family,pos) {
  family.position.copyto(pos);
  let children = family.children;
  let wd = family.width;
  let mhwd = -0.5*wd;
  let descendantSep = this.descendantSep();
  children.forEach((child) => {
    let cpos = pos.plus(Point.mk(mhwd+child.__relX,descendantSep));
    this.absLayoutNode(child,cpos);
  });
}

  
  

item.relLayoutNode = function(node) { // computes relative positions (in x) to left end
  let partners = node.partners;
  let families = node.families;
  let partnerSep = this.partnerSep();
  let cx = 0;
  let ln = partners.length;
  partners[0].__relX = 0;
  let familyCount =  0;
  families.forEach( (family) => {
    if (family) {
      familyCount++;
    }
  });
    
  for (let i=1;i<ln;i++) {
    let partner = partners[i];
    let family = families[i-1];
    let famwd = 0;
    // todo put familes to right option
    if (family) {
      this.relLayoutFamily(family);
      famwd = family.width;
    }
    //let wd = ln>2?Math.max(famwd,partnerSep):partnerSep;
    
    let wd = familyCount>1?famwd+partnerSep:partnerSep;
    cx = cx + wd;
    partner.__relX = cx;
  }
  node.width = cx;
}

item.absLayoutNode = function (node,pos) { // computes absolute positions given relative ones, and moves people
  node.position.copyto(pos)
  let partners = node.partners;
  let families = node.families;
  let handle = node.handle;
  let mhwd = -0.5*(node.width);
  let ln = partners.length;
  let lastPartner = partners[0];
  lastPartner.moveto(pos.plus(Point.mk(mhwd,0)));
  for (let i=1;i<ln;i++) {
    let partner = partners[i];
    partner.moveto(pos.plus(Point.mk(mhwd + partner.__relX,0)));
    let family = families[i-1];
    if (family) {
      let fpos = pos.plus(Point.mk(mhwd + 0.5*(lastPartner.__relX + partner.__relX),0));
      this.absLayoutFamily(family,fpos);
    }
    lastPartner = partner;
  }
}


  

item.layoutTree = function(inode) {
  let node = inode?inode:this.root;
  let pos = node&&node.position?node.position:Point.mk(0,0);
  this.relLayoutNode(node,pos);
  this.absLayoutNode(node,pos);
  // two updates needed to get arms pointing right direction (to do with armDirections)
  graph.graphUpdate();
  graph.graphUpdate();
  ui.updateControlBoxes();
  this.layout();
  this.draw();
}

item.moveNode = function (node,pos) {
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
      this.moveFamily(family,fpos.plus(rpos));
    }
  });
  node.position.copyto(pos);
}


item.moveFamily = function (family,pos) {
  let children = family.children;
  let fpos = family.position;
  let rpos = pos.difference(fpos);
  children.forEach( (child) => {
    let cpos = child.position;
    this.moveNode(child,cpos.plus(rpos));
  });
}



item.midPoint = function (line) { // kind = L C R
  if (line) {
    let e0 = line.end0;
    let e1 = line.end1;
    return e0.plus(e1).times(0.5);
  } else {
    debugger;
  }
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
      if (mp) {
        handle.moveto(mp);
      }
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
  let nodes = this.nodes;
  nodes.forEach( (nd) => {
    this.positionMultis(nd);
  });
 } 
 
item.firstUpdate = true;

item.update = function () {
  if (this.firstUpdate) {
    this.root = this.newNode('R');
    this.addPartner(this.root);
    let p0 = this.root.partners[0];
    p0.text = 'parent';
    this.root.partners[1].text = 'parent';
    let child =  this.addChild(p0);
    child.partners[0].text = 'child';
    this.firstChild = child;
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
  if (x.nodeOf) {
    let node = x.nodeOf;
    this.nodePosAtStartDrag.copyto(node.position);
    let partners = node.partners;
    let ln = partners.length;
    if (ln > 1) {
      this.initializePositionStore();
      let pstore = this.positionStore;
      for (let i=0;i<ln;i++) {
        pstore[i].copyto(partners[i].getTranslation());
      }
    }
  }
}

item.dragStep = function (x,pos) {
  //console.log(pos.x,pos.y);
  let beenDragged = this.beenDragged;
  let localPos = this.toLocalCoords(pos,true);
  let node = x.nodeOf;
  if (node) {
    let opos = this.nodePosAtStartDrag;
    let rpos = localPos.difference(this.startOfDrag);
   
    if (x.isHandle) {
      x.moveto(localPos);
      this.moveNode(node, opos.plus(rpos));
    } else {
      opos = this.startOfDrag;
      let pstore = this.positionStore;
      let partners = node.partners;
      let ln = partners.length;
      if (ln === 1) {
        this.moveNode(node, opos.plus(rpos));
      } else {
        let dy = rpos.y;
        console.log('dy',dy);
       // x.moveto(opos.plus(Point.mk(rpos.x,0)));
        x.moveto(opos.plus(rpos));
        let partners =node.partners;
        for (let i=0;i<ln;i++) {
           let person = partners[i];
            if (person !== x) {
              let pp = pstore[i];
              let np = pp.plus(Point.mk(0,dy));
              person.moveto(np);
          }
        }
          
      }
      let dist = rpos.length();
      if ((dist > 10000) && (!beenDragged)) {
        this.beenDragged = true;
        editor.popInfo('Auto-layout turned off. From now on, use "Layout Family" when desired. <br/> Undo this drag to bring Auto-layout back');
      }
    }
    graph.graphUpdate();
    this.layout();
  }
}


item.nodeToLayout = function(person) {
  let family = person.inFamily;
  if (family) {
    return family.parents;
  } else {
    return person.nodeOf;
  }
}

  
item.addPartnerLeftAction = function (person) {
  debugger;
  let node = person.nodeOf;
  this.addPartner(node,true);
  if (!this.beenDragged) {
    this.layoutTree(this.nodeToLayout(person));
  }
  ui.updateControlBoxes();
  this.afterAdd();
}


item.addPartnerRightAction = function (person) {
  debugger;
  let node = person.nodeOf;
  this.addPartner(node,false);
  if (!this.beenDragged) {
    this.layoutTree(this.nodeToLayout(person));
  }
  ui.updateControlBoxes();
  this.afterAdd();
}




item.afterAdd = function () {
  dom.svgMain.fitContentsIfNeeded();
  core.saveState('add');
  editor.setSaved(false);
}


item.addChildLeftAction = function (person) {
  debugger;
  this.addChild(person,null,true);
  this.layoutTree(person.nodeOf);
  this.afterAdd(person.nodeOf);

}

  
item.addChildRightAction = function (person) {
  debugger;
  this.addChild(person,null,false);
  this.layoutTree(person.nodeOf);
  this.afterAdd(person.nodeOf);
}


item.addParentsAction = function (person) {
  debugger;
  
  let parents = this.addParents(person);
  core.updateParts(parents);
   // two graph updates needed to get arms pointing right direction (to do with armDirections)
   this.layout();
  graph.graphUpdate();
  graph.graphUpdate();
  ui.updateControlBoxes();
  this.update();
  this.draw();
  dom.svgMain.fitContentsIfNeeded();

 // parents.draw();
}

item.layoutTreeAction = function (person) {
  this.layoutTree(person.nodeOf);
}

item.actions = function (itm) {
  let rs = [];
  let person;
  if (!itm) return;
  debugger;
  let isHandle = itm.isHandle;
 // let modified = editor.fileModified;
  if ((itm.role === 'vertex')||isHandle) {
    if (isHandle) {
      let nd = itm.nodeOf;
      let prts = nd.partners;
      person = prts[1];
    }  else {
      person = itm;
    }
    let children = this.childrenOf(person);
    rs.push({title:'Select Kit Root',action:'selectTree'});
  //  if (children && modified) {
    rs.push({title:'Add Child Left',action:'addChildLeftAction'});
    rs.push({title:'Add Child Right',action:'addChildRightAction'});
    //} else {
    //  rs.push({title:'Add Child',action:'addChildRightAction'});
   // }
    rs.push({title:'Add Partner Left',action:'addPartnerLeftAction'});
    rs.push({title:'Add Partner Right',action:'addPartnerRightAction'});
    rs.push({title:'Add Parents',action:'addParentsAction'});
    rs.push({title:'Layout Family',action:'layoutTreeAction'});
              
  }
  return rs;
}


item.selectTree = function () {
  this.__select('svg');
}


item.__delete = function (vertex) {
  editor.popInfo('Deletion is not supported for family trees. Note that "undo" is available.');
}

item.hideAdvancedButtons = true;
item.afterLoad = function () {
  //this.layoutTree(person.nodeOf);
  debugger;
  editor.setSaved(true);
  this.root.partners[1].__select('svg');
  dom.svgMain.fitContents(0.5);

}

return item;

});
     
