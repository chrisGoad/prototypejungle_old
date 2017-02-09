// Arrow

'use strict';

pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<line/>');// x1="0" y1="0" x2="500" y2="50" stroke="black" stroke-width="2"/>');
item.set('end0',geom.Point.mk(-50,0));
item.set('end1', geom.Point.mk(50,50));
item.stroke = 'black';
item['stroke-width'] = 2;
//var item = svg.Element.mk('<g/>');
/*item.width = 50;
item.height = 35;
item.fill = 'none';
item.stroke = 'black';
item['stroke-width'] = 2;
*/

/*
 *item.set("__contents",svg.Element.mk(
   '<rect x="0" y="0" width="100" height="50" stroke="green" '+
   ' stroke-width="2" fill="red"/>'));
//return item;
item.__contents.__unselectable = true;
item.__contents.__show();
*/

item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}


item.__domMap =
  {transfers:svg.commonTransfers,
   mapping:
     function (itm,element) {
       var e0 = itm.end0;
       var e1 = itm.end1;
    
       element.setAttribute('x1',e0.x);
       element.setAttribute('y1',e0.y);
       element.setAttribute('x2',e1.x);
       element.setAttribute('y2',e1.y);

    }
}


//ui.hide(item,['__contents']);

//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);

//pj.returnValue(undefined,item);
return item;
});
//();
