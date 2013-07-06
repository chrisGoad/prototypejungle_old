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
  return okResponse(str(kex))


