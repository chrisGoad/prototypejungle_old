pj.require('/diagram/multiOutTree.js',function (treeP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
//var tree = pj.root.set('__graph',treeP.instantiate());
var tree =  item.set('tree',treeP.instantiate());
tree.__show();
let data =
 {text:'things that have been put there',d:[
   {text:'things that have been put above',d:[
     {text:'the  &#937; sun'},
     {text:'the moon'},
     {text:'the stars'},
     {text:'the clouds'},
     {text:'the sky'},
     {text:'lightning'}
   ]},
   {text:'things that have been put on the surface',d:[
     {text:'things put on land',d:[
       {text:'animate beings on land'}
     ]},
     {text:'things put under water'}
     
   ]}
 ]};
 let dataa =
 {text:'things that have been put there',d:[
   {text:'things that have been put above'}
   ]};
   
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
