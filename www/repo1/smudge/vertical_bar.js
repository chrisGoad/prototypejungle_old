pj.require('/smudge/jerkylines.js',function (JerkyLinesC) {
var svg = pj.svg;


var item = svg.Element.mk('<g/>');
//item.set("JerkyLinesP",jerkyLinesC.instantiate());
item.width = 100;
item.height = 300;

item.fill = "black";
item.set('theBar',JerkyLinesC.instantiate());

item.set('__signature',pj.Signature.mk({width:'N',height:'N',fill:'S',stroke:'S','stroke-width':'N'}));



item.update = function () {
    debugger;
    var hh = 0.5 * this.height;
    this.theBar.end1.y = this.theBar.end0.y = 0;
    this.theBar.end0.x=this.theBar.end1.x= 0;
    this.theBar.end0.y = -hh;
    this.theBar.end1.y = hh;
    this.theBar.randomFactor = this.width;
    this.theBar['stroke-width'] = 0.02*this.width;
    console.log('fill',this.fill);
    this.theBar.stroke = this.fill;
    this.theBar.update();
}
return item;
});

/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|nonfunctional/lines1.js
*/
