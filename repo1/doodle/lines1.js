(function () {
var svg = pj.svg;
var ui = pj.ui;

var item = svg.Element.mk('<g/>');
item.set("LineP",
  svg.Element.mk('<line x1="-100" y1="0" x2="100" y2="0" visibility="hidden" \
    stroke="black"  stroke-linecap="round" stroke-width="2"/>'));
item.numLines = 20;
item.lineSep = 10;

item.set('lines', pj.Spread.mk(item.LineP));

item.lines.binder = function (line,data,indexInSeries,lengthOfDataSeries) {
  var y = this.parent().lineSep * indexInSeries;
  line.__show();
  line.y1 = line.y2 = y;
}

item.update = function () {
    var lineSep = this.lineSep;
    var numLines = this.numLines;
    var data = [];
    var i;
    for (i=0;i<numLines;i++) {
        data.push(0);
    }
    this.lines.setData(data,1);
}
pj.returnValue(undefined,item);

})()

/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|nonfunctional/lines1.js
*/
