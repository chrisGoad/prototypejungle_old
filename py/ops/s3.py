#!/usr/bin/env python

"""
http://neochronography.com/topics/astoria_house/736 10th street
http://neochronography.com/topics/image/astoria_panorama_1923
http://neochronography.com/topic/a/b/json

"""




import constants


import urllib2
import boto

import boto.s3

import boto.s3.connection

from boto.s3.key import Key
import os
import time
import misc
import json
import datetime


verbose = True
def vprint(*args):
  if verbose:
    misc.printargs(args,"OPS/S3/PROTOJ")
   

imageBucket = None
webBucket = None

#what = images or <anythng else>

bucketsByName = {}
doCount = True

def s3Init(bucketName="s3.prototypejungle.org"):
  global bucketsByName
  vprint("initializing bucket prototypejungle")
  bk = bucketsByName.get(bucketName,None)
  if bk:
    return bk
  keyId = "04QAHN33GANWY5FNE782"
  secretKey = "44XTcOW90TtVMplQn5WMg4Y0/yFwD341a2UlVcyv";
  
  conn = boto.s3.connection.S3Connection(keyId,secretKey)
  
  bk = conn.create_bucket(bucketName)
  bk.set_acl('public-read')
  
  #bk.set_acl('public-read')
  acl = bk.get_acl()
  bucketsByName[bucketName] = bk
  return bk

#def s3SaveFile(category,user,image,file):
# this saves files relative to the images directory, by default
# images go to the imagediver bucket,  which is cloudfronted
# topics and pages go to s3.imagediver.org.s3-website-us-east-1.amazonaws.com, which is websited

def localDirToBucketName(dir):
  if dir == "images":
    bname = "imagediver"
  else:
    bname = "s3.imagediver.org"
  return bname

  


def s3SetContents(path,contents,contentType=None,replace=False):
  """ if srcFile and contents are None, derive the srcFile from path """
  #path = "/"+category+"/"+user+"/"+image+"/"+file
  #if category=="tilings":
  vprint("PATH",path)
  btp = "js"
  if contentType:
    headers = {'Content-Type': contentType,'x-amz-acl':'public-read'}
    if contentType == "image/jpeg":
      headers['Cache-Control']= 'max-age=31536000, must-revalidate'
      btp = "jpg"
  else:
    headers = {'x-amz-acl':'public-read'}
    btp = "js"
  if doCount:
    dd = datetime.datetime.now()
    dt = str(dd.date())
    hr = dd.hour
    countfile = constants.logDir + "/s3_count."+btp+"."+dt+"."+str(hr)
    fex = os.path.isfile(countfile)
    if fex:
      fl = open(countfile,'r')
      cnt = int(fl.read())
      fl.close()
    else:
      cnt = 0
    vprint("Hourly count",cnt," in file ",countfile)
    if cnt > constants.maxHourlySaves:
      vprint(cnt,"exceeded maxHourlySaves")
      return "busy"
    fl = open(countfile,'w')
    fl.write(str(cnt+1)+"\n");
    fl.close()
  stm = time.time()
  bucket = s3Init()
  rs = len(contents)
  k = Key(bucket)
  k.key = path
  if not replace:
    ex = k.exists()
    vprint(path,"KEY EXISTS",ex)
    if ex: return True
  
  #k.set_contents_from_string("hello helllo") # seems a bug, but this is needed
 
  k.set_contents_from_string(contents,replace=replace,headers=headers)
  etm = time.time() - stm
  vprint("SAVED ",rs," bytes TO S3 ",path," in ",etm)
  return False
   




def s3DeleteKey(path):
  #path = "/"+category+"/"+user+"/"+image+"/"+file
  #if category=="tilings":
  bucket = s3Init()
  k = Key(bucket)
  k.key = path
  k.delete()
  vprint("deleted "+path)
  return rs



def s3DeleteKeys(paths):
  #path = "/"+category+"/"+user+"/"+image+"/"+file
  #if category=="tilings":
  bucket = s3Init()
  keys = []
  for p in paths:
    k = Key(bucket)
    k.key = p
    keys.append(k)
  bucket.delete_keys(keys,quiet=True)
  vprint("deleted "+str(paths))
  return rs



