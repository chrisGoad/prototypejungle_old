'use strict';

pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;

var item =  svg.Element.mk('<g/>');

 item.__role = 'vertex';
item.__transferredProperties = ['stroke','fill'];
item.__transferExtent = true;
//item.__actions = [{title:'connect',action:'connectAction'}];

item.__dragStep =  function (pos) {
  var topActive = pj.ancestorWithProperty(this,'__activeTop');
  if (topActive && topActive.dragVertex) {
    topActive.dragVertex(this,pos);
  }
}

item.__delete = function () {
  var topActive = pj.ancestorWithProperty(this,'__activeTop');
  if (topActive && topActive.deleteVertex) {
    topActive.deleteVertex(this);
  } else {
    ui.standardDelete(this);
  }
}
//item.__actions = [{title:'connect',action:'connectAction'}];


return item;
});

