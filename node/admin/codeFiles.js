
/*
Javascript compression
run this on both dev and production after every code modification.
cd pjdn
node admin/minify.js d
or
node admin/minify.js p

*/


exports.commonFiles1 = ["pj.js","util1.js","util2.js","om1.js","om2.js","instantiate.js",
                    "externalize.js","html_parser.js","dom.js","domprotos.js","geom.js","bubbles.js",
                    "data.js","marks.js","draw.js","canvas.js","initcanvas.js","shapes.js"];
exports.inspectFiles = ["color_picker.js","tree1.js","tree2.js","lightbox.js","inspect.js","error.js","page.js"];
exports.viewFiles =  ['view.js'];
exports.scratchFiles = ["codemode.js","page.js","scratch.js","error.js"];
exports.pjdFiles = exports.commonFiles1.concat(['codemode.js']);// for standalone use in external code; pjd means "with drawing"
exports.pjcFiles = ["pj.js","util1.js","util2.js","om1.js","om2.js","instantiate.js",
                    "externalize.js"];// for standalone use in external code; pjc means "prototypejungle core"


exports.commonFiles2 = ["pj.js","util1.js","util2.js","om1.js","om2.js","instantiate.js"];
exports.loginoutFiles = ["login.js","page.js","standalone_page.js","error.js"];
exports.chooser2Files = ["html_parser.js","dom.js","domprotos.js","chooser2.js"]
exports.view_dataFiles = ["html_parser.js","dom.js","domprotos.js","page.js","view_data.js","error.js"]
exports.minFiles = ["pj.js","util1.js","page.js","standalone_page.js",]


