pj.require('/diagram/multiOutTree.js',function (treeP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
//var tree = pj.root.set('__graph',treeP.instantiate());
var tree =  item.set('tree',treeP.instantiate());
tree.textP.width = 40;
tree.textP.vPadding = 5;
tree.leafWidth = 40;
tree.__show();
tree.update();
tree.__show();

return item;
/* substitions:
  + => \u00B4
  a^ => \u00E1
  e^ => \u00E9
  from http://www.geocities.ws/click2speak/unicode/chars_nv.html
  */
/* pre substitution
let data =
 {text:'things that have been put there\nniily\u00E1ii',d:[
   {text:'things that have been put above\nh\u00F3t\u00B4\u00E1\u00E1h niily\u00E1ii',d:[
     {text:'the sun | j\u00CDhonaa\u00B4\u00E9\u00ED'},
     {text:'the moon | tl\u00B4\u00E9\u00E9honaa\u00B4\u00E9\u00ED'},
     {text:'the stars | sq+'},
     {text:'the clouds | k+os'},
     {text:'the sky | y\u00E1'},
     {text:'lightning | ii+mi+'}
   ]},
   {text:'things that have been put on the surface\nnahasdz\u00E1\u00E1n',d:[
     {text:'things put on land\nnihoka^a^+ niilya^ii',d:[
       {text:'animate beings on land\nnahaka^a^+ hina^anii',d:[
         {text:'flyers | naat+a+ii'},
         {text:'walkers | naagha^ii'},
         {text:'crawlers | naana+ii'},
         {text:'insects | ch+osh'}
        ]},
       {text:'plants\nnanise+',d:[
         {text:'flexible plants| ch+il'},
         {text:'woody plants | tsin'},
         {text:'cacti | hosh'},
         {text:'lichen, mosses | dla^a^d'},
         {text:'yucca | tsa+aszi'}
       ]},
       {text:'mountains | dzi\u0142++'}
     ]},
     {text:'things put under water | ta^\u0142tl+a^a^ niilya^ii'}
     
   ]},
   {text:'things that have been put inside the earth\nnahasdz\u00E1\u00E1 biyi+ niilya^ii\n\n',d:[
     {text:'earth | \u0142ez'},
     {text:'rocks | tse^'},
     {text:'gold | nahak\u00E1\u00E1'}
   ]},
  {text:'things that have been put there for the Navajo\ndene^ ba^niilya^ii',d:[
     {text:'things by means of which Navajos live | dine^ yeeiiaa^nii'},
     {text:'things according to which Navajos live |  dine^ yik+eh yiga^a\u0142ii'},
     {text:'Navajo  duties | dine^ binaaghe+'}
  ]}
 ]};
 */

let ddata =
 {text:'things that have been put there\nniily\u00E1ii',d:[
   {text:'things that have been put above\nh\u00F3t\u00B4\u00E1\u00E1h niily\u00E1ii',d:[
     {text:'the sun | j\u00CDhonaa\u00B4\u00E9\u00ED'},
     {text:'the moon | tl\u00B4\u00E9\u00E9honaa\u00B4\u00E9\u00ED'},
     {text:'the stars | sq\u00B4'},
     {text:'the clouds | k\u00B4os'},
     {text:'the sky | y\u00E1'},
     {text:'lightning | ii\u00B4mi\u00B4'}
   ]},
   {text:'things that have been put on the surface\nnahasdz\u00E1\u00E1n',d:[
     {text:'things put on land\nnihok\u00E1\u00E1\u00B4 niily\u00E1ii',d:[
       {text:'animate beings on land\nnahak\u00E1\u00E1\u00B4 hin\u00E1anii',d:[
         {text:'flyers | naat\u00B4a\u00B4ii'},
         {text:'walkers | naagh\u00E1ii'},
         {text:'crawlers | naana\u00B4ii'},
         {text:'insects | ch\u00B4osh'}
        ]},
       {text:'plants\nnanise\u00B4',d:[
         {text:'flexible plants| ch\u00B4il'},
         {text:'woody plants | tsin'},
         {text:'cacti | hosh'},
         {text:'lichen, mosses | dl\u00E1\u00E1d'},
         {text:'yucca | tsa\u00B4aszi'},
         {text:'domesticated plants | neest\u0105\u0314'}
       ]},
       {text:'mountains | dzi\u0142\u00B4\u00B4'}
     ]},
     {text:'things put under water | t\u00E1\u0142tl\u00B4\u00E1\u00E1 niily\u00E1ii'}
     
   ]},
   //{text:'things that have been put inside the earth\nnahasdz\u00E1\u00E1 biyi\u00B4 niily\u00E1ii\n\n'},//d:[
   {text:'things that have been put inside the earth\nnahasdz\u00E1\u00E1 biyi\u00B4 niily\u00E1ii',d:[
     {text:'earth | \u0142ez'},
     {text:'rocks | ts\u00E9'},
     {text:'gold | nahak\u00E1\u00E1'}
   ]},
  {text:'things that have been put there for the Navajo\nden\u00E9 b\u00E1niily\u00E1ii',d:[
     {text:'things by means of which Navajos live | din\u00E9 yeeiia\u00E1nii'},
     {text:'things according to which Navajos live |  din\u00E9 yik\u00B4eh yig\u00E1a\u0142ii'},
     {text:'Navajo duties | din\u00E9 binaaghe\u00B4'}
  ]}
 ]};
 
 let data = {text:'root',d:[
  {text:'child1'},{text:'child2',d:[
    {text:'child3'},{text:'child4'}
  ]}
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
