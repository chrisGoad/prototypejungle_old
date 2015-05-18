 
(function (pj) {
  var dat = pj.dat;

// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly

//start extract


// installData1 looks for nodes with dataSource in the tree. If it's an assembly, for each part it finds,
// it loads data from that souce, and stashes it in part.__xdata, then it internalizes the data
// into part.data


dat.installData = function (item,cb) {
  var dataSources,dsPaths,isAssembly;

  var whenDoneInstallingData = function () {
    if (cb) {
      cb(undefined,item);
    }
  }
  var installError = undefined;

/*  
 * For assemblies, data for the parts needs installing. 
 */
 
  var collectDSPaths = function (node,path) {
    
    pj.forEachTreeProperty(node,function (child,prop) {
      if (child.__isPart) {
        var ds = child.dataSource;
        if  (ds) {
          path.push(prop);
          dataSources.push(ds);
          dsPaths.push(path.slice());
          path.pop();
        }
      } else {
        var crs = collectDSPaths(child);
        
      }
    });      
  }
  isAssembly = item.__isAssembly;
  if (isAssembly) {
    dsPaths = [];
    dataSources = [];
    collectDSPaths(item,[]);
  } else {
    var mds = item.dataSource;
    if (mds) {
      dsPaths = [[]];
      dataSources = [mds];
    } else {
      dataSources = [];
    }
  } 
 
  var installDataIndex = 0;// index into itemsToLoad of the current install data job
  var installMoreData = function (err) {
    var ln = dataSources.length;
    if (installDataIndex<ln) {
      var datasource = dataSources[installDataIndex];
      pj.log('install','Installing '+datasource);
      pj.loadScript(datasource,function (err,loadEvent) {
        if (err) {
          console.log("DATA LOAD ERROR FOR ",dataSource);
        }
      });// this will invoke window.dataCallback when done
    } else { 
    // ok, all done  
      whenDoneInstallingData();
    }
  }
  if (isAssembly) {
    if (dsPaths.length) {
      var path = dsPaths[installDataIndex];
      var target = pj.evalPath(item,path);
    }
  } else {
    target =item;
  }
  window.callback = window.dataCallback = function (data) {    
    target.__xdata = data; 
    var dk = target.markType;
    // need to put catch here 
    target.set("data", dat.internalizeData(data,dk?dk:'[N|S],N'));
    installDataIndex++;
    installMoreData();
  }
  installDataIndex = 0;
  installMoreData();
}

// here is a simpler function: just loads the data, without installation

var dataHasBeenLoaded;

pj.loadData = function (url,cb) {
  dataHasBeenLoaded = 0;
  window.callback = window.dataCallback = function (rs) {
    //item.__xdata = rs;
    dataHasBeenLoaded = 1;
    cb(null,rs);
  }     
  //pj.loadScript(url,cb);// this will invoke window.dataCallback when done. cb is for errors only 
  pj.loadScript(url,function (err,rs) {  // the callback is called by the onLoad or onError handlers 
    if (err && cb) {
      cb(err,rs);  
    } 
  });
}

//end extract


})(prototypeJungle);


