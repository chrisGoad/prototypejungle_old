
core.require('/timeline/timeline.js','/timeline/timeline.data',function (timelineP,data) {
let timeline = timelineP.instantiate();
timeline.initialize = function () {
  this.show();
  this.buildFromData(data);
}

return timeline;
});


 