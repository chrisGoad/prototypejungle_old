pj.require('/smudge/jerkylines.js',function (JerkyLinesC) {
var svg = pj.svg;


var item = svg.Element.mk('<g/>');
//item.set("JerkyLinesP",jerkyLinesC.instantiate());
item.width = 300;
item.height = 100;

item.fill = "green";
item.set('theBar',JerkyLinesC.instantiate());

item.set('__signature',pj.Signature.mk({width:'N',height:'N',fill:'S',stroke:'S','stroke-width':'N'}));



item.update = function () {
    debugger;
    var hw = 0.5 * this.width;
    
    this.theBar.end1.y = this.theBar.end0.y = 0;
    this.theBar.end0.x= -hw;
    this.theBar.end1.x= hw;
    this.theBar.randomFactor =this.height;
    console.log('fill',this.fill);
    this.theBar.stroke = this.fill;
    this.theBar.update();
}
return item;
});

/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|nonfunctional/lines1.js
*/
