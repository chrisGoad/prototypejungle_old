#!/usr/bin/env python

import json
import misc


verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args,"WebClasses")
  

# the pageStore is a dictionary that contains data for a particular page generation process (avoiding the sharing among apache threads that is the python module rule)

class WebInput:
  def __init__(self,path,queryString,contentStream,session,contentLength=None):
    self.path=path
    vprint("WebInput",path,queryString)
    self.queryString=queryString
    self.contentStream = contentStream
    self.session=session
    self.contentLength = contentLength
    self.pageStore = {"iam":"pageStore"}
    
  def content(self):
    istr = self.contentStream
    if istr==None: return
    return istr.read(self.contentLength)
  
  def checkSession(self):
    sess = self.session
    if not sess:
      return "noSession"
    if sess.timed_out:
      return "sessionTimedOut"
    if sess.active == 0:
      return "sessionInactive"
    return None


  def checkSessionResponse(self):
    cks = self.checkSession()
    if cks == None:
      return None   
    return WebResponse("200 OK","application/json",json.dumps({"status":"fail","msg":cks}))
                       


class WebResponse:
  def __init__(self,status,contentType,content,redirect=None):
    self.status = status
    self.contentType = contentType
    self.content = content
    self.redirect = redirect
  
  

def okResponse(vl=None):
  vprint("okResponse")
  rv = {"status":"ok"}
  if vl:
    rv["value"] = vl
  return WebResponse("200 OK","application/json",json.dumps(rv));    



def redirectResponse(dest):
  rs =  WebResponse(None,None,None,dest)
  return rs

def htmlResponse(txt):
 
  return WebResponse("200 OK","text/html",txt);    

def failResponse(msg=None,otherData = {}):
  rv = {"status":"fail"}
  if msg:
    rv["msg"] = msg
  if otherData:
    rv.update(otherData)
  vprint("failResponse",msg)
  return WebResponse("200 OK","application/json",json.dumps(rv));    

  