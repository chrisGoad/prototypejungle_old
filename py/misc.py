#!/usr/bin/env python

import math
import os

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


def nDigitsPrecision(x,n):
  ax = abs(x)
  n10 = math.pow(10,n);
  xsh = ax * n10;
  xf = int(ax);
  ad = int(xsh-xf * n10);
  if x < 0:
    mn = "-"
  else:
    mn = ""
  return mn + str(xf) + "." + str(ad);



def bytesstring(num,pixels=False):
  n = float(num)
  oneMeg = 1000000
  oneGig = 1000000000
  if n < 1000:
    ns = str(int(n))
    if pixels:return ns + " pixels"
    else: return ns + " bytes"
  if n < oneMeg:
    ns =  nDigitsPrecision(n/1000,1)
    if pixels:return ns + "K pixels"
    else: return ns +" KB";
  if n < oneGig:
    ns =  nDigitsPrecision(n/oneMeg,1)
    if pixels: return ns + " megapixels"
    else: return ns +" MB";
  ns = nDigitsPrecision(n/oneGig,1)
  if pixels: return ns + " gigapixels"
  else: return ns + " GB";
  
""" this is a little different from du in that it does not include the directory size; this is what's wanted for s3 """
def du(dir):
  files = os.listdir(dir)
  rs = 0
  for fl in files:
    csz = os.path.getsize(dir+"/"+fl)
    rs += csz
  return rs


def scalePointDict(p,s):
  return {"x":s * p["x"],"y":s * p["y"]}
  
def scaleRectDict(d,s):
  crn = d["corner"]
  xt = d["extent"]
  return  {"corner":scalePointDict(crn,s),"extent":scalePointDict(xt,s)}


def reduceDigits(x):   # for snaps json
  n = 8 
  p = math.pow(10,n)
  ip = math.floor(x*p+0.5)
  return ip/p

def reduceRectDigits(cv):
  crn = cv["corner"]
  ext = cv["extent"]
  return {"corner":{"x":reduceDigits(crn["x"]),"y":reduceDigits(crn["y"])},"extent":{"x":reduceDigits(ext["x"]),"y":reduceDigits(ext["y"])}}
      
      
def albumTopicToImageTopic(tp):
  sp = tp.split("/")
  rs = "/image/"+"/".join(sp[2:4])
  return rs



def setDictProps(dst,src,props,default=None):
  if dst!=None:
    rs = dst
  else:
    rs = {}
  for p in props:
    v = src.get(p,default)
    if v == None: continue
    rs[p] = v
  return rs

def setDictPropsFromObject(dst,src,props,default=None):
  return setDictProps(dst,src.__dict__,props,default)
  
def removeAttr(x,prop):
  if getattr(x,prop,None) != None:
    delattr(x,prop)


def removeProp(x,prop):
  if x.get(prop,None) != None:
    del x[prop]
        
        
class topicOb():
  def __init__(self,topic):
    sp = topic.split("/")
    ln = len(sp)
    self.kind = sp[1]
    self.imageOwner = sp[2]
    self.imageName = sp[3]
    if (ln >4): self.albumId = sp[4]
    if (ln > 5): self.snapId = sp[5]; 

  
  def topic(self):
    knd = self.kind
    rs = "/"+self.kind+"/"+self.imageOwner+"/"+self.imageName
    if (knd == "album") or (knd == "snap"):
      rs += "/"+self.albumId
    if knd == "snap":
      rs += "/"+self.snapId
    return rs;
  
  def imageTopic(self):
    knd = self.kind
    self.kind = "image"
    rs = self.topic()
    self.knd = knd;
    return rs
    
  
  
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
  