#!/usr/bin/env python

import math
import os
import re

def checkName(s):
  p = re.compile('^(_|[a-z]|[A-Z])\w*$');
  return p.match(s)


def printargs(args,title=None):
  if title:
    rs = title+" "
  else:
    rs = ""
  ln = len(args)
  for a in args:
    rs += str(a)+" "
  print rs



def pathLast(s):
  rf = s.rfind("/")
  return s[rf+1:]



      


def removeAttr(x,prop):
  if getattr(x,prop,None) != None:
    delattr(x,prop)


def removeProp(x,prop):
  if x.get(prop,None) != None:
    del x[prop]
        
        
  
  
"""


PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python
execfile("ops/execthis.py")

im = image.loadImageD("/image/5ee275d/big_ambassadors")


ooo = os.listdir(im.imDir()+"/tiling")
du(im.imDir()+"/tiling")
dr = im.imDir()+"/tiling"

os.path.getsize(dr) + du(dr)
misc.du(ooo)
"""
  