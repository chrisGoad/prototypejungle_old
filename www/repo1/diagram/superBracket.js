// Arrow

'use strict';
//pj.require('/shape/arrowhelper.js',function (headH) {

pj.require('/shape/elbow.js','/text/textbox.js',function (elbowPP,textPP) {
//pj.require('/shape/arrowHeadHelper.js',function (headH) {

var geom = pj.geom;
var svg = pj.svg;
var item =  svg.Element.mk('<g/>');
//item.set('elbows',svg.Element.mk('<g/>'));
item.set('games',pj.Array.mk());
item.set('elbowP',elbowPP.instantiate().__hide());
item.elbowP['stroke-width'] = 1;
item.elbowP.__hide();
  //debugger;
var svg = pj.svg;
var ui = pj.ui;
var geom = pj.geom;

item.xSpacing = 20;
item.ySpacing = 5;
item.afcWinningColor = 'magenta';
//var elbows = svg.Element.mk('<g/>');
item.addGame = function (isAFC,round,indexTop,indexBottom,topWon) {
  var game = svg.Element.mk('<g/>');
  item.games.push(game);
  var e0top = geom.Point.mk(round * this.xSpacing,indexTop*this.ySpacing);
  var e0bottom = geom.Point.mk(round * this.xSpacing,indexBottom*this.ySpacing);
  var e1 = geom.Point.mk((round+2)*this.xSpacing-8,0.5*(indexTop+indexBottom)*this.ySpacing);
  var elbowTop = this.elbowP.instantiate();//.__show();
  var elbowBottom = this.elbowP.instantiate();//.__show();
  elbowTop.end0.copyto(e0top);
  elbowTop.end1.copyto(e1);
  elbowBottom.end0.copyto(e0bottom);
  elbowBottom.end1.copyto(e1);
  var winningElbow = topWon?elbowTop:elbowBottom;
  var losingElbow = topWon?elbowBottom:elbowTop;
  winningElbow.stroke = this.afcWinningColor;
  losingElbow.stroke = 'black';
  game.set('lost',losingElbow.__show());
  game.set('won',winningElbow.__show());
  elbowBottom.update();
  elbowTop.update();

}
var gamesBeenAdded  = false;
item.addGames = function () {
  debugger;
  if (!gamesBeenAdded) {
    this.addGame(true,0,0,2,true);
    gamesBeenAdded = true;
    this.addGame(true,0,5,7,true);
    this.addGame(true,1,1,3,true);
    this.addGame(true,1,4,6,true);
    this.addGame(true,2,2,5,true);
  
 }
}

item.update = function () {
  this.addGames();
}
return item;

});

