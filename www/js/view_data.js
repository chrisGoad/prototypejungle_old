
    
(function (__pj__){
 
  var om = __pj__.om;
  var draw = __pj__.draw;
  var page = __pj__.page
 

var cb;
var editor;
var dataPath;
//var theItemPath = '/pj/repoTest2/examples/Nested';
var buildTimeout = 3000;// does not  include load time, just the computation of the bnuild itself
var buildDone;
//var editor;
// var itemPath;
   
  page.elementsToHideOnError = [];


  function layout() {
   
    var awinwid = $(window).width();
    var awinht = $(window).height();
    var topht = $('#topbarOuter').height();
    var eht = awinht - 50 - topht;
    console.log(topht);
    $('#editor').css({height:eht+"px",top:(topht+40)+"px"});
  }

function checkAuth() {
  if (!dataPath) {
    return "No item path; the url should include ?data=/handle/repo ...";
  }
// strip off the handle and repo
  var ip = om.stripInitialSlash(dataPath);
  var spl = ip.split("/");
  var h = localStorage.handle;
  if (spl.length<3) {
    return "The item path must include at least /handle/repo/name";
  }
  if (spl[0] != h) {
     return "You cannot build items outside of your tree /"+h;
  }
}

function pathForData() {
 // strip off the handle and repo
  var ip = om.stripInitialSlash(dataPath);
  var spl = ip.split("/");
  spl.shift();
  spl.shift();
  return "/"+spl.join("/");
}


function setError(txt,errOnly) {
  if (!errOnly) {
    $('#saving').hide();
     $('#editor').hide();
  }
   $('#error').html(txt);
   layout();
}
var nowSaved = true;

function setSaved(v) {
  nowSaved = v;
  if (v) {
    //$('#saved').html('Saved');
    $('#itemkind').html('Item ');
    $('#stale').html('');
  } else {
    $('#saved').html('');
    $('#stale').html('*');
   
  }
  layout();
}
function saveError(url) {
  if (!buildDone) {
   __pj__.page.genError("<span style='color:red'>Error</span>: the build from <a href='"+url+"'>"+url+"</a> failed, either because the file is missing, or because there was a JavaScript error. \
                        JavaScript debuggers are available in all modern browsers. Edit, and try again.");
  }
}

function saveData(cb) {
    var vl = editor.getValue();
    try {
        var pr = JSON.parse(vl);
    } catch(e) {
        $('#error').html("Not legal JSON");
       return;
    }
    var dt = {path:dataPath,data:editor.getValue()};
    $('#saving').show();
    om.ajaxPost("/api/saveData",dt,function (rs) {
       $('#saving').hide();
       if (rs.status != "ok") {
        setError("Save failed. (Internal error)");
      } else {
        setSaved(true);
        if (cb) {
          cb();
        }
      }
    });
  }
  
function getData(cb) {
    function scb(rs) {
      if (rs.statusText == "OK") {
        cb(rs.responseText);
      } else {
        cb(undefined);
      }
    }
   
    var opts = {url:dataUrl,cache:false,contentType:"application/javascript",dataType:"string",type:"GET",success:scb,error:scb};
    $.ajax(opts);
    //code
  }
/*
function doTheBuild() {
    saveSource(function () {
       om.customSave = function (built) {
        buildDone = true;
        built.__source__ =  itemSource;
        var whenSaved = function (srs) {
          if (srs.status == "fail") {
            $('#nowBuilding').hide();
            if (srs.msg == "busy") {
              emsg = "The server is overloaded just now. Please try again later";
            } else if ((srs.msg=="noSession")||(srs.msg == "timedOut")) {
              var emsg = 'Your session has timed out. Please sign in again.';
              page.logout();
            } else {
              emsg = "unexpected error- "+srs.msg; //should not happen
            }
            page.genError("Error: "+emsg);
            return;
          }
          var br = om.isDev?"/build_resultsd":"/build_results";
          var dst = br+"?source="+itemUrl;//+"&item="+itemPath;
          location.href = dst;
          return;
        }
        var paths = om.unpackUrl(itemUrl);
        //built.__origin__ = itemUrl;
        om.s3Save(built,paths,whenSaved);
      }
      $('#nowBuilding').show();
      //var tm = Date.now();

      om.getScript(itemSource, function (rs) {
        // the getScript (just an ajax get with script datatype) calls success after the code has been grabbed, but
        // it might need a moment to execute. We give it three seconds (flow took 300 millsecs
        //alert(Date.now() - tm);

        setTimeout(function () {
          if (!buildDone) {
            $('#nowBuilding').hide();
            setError("The build failed because there was a JavaScript error. JavaScript debuggers are available in all modern browsers - retry the build with the debugger on, and/or with edits.",1);
          }
        },buildTimeout);
      });
    });
  }
*/


  var onLeave = function (e) {
    var msg = nowSaved?undefined:"There are unsaved modifications.";
     (e || window.event).returnValue = msg;     //Gecko + IE
     return msg; //webkit
  }
  
page.whenReady = function () {
      $('#saving').hide();
    $('#nowBuilding').hide();
    $('#building').hide();
    om.disableBackspace();
   window.addEventListener("beforeunload",onLeave);

  page.genTopbar($('#topbar'),{includeTitle:1});
  
    om.checkSession(function (rs) {
       if (rs.status!="ok") {
          setError("You must be signed in to do a build");
          return;
        }
        var q = om.parseQuerystring();
        dataPath = q.data;
        dataUrl = "http://s3.prototypejungle.org"+dataPath;
        $('#building').show();      
        $('#whichItem').html(dataPath);
        var ck = checkAuth();
        if (typeof ck == "string") {
          page.setError(ck);
          return;
        }
        getData(function (rs) {
          if (rs) {
            itxt = rs;
            setSaved(true);
          } else {
            var itxt = '// The json should have the form {"comment":"Example","value":[1,2,3]} (the value takes whatever form is appropriate)';
            setSaved(false);
            $('#itemkind').html("New item ");
          }
          editor = ace.edit("editor");
          editor.setTheme("ace/theme/TextMate");
          editor.getSession().setMode("ace/mode/javascript");
          editor.setValue(itxt);
          editor.on("change",function (){console.log("change");setSaved(false);$('#error').html('');layout();});
          editor.clearSelection();
          $('#buildButton').click(function () {
            doTheBuild();
          });
          $('#saveButton').click(function () {
            saveData();
          });
          $('#exampleButton').click(function () {
            editor.setValue(exampleText());
            editor.clearSelection();

          });
        });
        layout();
    });
  }
  
  
 


})(prototypeJungle);


    