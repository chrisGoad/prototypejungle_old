// solidHead


//core.require('/shape/circle.js',function (circlePP) {
core.require('/shape/textPlain.js',function (textPP) {
let item =  svg.Element.mk('<g/>');

/*adjustable parameters */
item.set('center',Point.mk(0,0));
item.innerRadius = 100;
item.outerRadius = 130;
item.textRadius = 160;
item.startAngle = 60;
item.endAngle = 0;
item.stroke = 'red';
item.indentDepth = 4;
item.numSegments = 5;


/*end adjustable parameters */

item.isKit = true;
item.hideAdvancedButtons = true;

item.initialize = function () {
   this.set('segments',core.ArrayNode.mk());
   this.set('texts',core.ArrayNode.mk());
   this.textP = core.installPrototype(textPP); 

}
/*
   this.circleP = core.installPrototype(circlePP); 
   this.circleP.dimension = 1;
   this.circleP.fill = 'red';
   this.circleP.stroke = 'red';
   this.set('path',svg.Element.mk('<path stroke-width = "0"/>'));
   this.set('segments',core.ArrayNode.mk());
   this.path.fill = 'red';
   this.set('c0',this.circleP.instantiate()).show();
   this.set('c1',this.circleP.instantiate()).show();
   this.c1.stroke = 'green';
   this.set('c2',this.circleP.instantiate()).show();
   this.c2.stroke = 'yellow';
   this.set('c3',this.circleP.instantiate()).show();
   this.c3.stroke = 'blue';
   this.set('c4',this.circleP.instantiate()).show();
   this.c4.stroke = 'magenta';
}
*/
const toRadians = function (a) {
  return a * (Math.PI/180);
}

item.updateSegment = function (seg,startAngle,endAngle) {
   debugger;
 
  
  const p2str = function (letter,point) {
    return letter+' '+core.nDigits(point.x,5)+' '+core.nDigits(point.y,5)+' ';
  }
  let midRadius = (this.innerRadius + this.outerRadius)/2;
  let startRadians = toRadians(startAngle);
  let endRadians = toRadians(endAngle);
  let startVec = Point.mk(Math.cos(startRadians),-Math.sin(startRadians));
  let startVecN = startVec.normal();
  let endVec = Point.mk(Math.cos(endRadians),-Math.sin(endRadians));;
  let endVecN = endVec.normal();
  let innerStart = startVec.times(this.innerRadius);
  let innerEnd = endVec.times(this.innerRadius);
  let midPoint1 = endVec.times(midRadius);
  let pointPoint = midPoint1.plus(endVecN.times(this.indentDepth));
  let outerStart = endVec.times(this.outerRadius);
  let outerEnd= startVec.times(this.outerRadius);
  let midPoint2 = startVec.times(midRadius);
  let indentPoint = midPoint2.plus(startVecN.times(this.indentDepth));
   
  /*this.c0.moveto(innerStart);
  this.c1.moveto(innerEnd);
  this.c2.moveto(pointPoint);
  this.c3.moveto(outerStart);
  this.c4.moveto(indentPoint);*/
  
  let path = p2str('M',innerStart);
  path += `A ${this.innerRadius} ${this.innerRadius} 0 0 1`;
  path += p2str(' ',innerEnd);
  path += p2str('L',pointPoint);
  path += p2str('L',outerStart);
 // return path;
  path += `A ${this.outerRadius} ${this.outerRadius} 0 0 0`;
  path += p2str(' ',outerEnd);
  path += p2str('L',indentPoint);
  path += p2str('L',innerStart);
  console.log(path);
  seg.d = path;
}

item.moveText = function (txt,iangle) {
   debugger;  
  let angle = toRadians(iangle);
  let textVec = Point.mk(Math.cos(angle),Math.sin(angle)).times(this.textRadius);
  txt.moveto(textVec);
}

item.moveTexts = function () {
  let n = this.numSegments;
  let ca = 360;
  let segA = 360/n;
  let texts = this.texts;
  for (let i=0;i<n;i++) {
    let midA = ca - 0.5*segA;
    moveText(texts[i],midA);
  }
}
    


const colors = ['red','green','yellow'];
item.update = function () {
  debugger;
  let ctxt = this.centerText;
  if (!ctxt) {
    this.set('centerText',this.textP.instantiate().show());
  }
  let segs = this.segments;
  let n = this.numSegments;
  let ln = segs.length;
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
      this.moveText(txt,midA);
      seg = svg.Element.mk('<path stroke-width = "0"/>');
      segs.push(seg);
      seg.set('hiddenProperties',core.ObjectNode.mk());
      seg.hiddenProperties.d = 1;
      let cl = colors.length;
      let cidx = i%cl;
      seg.fill = colors[cidx];
    }
    this.updateSegment(seg,ca - intv,(ca - segA) + intv);
    ca = ca - segA;
  }
}
  
 
 
 
item.selectKit = function () {
  this.__select('svg');
}

  

item.actions = function (itm) {
  let rs = [];
     rs.push({title:'Select Kit Root',action:'selectKit'});

  return rs;
}

item.afterLoad = function () {
  //this.layoutTree(person.nodeOf);
  editor.setSaved(true);
//  this.root.partners[1].__select('svg');
  dom.svgMain.fitContents(0.5);

}  
  
 


item.transferState = () => {}; // for now

return item;
});

