/* code supporting the insert panels, such as shapes.html.  Standalone code */
var inserts;//  = ['rectangle'];
var initial_insert;
var category; // 'shape' or 'chart'
var assembly;
var selectedForInsert;
var disabledInserts;
var rows = [];
var topRow = 50;
var leftColumn = 10;
var rowGap = 10;
var columnGap = 20;

var arrangeRow = function (yp,row) {
  var xp = leftColumn;
  var maxHeight = 0;
  console.log('yp',yp);
  row.forEach(function (id) {
	var el = document.getElementById(id);
	var wd = el.clientWidth;
	var ht = el.clientHeight;
	console.log('height',id,ht);
	el.style.left = xp+"px";
	if (id === 'Textt') {
	  console.log("TEEX");
	  el.style.top = 230;
	} else {
	  el.style.top = yp+"px";
	}
	xp += wd+columnGap;
	maxHeight = Math.max(maxHeight,ht);
	debugger;
  });
  console.log('maxHeight',maxHeight);
  return maxHeight;
}

var arrangeRows = function () {
  debugger;
  var yp = topRow;
  rows.forEach(function (row) {
	var maxHeight = arrangeRow(yp,row);
	yp += rowGap + maxHeight;
  })
}
var setBorderVis = function (id,vis) {
  var border = document.getElementById(id+"Border");
  if (border) {
	border.style.display = vis?'block':'none';
  }
}
var hideBorders = function () {
  var id;
  for (id in inserts) {
	setBorderVis(id,0);
  }
}

var selectChartType = function (id) {
   var name = autoname(assembly,id);
  textInput.value = name;
  selectedForInsert = id;
  hideBorders();
  setBorderVis(id,1);
}
var insertListener = function () {
  var id = this.id;
  if (disabledInserts[id]) {
    return;
  }
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
var replacing = 0; 
var disableInserts = function () {
  var ins;
  for (ins in inserts) {
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
  }
}
var whenReady =  function(){
  var id;
  disabledInserts = parent.pj.ui.insertsDisabled();
  disableInserts();
  //hideBorders();
  var hr = location.href;
  var replace = hr.indexOf("?replace=1")>0;
  if (replace) {
    replacing = 1;
  }
  assembly  = parent.pj.ui.describeAssembly();

  //var rect = document.getElementById('rectangle');
  textInput = document.getElementById('where');
  var insertButton =  document.getElementById('insert');
  debugger;
  for (id in inserts) {
  //inserts.forEach(function (id) {
    addInsertListener(id);
  }
 
  insertButton.addEventListener('click',function () { 
    if (replacing) {
      parent.pj.ui.replaceItem(selectedForInsert);
    } else {
      parent.pj.ui.insertItem(textInput.value,inserts[selectedForInsert]);
    }
  });
  //arrangeRow(50,rows[0]);
  arrangeRows();
  selectChartType(initial_insert);

}
