pj.require('/diagram/multiOutTree.js','/diagram/navajoData.js',function (treeP,data) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
//var tree = pj.root.set('__graph',treeP.instantiate());
var tree =  item.set('tree',treeP.instantiate());
tree.__show();

debugger;
tree.buildFromData(data);
return item;
tree.setRootText('foob');
debugger;
tree.addChild(tree.rootNode,'aa vv');
tree.addChild(tree.rootNode,'bb');
tree.addChild(tree.rootNode.descendants[0],'pp');
tree.addChild(tree.rootNode.descendants[0],'qq');
tree.addChild(tree.rootNode.descendants[0],'rr');
tree.addChild(tree.rootNode.descendants[1],'xx');
tree.addChild(tree.rootNode.descendants[1],'yy');
tree.update();
debugger;
//tree.addChild(tree,'zum');
return item;
});
