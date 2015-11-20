
(function () {
pj.require('graph/def.js',function (erm,graphLib) {
  var vv = graphLib.mkVertices(
            {root:[35,-20,'internal'],
              L:[0,0],LL:[-20,20],LLL:[-30,40,'leaf'],LLR:[-10,40],
              LR:[20,20,'internal'],LRL:[20,40,'leaf'],
              M:[35,0,'leaf'],
              R:[70,15,'internal'],RL:[50,35,'leaf'],RR:[90,35],RRL:[90,55,'leaf']});
  var ee = graphLib.mkEdges(
             [['root','L','prop'],['L','LL'],['LL','LLL'],['LL','LLR'],['L','LR'],['LR','LRL'],
              ['root','M','prop'],
              ['root','R'],['R','RL'],['R','RR'],['RR','RRL'],
              ['R','L','proto'],['RR','RL'],['LR','LL'],['RL','LL']]);
  var g = graphLib.mkGraph(vv,ee);
  //top.set('data',g); 
  pj.returnData(g);
});
})()
/* 
 <circle id="0" r="2" cx="130" cy="-15" visibility="inherit"></circle>
  <circle id="1" r="2" cx="130" cy="5" visibility="inherit" fill="green"></circle>

<circle id="12" r="2" cx="35" cy="-20" visibility="inherit"></circle> root
  <circle id="2" r="2" cx="0" cy="0" visibility="inherit"></circle> L
    <circle id="3" r="2" cx="-20" cy="20" visibility="inherit"></circle> LL
      <circle id="5" r="2" cx="-30" cy="40" visibility="inherit" fill="green"></circle> LLL
      <circle id="6" r="2" cx="-10" cy="40" visibility="inherit" fill="green"></circle> LLR
    <circle id="4" r="2" cx="20" cy="20" visibility="inherit"></circle> LR
      <circle id="7" r="2" cx="20" cy="40" visibility="inherit" fill="green"></circle> LRL

  <circle id="8" r="2" cx="70" cy="15" visibility="inherit"></circle> R
    <circle id="9" r="2" cx="50" cy="35" visibility="inherit"></circle> RL
    <circle id="10" r="2" cx="90" cy="35" visibility="inherit"></circle> RR
      <circle id="11" r="2" cx="90" cy="55" visibility="inherit" fill="green"></circle> RRL
*/
