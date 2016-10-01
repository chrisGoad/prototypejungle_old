OBSOLETE
/* code supporting the insert panels, such as shapes.html.  Standalone code */
var inserts;//  = ['rectangle'];
var category; // 'shape' or 'chart'
var assembly;
var selectedForInsert;
var disabledInserts;

var setBorderVis = function (id,vis) {
  var border = document.getElementById(id+"Border");
  border.style.display = vis?'block':'none';
}
var hideBorders = function () {
  inserts.forEach(function (id) {
	setBorderVis(id,0);
  });
}

var selectChartType = function (id) {
   //var name = autoname(assembly,id);
  textInput.value = id;
  selectedForInsert = id;
  hideBorders();
  setBorderVis(id,true);
  window.parent.postMessage(JSON.stringify({opId:'insertChart',value:{id:id}}),'*')
  debugger;
}
var insertListener = function () {
  var id = this.id;
  //if (disabledInserts[id]) {
  //  return;
  //}
  debugger;
  selectChartType(id);
}

var addInsertListener = function (name) {
  var element = document.getElementById(name);
  if (element) {
    element.addEventListener('click',insertListener);
  }
}

var autoname = function (avoid,nm) {
    var maxnum = -1;
    if (!avoid[nm]) {
      return nm;
    }
    var nmlength = nm.length;
    for (anm in avoid) {
      if (anm === nm) {
	continue;
      }
      var idx = anm.indexOf(nm);
      if (idx === 0) {
	var rst = anm.substr(nmlength);
	if (!isNaN(rst)) {
	  var rint = parseInt(rst);
	  maxnum = Math.max(maxnum,parseInt(rst));
	}
      }
    }
    var num = (maxnum === -1)?1:maxnum+1;
    return nm + num;
  }
var textInput; 
var replacing = false; 
var disableInserts = function () {
  inserts.forEach(function (ins) {
    var border = document.getElementById(ins+"Border");
    if (border) { 
      border.style.display = "none";
    }
    if (disabledInserts[ins]) {
      var label = document.getElementById(ins+"Label");
      if (label) {
	       label.style.fill = "grey";
      }

    } 
  });
}
var whenReady =  function(){
  //disabledInserts = parent.pj.ui.insertsDisabled();
  //disableInserts();
  //hideBorders();
  var hr = location.href;
  var replace = hr.indexOf("?replace=1")>0;
  if (replace) {
    replacing = 1;
  }
  //assembly  = parent.pj.ui.describeAssembly();

  //var rect = document.getElementById('rectangle');
  textInput = document.getElementById('where');
  var insertButton =  document.getElementById('insert');
  inserts.forEach(function (id) {
    addInsertListener(id);
  });
 
  insertButton.addEventListener('click',function () {
    if (replacing) {
      parent.pj.ui.replaceItem(selectedForInsert);
    } else {
      parent.pj.ui.insertItem(category,textInput.value,selectedForInsert);
    }
  });
  selectChartType('Bar');

}