ProtoPedia
===============

There is a build process for the site, involving the script 
/admin/assemble.js. It stiches up files in the source areas /js/core, /js/geom/, /js/dom/,  and /js/harness
into combined, minimized, gzipped files such as /js/core-1.1.0.js, /js/core-1.1.0.min.js, and /js/core-1.1.0.min.js.gz

The build process is a very much simplified version of what webpack does. To use it, you need to install some babel npm modules as well. I used these
commands (cd'd to the root of the prototypetrees repo):


npm install --save-dev babel-core

npm install babel-preset-babili --save-dev

Then

node admin/assemble.js &lt;module&gt;

assembles the js for the given module.

For example

node admin/assemble.js core

assembles the source code in js/core into
the  files: www/js/core-1.1.0.js, www/js/core_1.1.0.min.js, and www/js/core_1.1.0.min.js.gz

admin/versions.js contains the version numbers for the modules



