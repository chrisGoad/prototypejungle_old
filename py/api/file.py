#!/usr/bin/env python


import time
import subprocess
import urlparse

from WebClasses import WebResponse,okResponse,failResponse
import constants
import os
import json
import  base64


def storeFile(path,vl):
  print "storing ",path
  sd = constants.storageDir
  if path[0] == "/":
    path = path[1:]
  ps = path.split("/")
  nm = ps[-1]
  dr = ps[0:-1]
  cp = sd
  print ps
  print dr
  for d in dr:
    cp += "/" + d
    print "FF ",cp
    if not os.path.exists(cp): os.mkdir(cp)
  fln = cp + "/" + nm
  fl = open(fln,'w')
  fl.write(vl)
  fl.close()


  

def retrieveFile(path):
  sd = constants.storageDir
  if path[0] == "/":
    path = path[1:]
  fln = sd + "/" + path
  if not os.path.exists(fln):
    return False
  fl = open(fln,'r')
  rs = fl.read()
  fl.close()
  return rs

def putFile(webin):
  cob=json.loads(webin.content())
  pw = cob.get("pw","")
  if pw != constants.password:
    return failResponse("auth failed")
  pth = cob["path"]
  vl = cob["value"]
  storeFile(pth,vl)
  return okResponse()



def getFile(webin):
  cob=json.loads(webin.content())
  pth = cob["path"]
  rs = retrieveFile(pth)
  if type(rs)==str:
    return okResponse(rs)
  return failResponse()


def walkDirectory(webin):
  cob=json.loads(webin.content())
  pth = cob["path"]
  pw = cob.get("pw","")
  if pw != constants.password:
    return failResponse("auth failed")
  sd = constants.storageDir
  fp = sd + pth
  
  
  try:
    #ld = os.listdir(fp)
    ld = os.walk(fp)
  except Exception:
    return failResponse("missing")
  rs  = []
  for i in ld:
    rs.append(i)
  return okResponse(rs)

"""



PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/termite/py"
export PYTHONPATH
cd /mnt/ebs0/termite/py

python

import api.file

api.file.storeFile("/aa/b/c","foobbb")


"""
