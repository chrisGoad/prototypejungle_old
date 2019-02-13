

'use strict';
core.require('/shape/line.js','/shape/angledBorder1.js',function (stripePP,borderPP) {

let {geom,svg,ui} = core;


let item =  svg.Element.mk('<g/>');

/* adjustable parameters */
item.height = 50;
item.width = 50;
item.angleFactor=0.2; // as multiple of max height,width
item.dotFactor = 0.5; //diameter of dot as multiple of angleDim
item.stroke = "black";
item.fill = "transparent";
item['stroke-width'] = 10;

/* end adjustable parameters */
item.set('stripeP',stripePP.instantiate().__hide());
item.stripeP.stroke = "white";
item.stripeP['stroke-width'] = 0.3;
item.set('border',borderPP.instantiate().__show());
item.set('stripes',svg.Element.mk('<g/>'));
item.stripes.set('stripeSetTop',svg.Element.mk('<g/>'));
item.stripes.set('stripeSetLeft',svg.Element.mk('<g/>'));
item.stripes.set('stripeSetRight',svg.Element.mk('<g/>'));
item.stripes.set('stripeSetBottom',svg.Element.mk('<g/>'));

item.border.__unselectable = true;
item.stripes.__unselectable = true;
//item.set('stripe1',item.stripeP.instantiate());

item.__adjustable = true;
item.__draggable = true;

item.update = function () {
  let thisHere = this;
  const generateStripeSet = function (dest,horizontal,where,offset,n) {
    for (var i=0;i<n;i++) {
      let c = (0.5*(n-1) - i) * offset;
      let nm = 's'+i;
      let stripe;
      if (dest[nm]) {
        stripe = dest[nm]
      } else {
        stripe = thisHere.stripeP.instantiate().__show();
        dest.set(nm,stripe);
      }
      let hsw = 0.5 * thisHere['stroke-width'];
      let diag = (i===0 || i===(n-1))?0:hsw;
      if (i === (n-1)) {
        c = c-hsw;
      }
       if (i === 0) {
        c = c+hsw;
      }
      if (horizontal) {
        stripe.setEnds(where.plus(geom.Point.mk(c-diag,hsw)),where.plus(geom.Point.mk(c+diag,-hsw)));
      } else {
        stripe.setEnds(where.plus(geom.Point.mk(hsw,c-diag)),where.plus(geom.Point.mk(-hsw,c+diag)));      
      }
      stripe.__update();
    }
  }
  this.border['stroke-width'] = this['stroke-width'];
  this.border.angleFactor = this.angleFactor;
  this.border.width = this.width;
  this.border.height = this.height;
  let hwidth = 0.5 * this.width;
  let hheight = 0.5 * this.height;
  let stripes = this.stripes;
  generateStripeSet(stripes.stripeSetTop,true,geom.Point.mk(0,-hheight),1,7);
  generateStripeSet(stripes.stripeSetLeft,false,geom.Point.mk(-hwidth,0),1,7);
  generateStripeSet(stripes.stripeSetRight,false,geom.Point.mk(hwidth,0),1,7);
  generateStripeSet(stripes.stripeSetBottom,true,geom.Point.mk(0,hheight),1,7);

  let hAngleDim = this.angleFactor * Math.min(this.width,this.height);
  this.border.update();
  return;
  this.dotP.__dimension = this.dotFactor * hAngleDim;
  let dotOff = 0.2*hAngleDim;
  this.dot1.__moveto(geom.Point.mk(-hwidth+dotOff,-hheight+dotOff));
  this.dot2.__moveto(geom.Point.mk(hwidth-dotOff,-hheight+dotOff));
  this.dot3.__moveto(geom.Point.mk(-hwidth+dotOff,hheight-dotOff));
  this.dot4.__moveto(geom.Point.mk(hwidth-dotOff,hheight-dotOff));
  //this.dot1.update();
}
 

// support for the resizer 


item.__setExtent = function (extent) {
  this.width= extent.x;
  this.height = extent.y;
}

ui.hide(item,['d']);
//item.__setFieldType('solidHead','boolean');
ui.installRectanglePeripheryOps(item);
ui.setTransferredProperties(item,ui.stdTransferredProperties);

return item;

});

