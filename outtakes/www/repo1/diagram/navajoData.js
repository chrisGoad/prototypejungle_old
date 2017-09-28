'use strict';
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
pj.require(function () {
 let hdata =
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
       {text:'plants | nanise\u00B4',d:[
         {text:'flexible plants | ch\u00B4il'},
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
  let vdata =
  {text:'things that have been put there\nniily\u00E1ii',d:[
   {text:'things that have been put above\nh\u00F3t\u00B4\u00E1\u00E1h niily\u00E1ii',d:[
     {text:'the sun\nj\u00CDhonaa\u00B4\u00E9\u00ED'},
     {text:'the moon\ntl\u00B4\u00E9\u00E9honaa\u00B4\u00E9\u00ED'},
     {text:'the stars\nsq\u00B4'},
     {text:'the clouds\nk\u00B4os'},
     {text:'the sky\ny\u00E1'},
     {text:'lightning\nii\u00B4mi\u00B4'}
   ]},
   {text:'things that have been put on the surface\nnahasdz\u00E1\u00E1n',d:[
     {text:'things put on land\nnihok\u00E1\u00E1\u00B4 niily\u00E1ii',d:[
       {text:'animate beings on land\nnahak\u00E1\u00E1\u00B4 hin\u00E1anii',d:[
         {text:'flyers\nnaat\u00B4a\u00B4ii'},
         {text:'walkers\nnaagh\u00E1ii'},
         {text:'crawlers\nnaana\u00B4ii'},
         {text:'insects\nch\u00B4osh'}
        ]},
       {text:'plants\nnanise\u00B4',d:[
         {text:'flexible plants| ch\u00B4il'},
         {text:'woody plants\ntsin'},
         {text:'cacti\nhosh'},
         {text:'lichen, mosses\ndl\u00E1\u00E1d'},
         {text:'yucca\ntsa\u00B4aszi'},
         {text:'domesticated plants\nneest\u0105\u0314'}
       ]},
       {text:'mountains\ndzi\u0142\u00B4\u00B4'}
     ]},
     {text:'things put under water\nt\u00E1\u0142tl\u00B4\u00E1\u00E1 niily\u00E1ii'}
     
   ]},
   //{text:'things that have been put inside the earth\nnahasdz\u00E1\u00E1 biyi\u00B4 niily\u00E1ii\n\n'},//d:[
   {text:'things that have been put inside the earth\nnahasdz\u00E1\u00E1 biyi\u00B4 niily\u00E1ii',d:[
     {text:'earth\n\u0142ez'},
     {text:'rocks\nts\u00E9'},
     {text:'gold\nnahak\u00E1\u00E1'}
   ]},
  {text:'things that have been put there for the Navajo\nden\u00E9 b\u00E1niily\u00E1ii',d:[
     {text:'things by means of which Navajos live\ndin\u00E9 yeeiia\u00E1nii'},
     {text:'things according to which Navajos live\n din\u00E9 yik\u00B4eh yig\u00E1a\u0142ii'},
     {text:'Navajo duties\ndin\u00E9 binaaghe\u00B4'}
  ]}
 ]};
  return hdata;
 return {hdata:hdata,vdata:vdata};
});
 
