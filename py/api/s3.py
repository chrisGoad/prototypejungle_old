#!/usr/bin/env python

"""
Handles the api call api/login
http://neochronography.com/topic/image/astoria_1923_0

http://neochronography.com/snap/astoria_1923_0/franklin.jpg

despite its name, this handles editing of snaps too

if the incoming data has a topic field, this is the snap being edited.

"""



from ops.s3  import s3SetContents

from WebClasses import WebResponse,okResponse,failResponse
import constants
import json
import datetime
import os
import misc
import store.models as models

verbose = True
def vprint(*args):
  if verbose:
    misc.printargs(args,"API/S3")
   


def viewToS3(pth):
  fl = open(constants.rootDir+"py/view_template_for_s3")
  vl = fl.read()
  fl.close()
  ctp = "text/html"
  vprint("viewToS3",pth)
  s3SetContents(pth,vl,ctp,True)
 
# store off the count of files created in s3_js_count.date and s3_image_count.date
def toS3(webin):
  cob=json.loads(webin.content())
  cs = models.apiCheckSession(cob)
  if type(cs)==str:
    return failResponse(cs)
  handle = getattr(cs,"handle",None)
  if not handle:
    return failResponse("noHandle")
  pth = cob["path"]
  hs = "/"+handle+"/"
  ln = len(hs)
  if not pth[0:ln] == hs:
    return  failResponse("wrongHandle")  # you can only store to your own tree
  vprint("toS3",pth)
  vl = cob["value"]
  isim = cob["isImage"]
  if isim:
    ctp = "image/jpeg"
  else:
    ctp = "application/javascript"
  kex = s3SetContents(pth,vl,ctp,True)
  if type(kex)==str:
    return failResponse(kex)
  vwf = cob.get("viewFile")
  if vwf:
    viewToS3(vwf)
  
  return okResponse()

  



