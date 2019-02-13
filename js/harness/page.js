
 // the page structure
let mpg,svgDiv,svgMessageDiv;


const buildPage = function () {
mpg =  html.wrap("main",'div',{style:{position:"absolute","margin":"0px",padding:"0px",display:"none"}}).
__addChildren([ 
  svgDiv = html.Element.mk('<div id="svgDiv" draggable="true" style="position:absolute;background-color:white;border:solid thin black;display:inline-block"/>').
 __addChildren([
      svgMessageDiv =
       html.Element.mk('<div style="position:absolute;display:none;padding:20px;border:solid thin black"></div>')
  ]) 
])
return mpg;
};




   // there is some mis-measurement the first time around, so this runs itself twice at fist
let firstLayout = true;

const layout = function(noDraw) { // in the initialization phase, it is not yet time to draw, and adjust the transform
  let pageHeight,pageWidth,svgwd,svght;
  pageWidth = window.innerWidth - 10;//$(window).width();
  pageHeight= window.innerHeight - 20;//$(window).height();
  mpg.$css({left:"5px",width:pageWidth+"px",height:(pageHeight-0)+"px",display:"block"});
  svgwd = pageWidth-20;
  svght = pageHeight - 20;
  svgDiv.$css({id:"svgdiv",left:"10px",width:svgwd +"px",height:svght + "px"});
  svgMessageDiv.$css({left:(svgwd/2-100)+"px",top:"20px",width:"300px",height:(svght/2) + "px"});
  dom.svgMain.resize(svgwd,svght); 
  if (firstLayout) {
    firstLayout = false; 
    layout(noDraw);
  }
}

