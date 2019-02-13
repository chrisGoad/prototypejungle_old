//"title":"The Cayley graph for dihedral group D3",

core.require(function () {

return {"vertices":[{"id":"iL","position":[-87,50]},{"id":"iT","position":[0,-100]},{"id":"iR",
"position":[87,50]},
              {"id":"oL","position":[-173,100]},{"id":"oT","position":[0,-200]},{"id":"oR"
,"position":[173,100]}],
  "edges":[{"label":"a","end0":"iL","end1":"iR"},{"label":"a","end0":"iR","end1":"iT"},
{"label":"a","end0":"iT","end1":"iL"},
           {"label":"a","end0":"oL","end1":"oR"},{"label":"a","end0":"oR","end1":"oT"},
{"label":"a","end0":"oT","end1":"oL"},
           {"label":"b","end0":"oL","end1":"iL"},{"label":"b","end0":"iL","end1":"oL"},
           {"label":"b","end0":"oR","end1":"iR"},{"label":"b","end0":"iR","end1":"oR"},
           {"label":"b","end0":"oT","end1":"iT"},{"label":"b","end0":"iT","end1":"oT"}
           ]        
};


});


 