#!/usr/bin/env python

"""
To run this script:

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/prototypejungledev/py"
export PYTHONPATH
cd /mnt/ebs0/prototypejungledev/py

python admin/jsToS3.py
"""

import ops.s3
ops.s3.doCount = False

jsdir = "/mnt/ebs0/prototypejungledev/www/js/"
def jsToS3(jsf):
  fpth = jsdir+jsf
  fl = open(fpth)
  vl = fl.read()
  fl.close()
  ctp = "application/javascript"
  pth = "/js/"+jsf
  print "jsToS3",fpth,pth
  ops.s3.s3SetContents(pth,vl,ctp,replace=True)
 
 
files = ["draw.js","error.js","externalize.js","geom.js",
         "instantiate.js","jqprotos.js","jquery.js","lightbox.js",
         "om.js","page.js","shapes.js","util.js","view.js"]

for f in files:
  jsToS3(f)
 

