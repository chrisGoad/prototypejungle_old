(function () {
  var inner = 100;
  var  outer = 200;
  var factor = Math.cos(Math.PI/6);
  var innerF = factor*inner;
  var innerH = 0.5 * inner;
  var outerF = factor * outer;
  var outerH = 0.5 * outer;
  var rs =
{
  "title":"Density in grams per cubic centimeter",
  "vertices":[{id:'iL',position:[-innerF,innerH]},{id:'iT',position:[0,-inner]},{id:'iR',position:[innerF,innerH]},
              {id:'oL',position:[-outerF,outerH]},{id:'oT',position:[0,-outer]},{id:'oR',position:[outerF,outerH]}],
  "edges":[{label:'a',end0:'iL',end1:'iR'},{label:'a',end0:'iR',end1:'iT'},{label:'a',end0:'iT',end1:'iL'},
           {label:'a',end0:'oL',end1:'oR'},{label:'a',end0:'oR',end1:'oT'},{label:'a',end0:'oT',end1:'oL'},
           {label:'b',end0:'oL',end1:'iL'},{label:'b',end0:'iL',end1:'oL'},
           {label:'b',end0:'oR',end1:'iR'},{label:'b',end0:'iR',end1:'oR'},
           {label:'b',end0:'oT',end1:'iT'},{label:'b',end0:'iT',end1:'oT'},
           ]
           
};

pj.returnData(rs);
})();
 
 

