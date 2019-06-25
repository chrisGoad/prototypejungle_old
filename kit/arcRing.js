
core.require('/shape/textPlain.js',function (textPP) {
let item =  svg.Element.mk('<g/>');

/*adjustable parameters */
item.radiusRatio = 13/10; // ratio of outer to inner radius - how thick is the ring
item.dimension = 250;
item.textRadiusRatio = 1.3;
item.indentDepth = 15;
item.numSegments = 5;
/*end adjustable parameters */

item.resizable = true;

item.isKit = true;
item.hideAdvancedButtons = true;

item.initialize = function () {
   this.set('segments',core.ArrayNode.mk());
   this.set('texts',core.ArrayNode.mk());
   this.textP = core.installPrototype(textPP); 
   this.set('segP',svg.Element.mk('<path fill="black" stroke="transparent" stroke-width = "1"/>'));
}

const toRadians = function (a) {
  return a * (Math.PI/180);
}

item.updateSegment = function (seg,startAngle,endAngle) {
  const p2str = function (letter,point) {
    return letter+' '+core.nDigits(point.x,5)+' '+core.nDigits(point.y,5)+' ';
  }
  let outerRadius = 0.5*this.dimension;
  let innerRadius = (outerRadius)/(this.radiusRatio);
  let midRadius = (innerRadius + outerRadius)/2;
  let startRadians = toRadians(startAngle);
  let endRadians = toRadians(endAngle);
  let startVec = Point.mk(Math.cos(startRadians),-Math.sin(startRadians));
  let startVecN = startVec.normal();
  let endVec = Point.mk(Math.cos(endRadians),-Math.sin(endRadians));;
  let endVecN = endVec.normal();
  let innerStart = startVec.times(innerRadius);
  let innerEnd = endVec.times(innerRadius);
  let midPoint1 = endVec.times(midRadius);
  let pointPoint = midPoint1.plus(endVecN.times(this.indentDepth));
  let outerStart = endVec.times(outerRadius);
  let outerEnd= startVec.times(outerRadius);
  let midPoint2 = startVec.times(midRadius);
  let indentPoint = midPoint2.plus(startVecN.times(this.indentDepth));
  let path = p2str('M',innerStart);
  path += `A ${innerRadius} ${innerRadius} 0 0 1`;
  path += p2str(' ',innerEnd);
  path += p2str('L',pointPoint);
  path += p2str('L',outerStart);
  path += `A ${outerRadius} ${outerRadius} 0 0 0`;
  path += p2str(' ',outerEnd);
  path += p2str('L',indentPoint);
  path += p2str('L',innerStart);
  seg.d = path;
}

item.moveText = function (txt,iangle,radius) {
  let angle = toRadians(iangle);
  
  let textVec = Point.mk(Math.cos(angle),Math.sin(angle)).times(radius);
  txt.moveto(textVec);
  txt.update();
}

item.moveTexts = function () {
  let radius = (this.textRadiusRatio) * 0.5 * this.dimension;
  let n = this.numSegments;
  let ca = 360;
  let segA = 360/n;
  let texts = this.texts;
  let selnode = ui.vars.selectedNode;
  for (let i=0;i<n;i++) {
    let txt = texts[i];
    if (txt === selnode) {
      ui.unselect();
    }
    let midA = ca - 0.5*segA;
    this.moveText(texts[i],midA,radius);
    ca = ca - segA;
  }
}
    
const colors = ['red','green','yellow'];
item.update = function () {
  let ctxt = this.centerText;
  if (!ctxt) {
    this.set('centerText',this.textP.instantiate().show());
  }
  let segs = this.segments;
  let n = this.numSegments;
  if (n < 2) {
    this.numSegments = 2;
    n = 2;
  }
  let texts = this.texts;
  let ln = segs.length;
  if (n < ln) {
    for (let i = n-1;i<ln-1;i++) {
      segs[0].remove();
      texts[0].remove();
    }
  }
  let ca = 360;
  let segA = 360/n;
  let intv = 5;
  for (let i=0;i<n;i++) {
    let seg,txt;
    if (i<ln) {
      seg = segs[i];
      txt = texts[i];
    } else {
      txt = this.textP.instantiate().show();
      this.texts.push(txt);
      let midA = ca - 0.5*segA;
      seg = this.segP.instantiate();
      segs.push(seg);
      seg.undraggable = true;
      seg.set('hiddenProperties',core.ObjectNode.mk());
      seg.hiddenProperties.d = 1;
      let cl = colors.length;
      let cidx = i%cl;
      seg.fill = colors[cidx];
    }
    this.updateSegment(seg,ca - intv,(ca - segA) + intv);
    ca = ca - segA;
  }
  this.moveTexts();
}


item.actions = function (itm) {
  let rs = [];
  rs.push({title:'Position Texts',action:'moveTexts'});

  return rs;
}

ui.hide(item,['centerText','hideAdvancedButtons','segP','segments','texts']);

item.transferState = () => {}; // for now

return item;
});

