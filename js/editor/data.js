

/*update the current item from data */

ui.setDataFromExternalSource = function (container,idata,url) {
  var data;
  debugger;
   if (typeof idata === 'string') {
    try {
      data = JSON.parse(idata);
    } catch (e) {
      return e.message;
    }
  } else {
    data = idata;
  }
  var dt = pj.lift(data);
  //dt.__sourceRelto = undefined;
  dt.__sourceUrl = url;
  dt.__requireDepth = 1; // so that it gets counted as a require on externalize
  container.__idata = undefined;
  try {
    container.__setData(dt);
  } catch (e) {
  
    debugger;
    if (e.kind === dat.badDataErrorKind) {
      return e.message;
    }
    return;
  }
}


ui.updateFromData =function (idata,url) {
  debugger;
  var data;
  var ds = dat.selectedDataSource();
  if (!ds) {
    return;
  }
  var container = ds[0];
  var err = ui.setDataFromExternalSource(container,idata,url);
  if (err) {
    ui.dataError.$html(e.message);
  } else {
    svg.main.updateAndDraw();
    pj.tree.refreshValues();
  }
}
/*
  if (typeof idata === 'string') {
    try {
      data = JSON.parse(idata);
    } catch (e) {
      debugger;
      ui.dataError.$html(e.message);
      return;
    }
  } else {
    data = idata;
  }
  ui.dataError.$html('');
  var dt = pj.lift(data);
  //dt.__sourceRelto = undefined;
  dt.__sourceUrl = url;
  dt.__requireDepth = 1; // so that it gets counted as a require on externalize
  dataContainer.__idata = undefined;
  try {
    dataContainer.__setData(dt);
  } catch (e) {
    debugger;
    if (e.kind === dat.badDataErrorKind) {
      ui.dataError.$html(e.message);
    }
    return;
  }
  svg.main.updateAndDraw();
  pj.tree.refreshValues();
}
*/
var htmlEscape = function (str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

var  delims = {',':1,':':1,'<':1,'>':1,';':1,' ':1,'\n':1};

var lastStringSplit = undefined;
var lastSplit = undefined;

var splitAtDelims = function (str,forPath) {
  if (forPath) {
    var isplit = str.split('/');
    var split = [];
    var ln = isplit.length;
    for (var i=0;i<ln;i++) {
      split.push(isplit[i]);
      if (i < ln-1) {
        split.push('/');
      }
    }
    return split;
  }
  if (lastStringSplit === str) {
    return lastSplit;
  }
  var ln = str.length;
  var rs = [];
  var word = '';
  for (var i=0;i<ln;i++) {
    var c = str[i];
    if (delims[c]) {
      rs.push(word);
      word = '';
      rs.push(c);
    } else if (c !== '\r') {
      word += c;
    }
  }
  if (word) {
    rs.push(word);
  }
  lastStringSplit = str;
  lastSplit = rs;
  return rs;
}
var wordWrap = function (str,maxLength,forPath) {
  var split = splitAtDelims(str,forPath);
  debugger;
  var rs = '';
  var currentLength = 0;
  split.forEach(function (word) {
    if (word) {
      if (word === '\n') {
        if (rs[rs.length-1] != '\n') {
          rs += word;
        }
        currentLength = 0;
        return;
      }
      var wln = word.length;
      if (wln + currentLength > maxLength) {
        rs += '\n';
        currentLength = wln;
      } else {
        currentLength += wln;
      }
      rs += word;
    }
  });
  return rs;
}





ui.viewData  = function (idata) {
  var dataString;
  var isString = typeof idata === 'string';
  if (isString) {
    ui.dataString = idata;
    dataString = idata;
  } else if (idata === undefined) {
    dataString = ui.dataString;
  }
  isString = typeof dataString === 'string';
  if (ui.panelMode !== 'data') {
    ui.panelMode = 'data';
    ui.layout();
  }
  debugger;
  ui.dataDivContainsData = true;
  if (!isString) {
    ui.dataDiv.$html('');
    return;
  }
  var wwd  = uiWidth;
  debugger;
  var maxLength = Math.floor((wwd/622)*84);
  var htmlString = '<pre>'+htmlEscape(wordWrap(dataString,maxLength))+'</pre>';
  ui.dataDiv.$html(htmlString);
  ui.viewDataUrl();
}

var dataUrl;

ui.viewDataUrl = function () {
  var wwd  = uiWidth;
  var maxLength = Math.floor((wwd/622)*84);
  var wrapped = wordWrap(dataUrl,maxLength,true);
  ui.dataMsg.$html(wrapped);
}

ui.viewAndUpdateFromData =  function (data,url) {
  ui.viewData(data);
  ui.clearError();
  if (!pj.throwOnError) {
    ui.updateFromData(data,url);
    ui.updateTitleAndLegend();
  } else {
    try {
      ui.updateFromData(data,url);
      ui.updateTitleAndLegend();
    } catch (e) {
      ui.handleError(e);
    }
  }
}

ui.getDataJSONP = function (url,cb) {
  debugger;
  pj.returnData = function (data) {
         cb(undefined,data);
  }
    /*
      if (dontUpdate) {
         ui.viewData(data,url);
        if (cb) {
          cb();
        }
      } else {
        ui.viewAndUpdateFromData(data,initialUrl,cb);
      }
    }
    */
  pj.loadScript(url);
}
/*
ui.getDataJSON = function (url,cb) {
  debugger;
  //var storageUrl = pj.storageUrl(url);
  pj.httpGet(url,db);function (erm,rs) {
    cb(rs);
    if (dontUpdate) {
       ui.viewData(rs);
      if (cb) {
        cb();
      }
    } else {
      ui.viewAndUpdateFromData(rs,initialUrl,cb);
    }
  });
}
*/
ui.getData = function (url,cb) {
  debugger;
  var storageUrl = pj.storageUrl(url);
  var ext = pj.afterLastChar(url,'.');
  if (ext === 'json') {
    pj.httpGet(storageUrl,cb);
  } else if (ext === 'js') {
    ui.getDataJSON(storageUrl,cb);
  }
}
