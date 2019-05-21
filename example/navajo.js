//navajo


core.require('/kit/multiTree.js','/data/navajo.json',function (treeP,data) {
let item = treeP.instantiate();//svg.Element.mk('<g/>');
let tree = item;
//var tree =  item.set('tree',treeP.instantiate());
//tree.connectorP.width = 100;
tree.leafWidth = 180;
//tree.textP.width = 180;
//tree.textP.hPadding = 10;
//tree.paddingRight=10;
tree.show();
tree.buildFromData(data);
return item;
});
