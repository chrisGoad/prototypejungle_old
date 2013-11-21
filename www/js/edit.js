
    
(function (__pj__){
 
  var om = __pj__.om;
  var draw = __pj__.draw;
  var page = __pj__.page
 

var cb;
var editor;
var itemPath;
//var theItemPath = '/pj/repoTest2/examples/Nested';
var buildTimeout = 3000;// does not  include load time, just the computation of the bnuild itself
var buildDone;
//var editor;
// var itemPath;
   
  page.elementsToHideOnError = [];

var longS = "a\nb\n";
for (var i=0;i<5;i++) {
    longS = longS + longS;
}

window.initializeEditor = function (rct,fe) {
    var f = fe[0];
    var path = fe[1];
    var s = f.toString();
    var xt = rct.extent;
    var awinwid = xt.x;
    var awinht = xt.y;
   // var awinwid = $(window).width(); 
   // var awinht = $(window).height(); I'm not sure why, but this gave the wrong answer
    var topht = 30;
    var vfudge = 60;
    var eht = awinht - vfudge - topht;
    var padding = 10;
    var fudge = 20;
    var ewd = awinwid-(2*padding)-fudge;
    $('#editor').css({height:eht+"px",top:topht+"px",width:ewd+"px",left:padding+"px"});
    editor.setValue(s);
    editor.clearSelection();
    $('.error').html('');
  }

  window.setPjError = function (msg) {
    $('.error').html(msg);
  }





  
page.whenReady = function () {
    
    om.disableBackspace();
   

    editor = ace.edit("editor");
    editor.setTheme("ace/theme/TextMate");
    editor.getSession().setMode("ace/mode/javascript");
 
    $('#saveButton').click(function () {
      var vl = editor.getValue();
      window.parent.fromEditor("newCode",vl);
    });
    $('#cancelButton').click(function () {
      window.parent.fromEditor("cancel");
    });
    window.parent.fromEditor("ready");
    //layout();
  }
  
  
 


})(prototypeJungle);


    