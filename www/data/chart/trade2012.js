
(function () {
  // euro = 1/0.78 = 1.28 collars during 2012
  var euro = 1.28;
  
 __pj__.loadData((
  {"order":["US","China","Europe","Japan"],
   flows:
    {"US":{magnitude:15000,color:"brown",flows:{"China":1 * 110,"Europe":1 * 265,Japan:1 * 70}},
    "China":{magnitude:7320,color:"orange",flows:{"US":1 * 426,"Europe":euro * 260,Japan:euro * 118}},
    "Europe":{magnitude:euro * 12000,color:"steelblue",flows:{"US":1 * 381,"China":euro * 165,Japan:euro * 55}},
    Japan:{magnitude:5900,color:"red",flows:{Europe:euro * 64,US:1 * 146,China:euro * 139}}
    }
  }));
 
})();   