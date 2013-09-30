
    
(function (__pj__){
 
  var om = __pj__.om;
  var draw = __pj__.draw;
  var page = __pj__.page
 

var cb;
var editor;
var dataPath;
var buildTimeout = 3000;// does not  include load time, just the computation of the bnuild itself
var buildDone;
var owner = false;

  page.elementsToHideOnError = [];


  function layout() {
   
    var awinwid = $(window).width();
    var awinht = $(window).height();
    var topht = 50;// $('#topbarOuter').height();
    var eht = awinht - 50 - topht;
    console.log(topht);
    $('#editor').css({height:eht+"px",top:(topht+60)+"px"});
    $('#note').css({top:(topht+30)+"px"});

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
  owner = spl[0] == h;
 
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
    debugger;
  if (v == nowSaved) {
    return;
  }
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
  if (v) {
    window.removeEventListener("beforeunload",onLeave);
  } else {
    window.addEventListener("beforeunload",onLeave);
 }
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
   // $('#note').hide();
    om.ajaxPost("/api/saveData",dt,function (rs) {
       $('#saving').hide();
      // $('#note').show();
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
  }


  var onLeave = function (e) {
    var msg = nowSaved?undefined:"There are unsaved modifications.";
     (e || window.event).returnValue = msg;     //Gecko + IE
     return msg; //webkit
  }

function initPage() {
    getData(function (rs) {
        if (rs) {
          itxt = rs;
          setSaved(true);
        } else {
          var itxt = '';
          // The json should have the form {"comment":"Example","value":[1,2,3]} (the value takes whatever form is appropriate)';
          if (owner) {
            setSaved(false);
            $('#itemkind').html("New item ");
          } else {
            $('#itemkind').html("No data");
          }

        }
        editor = ace.edit("editor");
        editor.setTheme("ace/theme/TextMate");
        editor.getSession().setMode("ace/mode/javascript");
        editor.setValue(itxt);
        editor.on("change",function (){console.log("change");setSaved(false);$('#error').html('');layout();});
        editor.clearSelection();
        if (owner) {
          $('#saveButton').click(function () {
            saveData();
          });
        } else {
           $('#saveButton').hide();
        }

      });
    layout();

}

    
page.whenReady = function () {
      $('#saving').hide();
    om.disableBackspace();
    //window.addEventListener("beforeunload",onLeave);
    var q = om.parseQuerystring();
    dataPath = q.data;
    dataUrl = "http://s3.prototypejungle.org"+dataPath;
   var ck = checkAuth();
    if (typeof ck == "string") {
      $('#error').html(ck);
      return;
    }
    page.genTopbar($('#topbar'),{includeTitle:1});
  
    om.checkSession(function (rs) {
       if (rs.status!="ok") {
          owner = false;
        }
        $('#whichItem').html(dataPath);
        initPage();
        return;
    });
  }
  
  
 


})(prototypeJungle);


    