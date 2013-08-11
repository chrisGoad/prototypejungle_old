#!/usr/bin/env python

"""
Handles the api call api/login
http://neochronography.com/topic/image/astoria_1923_0

http://neochronography.com/snap/astoria_1923_0/franklin.jpg

despite its name, this handles editing of snaps too

if the incoming data has a topic field, this is the snap being edited.

"""

import time
import subprocess
import urlparse

from WebClasses import WebResponse,okResponse,failResponse
import constants
import os
import json
import  base64
import misc


from ops.s3  import s3SetContents




verbose = True
def vprint(*args):
  if verbose:
    misc.printargs(args,"API/FRAMES")
   

def addFrame(webin):
  " featured images; ie images with featured albums "
  cob=json.loads(webin.content())
  mv = cob["movie"]
  frameNum = cob["frameNum"]
  wjpeg = cob["jpeg"]
  cm = wjpeg.find(",")
  jpeg64 = wjpeg[cm+1:]
  jpeg = base64.b64decode(jpeg64)
  dr  = "/mnt/ebs0/termite/movies/"+mv
  nm = str(frameNum).rjust(4,"0")
  fln = dr + "/" + nm + ".jpg"
  fl = open(fln,"wb")
  fl.write(jpeg)
  fl.close()
  return okResponse(jpeg64[0:50])

# now send to s3
def postCanvas(webin):
  " featured images; ie images with featured albums "
  cob=json.loads(webin.content())
  pth = cob["name"]
  wjpeg = cob["jpeg"]
  cm = wjpeg.find(",")
  jpeg64 = wjpeg[cm+1:]
  jpeg = base64.b64decode(jpeg64)
  vprint("posting canvas image ",pth)
  kex = s3SetContents(pth,jpeg,"image/jpeg",1)
  if type(kex)==str:
    return failResponse(kex)
  return okResponse()
  fln  = "/mnt/ebs0/termite/www/stills/"+nm+".jpg"
  fl = open(fln,"wb")
  fl.write(jpeg)
  fl.close()
  return okResponse(jpeg64[0:50])

  


