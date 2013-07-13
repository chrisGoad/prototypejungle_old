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

verbose = True
def vprint(*args):
  if verbose:
    misc.printargs(args,"API/S3")
   

# store off the count of files created in s3_js_count.date and s3_image_count.date
def toS3(webin):
  cob=json.loads(webin.content())
  pw = cob.get("pw","")
  if pw != constants.password:
    return failResponse("auth failed")
  pth = cob["path"]
  vl = cob["value"]
  isim = cob["isImage"]
  if isim:
    ctp = "image/jpeg"
  else:
    ctp = "application/javascript"
  kex = s3SetContents(pth,vl,ctp)
  countfile = constants.logDir + "/s3_js_count."+str(datetime.date.today())
  fex = os.path.isfile(countfile)
  vprint(countfile,"EXISTS",fex)
  if fex:
    fl = open(countfile,'r')
    cnt = int(fl.read())
    fl.close()
  else:
    cnt = 0
  vprint("current count",cnt)
  fl = open(countfile,'w')
  fl.write(str(cnt+1)+"\n");
  fl.close()
  return okResponse(str(kex))


