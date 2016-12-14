pj.require('/smudge/jerkylines.js',function (JerkyLinesC) {
var svg = pj.svg;


var item = svg.Element.mk('<g/>');
//item.set("JerkyLinesP",jerkyLinesC.instantiate());
item.width = 100;
item.height = 100;

item.set('left',JerkyLinesC.instantiate());
item.set('right',JerkyLinesC.instantiate());
item.set('top',JerkyLinesC.instantiate());
item.set('bottom',JerkyLinesC.instantiate());



item.update = function () {
    debugger;
    var hw = 0.5 * this.width;
    var hh = 0.5 * this.height;
    this.left.end1.x = this.left.end0.x = -hw
    this.left.end0.y= -hh
    this.left.end1.y= hh;
    this.right.end1.x = this.right.end0.x = hw
    this.right.end0.y= -hh;
    this.right.end1.y= hh;
    this.top.end1.y = this.top.end0.y = -hh;
    this.top.end0.x= -hw
    this.top.end1.x = hw;
    this.bottom.end1.y = this.bottom.end0.y = hh;
    this.bottom.end0.x= -hw
    this.bottom.end1.x = hw;
    this.left.update();
    this.right.update();
    this.bottom.update();
    this.top.update();
}
return item;
});

/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|nonfunctional/lines1.js
*/
