
/*
Generate eg geom.html from geom.js; pre's labeled by function paths for reference from docs
run this on both dev and production after every code modification.
cd pjdn
node debug admin/gendocs.js d
or
node admin/gendocs.js p

*/
var esprima = require('esprima');
var fs = require('fs');

/*
 */
// return the "a.b.c" if the expression is a.b.c

var a0 = process.argv[2];

if (a0 === "p") {
  var pjdir = "/mnt/ebs0/prototypejungle/www/";
} else if (a0 ==="d") {
  var pjdir = "/mnt/ebs0/prototypejungledev/www/";
} else {
  console.log("Usage: 'node minify.js p' or 'node minify.js d', for the production or dev environtments, respectively")
}

function memberEx(x) {
  if (x.type=="Identifier") {
    return x.name;
  }
  if (x.type=="MemberExpression") {
    var o = memberEx(x.object);
    if (!o) return;
    return o + "."+x.property.name;
  }
}

function leftMemberEx(x) {
  if (x.type == "ExpressionStatement") {
    var ex = x.expression;
    if  (ex.type == "AssignmentExpression")  {
      if (ex.right.type == "FunctionExpression") {
        return memberEx(ex.left);
      }
    }
  }
}

var cd,prs,defs,memx,ee;

function loadCode(fln) {
  var ffn = pjdir + "/js/"+fln+".js";
  return fs.readFileSync(ffn).toString();
}
function parseCode(cd) {
  var rs = [];

  prs = esprima.parse(cd,{loc:true});
  // we assume that the form of the code is (function (pj) { all the defs })(pj) ; this extracts the defs
  defs= prs.body[0].expression.callee.body.body;
  defs.forEach(function (e) {
    memx = leftMemberEx(e);
    if (memx) {
      var st = e.loc.start.line;
      //console.log(st,memx);
      rs.push({x:memx,line:st});
    }
      
  });
  return rs;
}


var preamble =
'<!DOCTYPE html>\n\
<html>\n\
<head>\n\
<meta charset="UTF-8">\n\
<title>Prototype Jungle Code</title>\n\
</head>\n\
<body style="margin:40px">\n\
';
var postscript =
'</body>\n\
</html>\n\
';
function htmlEscape(s) {
  var s1 = s.replace(/\</g,"&lt;");
  var s2 = s1.replace(/\>/g,"&gt;");
  return s2;
}
function processCode(fln) {
  console.log("Generating HTML for ",fln);
  var cd = loadCode(fln);
  var fns = parseCode(cd);
  var lns = cd.split('\n');
  var spl = [];
  cl = 0;
  var sgs = [];
  function concatLines(st,fn) {
    var rs="";
    for (var i=st;i<fn;i++) {
      rs += lns[i];
    }
    return rs;
    //code
  }
  var ln = fns.length;
  var lnl = lns.length;
  function segtxt(memx,txt) {
    return '<pre id="'+memx+'">'+htmlEscape(txt)+'\n</pre>';
  }
  var frs = preamble;
  var lb = 0;
  var ub = fns[0].line-2;
  if (ub > lb) {
    frs += "<pre>\n";
    frs += htmlEscape(concatLines(0,ub));
    frs += '\n</pre>\n';
  }
  
  for (var i=0;i<ln;i++) {
    var lb = fns[i].line-1;
    var ub = ((i==ln-1)?lnl:fns[i+1].line)-1;
    var sg = segtxt(fns[i].x,concatLines(lb,ub));
    frs += sg;
   
    //code
  }
  frs += postscript;
  fs.writeFileSync(pjdir + "/js/"+fln+".html",frs,{flag:'w'});
  console.log("DONE WITH ",fln);
}

var files = ['om1','om2','geom','shapes'];
files.forEach(processCode);
