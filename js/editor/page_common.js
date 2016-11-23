  
  
 
var disableGray = "#aaaaaa";

var enableButton1 =function (bt,vl) {
  bt.disabled = !vl;
  bt.$css({color:vl?"black":disableGray});
}

ui.enableButton = function (bt) {
  enableButton1(bt,true);
}

ui.disableButton = function (bt) {
  enableButton1(bt,false);
}

var setClickFunction = function (bt,fn) {
  bt.$click(function () {
    if (!bt.disabled) {
      fn();
    }
  });
}
 