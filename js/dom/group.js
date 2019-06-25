// attaching text

geom.set("Group",pj.Object.mk()).__namedType;


geom.theGroups = function () {
  let rs = pj.root.groups;
  if (rs) {
    return rs;
  }
  return pj.root.set('groups',pj.Array.mk())
}

geom.newGroup = function () {
  let rs = Object.create(geom.Group);
  rs.set("members",pj.Array.mk());
  theGroups.push(rs);
  return rs;
}

geom.Group.addMember = function (node) {
  let gname = this.__name;
  if (node.__inGroup === undefined) {
    return;
  }
  let path =  pj.stringPathOf(node,pj.root);
  let members = this.members;
  arrayPush.call(members,path);
  node.__inGroup = gname;
}

geom.attachTo  = function (a,b) {
  let aGroup = a.__inGroup;
  let bGroup = b.__inGroup;
  if (aGroup && bGroup) {
      // todo : support merging groups
     if (aGroup === bGroup) {
       return; // already attached
     } else {
      pj.error('Not yet: merge groups');
     }
  }
  if (aGroup) {
    aGroup.addMember(b);
  } else if (bGroup) {
    bGroup.addMember(a);
  } else {
    let newGroup = geom.newGroup();
    newGroup.addMember(a);
    newGroup.addMember(b);
  }
}

// assumes no use of scaling @todo fix this
svg.Element.__gmoveto = function (dest) {
  let group = this.__inGroup;
  if (group) {
    let members = group.members;
    let relMove = dest.difference(myPos);
    
  }


ui.nearestText = function (node) {
  let found = undefined;
  pj.forEachDescendant(pj.root,function (d) {
    if (found) {
      return;
    }
    if (d.__sourceUrl === '/text/textPlain.js') {
      found 
    }
  }