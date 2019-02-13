
core.require('/timeline/onAxisSupport.js','/axes/axis.js','/timeline/rectangleWithImageEvent.js',
           '/timeline/lineWithImageInterval.js',function (axisSup,axisP,eventPP,intervalPP) {
var item = svg.Element.mk('<g/>');
item.set('contents',svg.Element.mk('<g/>'));// children are autonamed c0  ... c<lastIndex>
item.isKit = true;
var axis =  item.set('axis',axisP.instantiate());
let eventP = core.installPrototype('event',eventPP)
let intervalP = core.installPrototype('interval',intervalPP)
axis.coverageLB = 1580;
axis.coverageUB = 1820;
axis.width = 1000;
axis.update();

//let pointP = ui.installPrototype('axisPoint',pointPP);
//item.set('p0',pointP.instantiate()).__show();
//item.p0.dataX = 1750;
//item.p0.moveto(geom.Point.mk(0,-150));


item.dragStep = function (x,pos) { // pos in global coordinates
  if (core.hasSource(x,'/timeline/event.js')||
      core.hasSource(x,'/timeline/interval.js') ||
      core.hasSource(x,'/timeline/shortInterval.js')) {
    let localPos =  this.toLocalCoords(pos); 
    x.moveto(localPos);
    x.update();
  }
}


item.setEventTime = function (diagram,event,value) {
  let time = Number(value);
  if (!isNaN(time)) {
    event.dataX = time;
    //axisSup.adjustRelAxis(linePoint);
    event.dragVertically = true;
    event.update();
    event.draw();
  
  }
}

item.getEventTime = function (event) {
  let dataX = event.dataX;
  if (Number(dataX)) {
    return dataX;
  } else {
    return 'undefined';
  }
}



item.getIntervalTimes = function (interval) {
  let dataXlb = interval.dataXlb;
  let dataXub = interval.dataXub;
 if (Number(dataXlb) && Number(dataXub)) {
    return dataXlb + "-"+dataXub;
  } else {
    return 'undefined';
  }
}



item.setStartTime = function (diagram,interval,value) {
  var sp = value.split('-');
  if (sp.length === 2) {
    let stime= Number(sp[0]);
    let etime = Number(sp[1]);
    if (!(isNaN(stime) || isNaN(etime))) {
      interval.dataXlb = stime;
      interval.dataXub = etime;
     
    }
  }
}

item.setIntervalTimes = function (diagram,interval,value) {
  var sp = value.split('-');
  if (sp.length === 2) {
    let stime= Number(sp[0]);
    let etime = Number(sp[1]);
    if (!(isNaN(stime) || isNaN(etime))) {
      interval.dataXlb = stime;
      interval.dataXub = etime;
      interval.dragVertically = true;
      interval.update();
      interval.draw();
    }
  }
}


item.getAxisTimeRange = function (diagram,ignored) {
  return 'foob';
}
item.setAxisTimeRange = function (diagram,ignored,value) {
  
}

let axisAction =  {title:'Axis Time Range',type:'numericInput',action:'setAxisTimeRange',value:'getAxisTimeRange'};
item.actions = function (item) {
  if (item.role === 'event') {
    return [{title:'Event time',type:'numericInput',action:'setEventTime',value:'getEventTime'},axisAction];
  }
  if (item.role === 'interval') {
    return [{title:'Interval Time Range',type:'numericInput',action:'setIntervalTimes',value:'getIntervalTimes'},axisAction];
  }  else {
    return [axisAction];
  }
}

item.update = function () {
  core.updateParts(this);
}

item.buildFromData = function () {
  let data = this.data;
  if (!this.data) {
    return;
  }
  let thisHere = this;
  let events = data.events;
  if (events) {
    events.forEach(function (datum) {
      let id = datum.id;
      let event =  thisHere[id];
      if (!event) {
        event = eventP.instantiate().show();
        thisHere.set(id,event);
      }
      event.dataX = datum.time;
      let imUrl = datum.imageUrl;
      if (imUrl) {
        ui.setImageOf(event.box,imUrl);
       // ui.afterImageUrl(imUrl,function (erm,proto) {
       //   let im = proto.instantiate();
       //   event.set('image',im);
       // });
      }
       if (datum.text) {
        event.text = datum.text;
      }
    });
  }
  let intervals = data.intervals;
  if (intervals) {
    intervals.forEach(function (datum) {
      let id = datum.id;
      let interval =  thisHere[id];
      if (!interval) {
        interval = intervalP.instantiate().show();
        thisHere.set(id,interval);
      }
      interval.dataXlb = datum.startTime;
      interval.dataXub = datum.endTime;
      let imUrl = datum.imageUrl;
      if (imUrl) {
        ui.setImageOf(interval.box,imUrl);
       // ui.afterImageUrl(imUrl,function (erm,proto) {
       //   let im = proto.instantiate();
       //   event.set('image',im);
       // });
      }
      if (datum.text) {
        interval.text = datum.text;
      }
    });
  }
  
  this.update();
}

item.insertUnder = function (proto) {
  let roles = proto.getRoles();
  if ((roles.indexOf('interval') > -1) || (roles.indexOf('event') > -1)) {
    return this;
  } else {
    return core.root;
  }
}


return item;

});