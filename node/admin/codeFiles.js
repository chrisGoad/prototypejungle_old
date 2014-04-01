
/*
Javascript compression
run this on both dev and production after every code modification.
cd pjdn
node admin/minify.js d
or
node admin/minify.js p

*/



exports.commonFiles1 = ["pj.js","util1.js","util2.js","page.js","om1.js","om2.js","instantiate.js",
                    "externalize.js","geom.js","dom1.js","svg.js","html_parser.js","jxon.js","dom2.js","domprotos.js","bubbles.js",
                    "data.js","marks.js","initsvg.js"];
exports.inspectFiles = ["color_picker.js","tree1.js","tree2.js","lightbox.js","inspect1.js","inspect2.js","error.js"];
exports.viewFiles =  ['view.js'];
exports.scratchFiles = ["codemode.js","page.js","scratch.js","error.js"];
exports.pjdFiles = exports.commonFiles1.concat(['codemode.js']);// for standalone use in external code; pjd means "with drawing"
exports.pjcFiles = ["pj.js","util1.js","util2.js","om1.js","om2.js","instantiate.js",
                    "externalize.js"];// for standalone use in external code; pjc means "prototypejungle core"

exports.commonFiles2 = ["pj.js","util1.js","util2.js","om1.js","om2.js","instantiate.js"];

exports.loginoutFiles = ["page.js","login.js","standalone_page.js","error.js"];
exports.chooser2Files = ["dom1.js","html_parser.js","dom2.js","domprotos.js","page.js","chooser2.js"]
exports.view_dataFiles = ["html_parser.js","dom.js","domprotos.js","page.js","view_data.js","error.js"]
exports.minFiles = ["pj.js","util1.js","page.js"];//,"standalone_page.js",]


