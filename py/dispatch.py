#!/usr/bin/env python

import time
import urlparse
from WebClasses import WebInput,WebResponse

import re
import time

import constants
import misc


verbose = True
def vprint(*args):
  if verbose:
    misc.printargs(args,"DISPATCH")

mverbose = True
def mprint(*args):
  if mverbose:
    misc.printargs(args,"DISPATCH")
  


def setDomainVars(host):
  vprint("HOST",host)
  if host=='dev.prototypejungle.org':
    constants.atDev = 1
    rootDir = "/mnt/ebs0/prototypejungledev/"
  else:
    constants.atDev = 0
    rootDir = "/mnt/ebs0/prototypejungle/"
  constants.storageDir = rootDir + "www/item"
  constants.logDir = rootDir + "logs"
  constants.rootDir = rootDir
  constants.host = host

import json



from api.frames import addFrame,postCanvas
from api.file import putFile,getFile,walkDirectory
from api.s3 import toS3
from api.twitter import twitterRequestToken,setTwitterToken
from api.login import personaLogin,logOut
from api.user import setHandle,getUser


methodNames = ["addFrame","postCanvas","putFile","getFile","walkDirectory","toS3",
           "twitterRequestToken","setTwitterToken","personaLogin","logOut",
           "setHandle"]

methods = {}
for mn in methodNames:
  methods[mn] = eval(mn)


"""
methods = {"addFrame":addFrame,"postCanvas":postCanvas,"putFile":putFile,"getFile":getFile,"walkDirectory":walkDirectory,"toS3":toS3,
           "twitterRequestToken":twitterRequestToken,"setTwitterToken":setTwitterToken,"personaLogin":personaLogin,
           "setLocalName":setLocalName}
"""

def startResponse(wr,start_response):
  status = wr.status
  ctype = wr.contentType
  content = wr.content
  #print "CONTENT ",content
  redirect = getattr(wr,"redirect",None)
  if redirect:
    return redirectTo(redirect,start_response)
  """ @todo no-cache when logged in otherwise specify a max-age """
  response_headers = [('Cache-Control', 'no-cache, must-revalidate'),('Content-type', ctype),
                        ('Content-Length', str(len(content)))]
  start_response(status, response_headers)
  etm = time.time() - wr.startTime
  mprint("ELAPSED TIMEE ",etm)
  content = content.encode('utf-8')
  return [content]
  



def emitStaticPage(fln):
  ffl = constants.pageRoot+fln
  f = open(ffl,'r')
  cn = f.read()
  f.close()
  return WebResponse("200 OK","text/html",cn);  
  
  
def application(environ, start_response):
  startTime = time.time()
  if  constants.maintainenceMode:
    webout = WebResponse("200 OK","text/html",constants.maintainencePage)
    webout.startTime = startTime
    return startResponse(webout,start_response)
  host = environ['HTTP_HOST']
  setDomainVars(host)
  raddr = environ['REMOTE_ADDR']
  constants.remote_addr = raddr
  #req.write("Heeello World!"+req.uri)
  #qs = environ["QUERY_STRING"]
  ua = environ["HTTP_USER_AGENT"]
  vprint("BROWSER**",ua)
  ruri = environ["REQUEST_URI"]
  mprint("RURI ",ruri)
  prsu = urlparse.urlparse(ruri)
  qs = prsu.query
  cookie = environ.get("HTTP_COOKIE",None)
  sessionId = None
  if cookie:
    mt = re.search("sessionId\=(\w*)",cookie)
    if mt:
      sessionId = mt.group(1)

  vprint("PRSU",prsu)
  path = prsu.path
  cln = environ.get("CONTENT_LENGTH",None)
  #cln = environ.get("HTTP_REFERER",None)
  cn = None
  istr = None
  if cln!=None:
    istr = environ["wsgi.input"]
    cln = int(cln)
  session = None
  webin = WebInput(path,qs,istr,session,cln)
  constants.webin = webin
  pathsplit = path.split("/")
  path1 = pathsplit[1]
  isApiCall = (path.find("/api/")==0)
  if isApiCall:
    hasMethod = path.find("()")>0
    ps = path.split("/")
    lnps = len(ps)
    if len(ps)==3:
      methodName=ps[2]
      method = methods.get(methodName,None);
      if method == None:
        vprint("api","No Such Method ",methodName)
        js = json.dumps({"status":"error","msg":"no such method"})
        webout = WebResponse('200 OK',"application/json",js)
      else:
        vprint("api","dispatch to method ",methodName)

        webout = method(webin)
      webout.startTime = startTime
      return startResponse(webout,start_response)
      #return startResponse(WebResponse("200 OK","text/plain","ok"),start_response)
  webout = emitNotFound(webin);
  webout.startTime = startTime
  return startResponse(webout,start_response)

