// support for loading and viewing items from code, rather than a PrototypeJungle UI
(function (__pj__) {
  var actionHt;
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var tree = __pj__.tree;
  var lightbox = __pj__.lightbox;
  var page = __pj__.page;
  var treePadding = 10;
  var bkColor = "white";
  var plusbut,minusbut;
  
 
    
var page = prototypeJungle.page;

  
function afterAfterLoadData() {
    //svg.main.setContents(om.root);
    svg.refresh();//  get all the latest into svg
    svg.main.fitContents();
    svg.refresh();
    
  
}


  page.genMainPage = function () {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg);
   // theCanvas = dom.addCanvas(canvasDiv);
    //theCanvas.contents = om.root;

    mpg.install($("body"));
    svg.init(svgDiv.__element__[0]);

    svg.main.addButtons("Inspect");
    svg.main.navbut.__element__.click(function () {
        var inspectPage = om.useMinified?"/inspect.html":"inspectd.html";
        var url = inspectPage + "?item="+unpackedUrl.spath;
        if (om.root.dataSource) {
          url = url + "&data="+om.root.dataSource;
        }
        location.href = url;
      });
      
      
   
    layout(true); //nodraw
    //theCanvas.init();
    $('body').css({"background-color":"white"});
    mpg.css({"background-color":"white"})
    //layout();
  }
    
     function afterInstall(ars) {
        debugger;
          var om = prototypeJungle.om;
          var svg = prototypeJungle.svg;
          var ln  = ars.length;
          if (ln>0) {
            var rs = ars[ln-1]
            //var ovr = extractOverrides(rs);
            om.root = rs;
            page.genMainPage();
            //draw.overrides = ovr;
            //frs.deepUpdate(null,ovr);
            var bkc = rs.backgroundColor;
            if (!bkc) {
              rs.backgroundColor="rgb(255,255,255)";
            }
            svg.main.setContents(om.root);
  
            svg.refresh();//  get all the latest into svg
            svg.main.fitContents();
            svg.refresh();
    
            return;
          }
     }
  var draw = {};
  
  draw.initPage = function (div) {
    
$('document').ready(function () {
   var om = prototypeJungle.om;
   var svg = prototypeJungle.svg;
   var itemPath = "/sys/repo0/examples/TwoRectangles";
   page.unpackedUrl = om.unpackUrl(itemPath);
   om.install(page.unpackedUrl.url,afterInstall);
   return;
   debugger;
   var cnv = draw.initCanvas($('#canvas'));
   cnv.bkColor = "white";
   cnv.fitFactor = 0.7;
   draw.installAsRoot(itemUri,cnv,function (rs) {
     // modify the height of the all of the labels
     // by changing the relevant prototype
     rs.LabelP.style.height= 20;
     rs.setData({value:[{x:1,y:26},{x:2,y:12},{x:3,y:40},{x:4,y:14}]});
       rs.update();
       cnv.fitContents();
  });
});
  
  
})(prototypeJungle);

