//bulbous line

core.require('/line/utils.js',function (utils) {

let item = svg.Element.mk('<path  stroke="black"  stroke-opacity="1" stroke-linecap="round" stroke-width="0.1"/>');

utils.setup(item);

/*adjustable parameters */
item.bulbWidth0 = 5;
item.bulbWidth1 = 10;
/*end adjustable parameters */

item.adjustableProperties = utils.adjustableProperties.concat(['bulbWidth0','bulbWidth1']);

item.role = 'line';

item.setEnds = function (p0,p1) {
  utils.setEnds(this,p0,p1);
}

item.update = function () {
  this['stroke-width'] = 0.1;
  this.fill = this.stroke;
  let bulbWidth0 = this.bulbWidth0;
  let bulbWidth1 = this.bulbWidth1;
  const genPath = function (end0,end1) {
    const p2str = function (letter,point,after) {
      return letter+' '+point.x+' '+point.y+after;
    }
    let vec = end1.difference(end0);
    let nvec = vec.normalize();
    let normal = nvec.normal();
    let scaledNormal0 = normal.times(bulbWidth0/2);
    let halfScaledNormal0= scaledNormal0.times(0.5);
    let bulbLeft0 = end0.difference(scaledNormal0);
    let bulbRight0 = end0.plus(scaledNormal0);
    let bulbTop0 = end0.difference(nvec.times(bulbWidth0/2));
    let controlLeft0 = bulbTop0.difference(halfScaledNormal0);
    let controlRight0 = bulbTop0.plus(halfScaledNormal0);
    let scaledNormal1 = normal.times(bulbWidth1/2);
    let halfScaledNormal1= scaledNormal1.times(0.5);
    let bulbLeft1 = end1.difference(scaledNormal1);
    let bulbRight1 = end1.plus(scaledNormal1);
    let bulbTop1 = end1.plus(nvec.times(bulbWidth1/2));
    let controlLeft1 = bulbTop1.difference(halfScaledNormal1);
    let controlRight1 = bulbTop1.plus(halfScaledNormal1);
    let path = p2str('M',bulbLeft0,' ') + p2str('L',bulbLeft1,' ') +
        p2str('C',controlLeft1,',') +  p2str(' ',controlRight1,',')  + p2str(' ',bulbRight1,' ') +
        p2str('L',bulbRight0,' ') +
        p2str('C',controlRight0,',') +  p2str(' ',controlLeft0,',')  + p2str(' ',bulbLeft0,' ') +
          p2str('L',bulbLeft0,' ');
    return path;
  };
  let path = genPath(this.end0,this.end1);
  this.d = path;
  if (this.text  && this.__parent.updateText) {
    this.__parent.updateText(this.text);
  }
}


item.controlPoints = function () {
  return utils.controlPoints(this);
}

item.updateControlPoint = function (idx,rpos) {
   utils.updateControlPoint(this,idx,rpos);
}


item.transferState = function (src,own) { //own = consider only the own properties of src
  utils.transferState(this,src,own);
}


ui.hide(item,['end0','end1','d','fill','stroke-width','stroke-opacity','stroke-linecap']);

return item;
});