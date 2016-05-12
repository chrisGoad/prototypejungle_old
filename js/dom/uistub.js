// so that some ui functions can be included in items that are used in a non-ui context
(function (pj) {
    
// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly
//start extract

// Allows code to include UI operations, but to run in variants of the system lacking the UI (like prototypejungle.org/view)
var ui = pj.set("ui",Object.create(pj.Object));
ui.setNote = function () {}
ui.watch = function () {}
ui.freeze = function (){}
ui.hide = function () {}

//end extract

})(prototypeJungle);