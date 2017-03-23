
pj.require(function () {

return pj.lift({"vertices":[{"id":"UL","position":[-50,-50]},{"id":"UR","position":[50,-50]},
                            {"id":"LL","position":[-50,50]},{"id":"LR","position":[50,50]},
                            ],
               "edges":[{"end0":"UL","end1":"UR"},{"end0":"UR","end1":"LR"},
                        {"end0":"LR","end1":"LL"},{"end0":"LL","end1":"UL"},
                        {"end0":"LR","end1":"UL"}]
              });

});


 