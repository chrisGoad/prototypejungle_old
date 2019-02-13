
 core.require(function () {
 let item = svg.Element.mk('<path  fill="transparent" stroke-opacity="1" stroke-linecap="round"/>');

 item.resizable = true;
 item.width = 200;
 
 item.repWidth= 24;
 item.height = 0.75 * item.repWidth;

 item['stroke-width'] = 1;
 item.stroke = 'black';
 item.fill = 'transparent';


 item.buildDeltas = function () {
   let dim = this.repWidth/4;

   return [Point.mk(3*dim,0),Point.mk(0,-2*dim),Point.mk(-dim,0),
           Point.mk(0,dim),Point.mk(-dim,0),Point.mk(0,-2*dim),              
           Point.mk(3*dim,0),Point.mk(0,3*dim)];
 }
 
item.update = function () {
  this.height = 1.0 * this.repWidth;
  let actualHeight = 0.75*this.repWidth;
  let deltas = this.buildDeltas();
  let ln = deltas.length;
  let current = Point.mk(-0.5*this.width,0.5*actualHeight);
  let last = Point.mk(0.5*this.width,0.5*actualHeight);
  let n = Math.floor(this.width/this.repWidth);
  let hLeftOver = 0.5*(this.width - n*this.repWidth);
  let next = current.plus(Point.mk(hLeftOver,0));
  const p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  let path = p2str('M',current, ' ') + p2str('L',next,' ');
  for (let count = 0;count < n;count++) {
     for (let i=0;i<ln;i++) {
       current = current.plus(deltas[i]);
       path += p2str('L',current,' ');
     }
  }
  path += p2str('L',last,' ');
  this.d = path;
}
  
ui.hide(item,['fill','height','d','stroke-opacity','stroke-linecap']);
  
return item;
})