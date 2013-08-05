#!/usr/bin/env python

"""
Handles the api call api/tumblrRequestToken

http://dev.imagediver.com/topic/image/cg/astoria_1923_0

http://neochronography.com/snap/astoria_1923_0/franklin.jpg

despite its name, this handles editing of snaps too

if the incoming data has a topic field, this is the snap being edited.

"""
from WebClasses import WebResponse,okResponse,failResponse

import ops.oauth_twitter as oauth_twitter
import store.dynamo as dynamo
import json
import misc
import constants
import store.models as models



verbose = True

def vprint(*args):
  if verbose:
    misc.printargs(args,"twitterAPI")
    
    
def twitterRequestToken(webin):
  #print "tumblrRequestToken"
  #cks = webin.checkSessionResponse()
  #if cks: return cks
  sess = webin.session
  #user = sess.user
  tk = oauth_twitter.requestToken()
  return okResponse(tk)


    
def setTwitterToken(webin):
  
  cn = webin.content()
  #print "CONTENT",cn
  cob=json.loads(cn)
  token = cob["oauth_token"]
  token_secret = cob["oauth_token_secret"]
  vprint("set token",token,token_secret)
  verifier = cob["verifier"]
  signingIn = cob.get("signingIn",False)
  if not signingIn:
    cks = webin.checkSessionResponse()
    if cks: return cks
  access_token = oauth_twitter.getAccessToken(verifier,token,token_secret)
  #print "ACCESS TOKEN ",access_token
  atkj = json.dumps(access_token)
  if signingIn:
    uinfj = oauth_twitter.getUserInfo(access_token["oauth_token"],access_token["oauth_token_secret"])
    #print "UINFJ",uinfj
    uinf = json.loads(uinfj)
    tuname = uinf["screen_name"]
    vprint("TUNAME",tuname)
    uname = "twitter_"+tuname
    rs = {"userName":uname}
    usr = models.loadUserD(uname)
    if usr:
      vprint("Existing twitter user",usr.__dict__)
      tac = getattr(usr,"accepted_terms",0)
      tac = 1 # no checking for terms yet
      handle = getattr(usr,"handle",None)
      if handle:
        rs["handle"] = handle
      rs["accepted_terms"] = tac
    else:
      usr = models.UserD(uname)
      usr.accepted_terms = 1
      usr.token = atkj
      usr.save(True)
      rs["accepted_terms"] = 1
      rs["new_user"] = 1;
    s = usr.newSession()
    sid = s.id
    rs["sessionId"] = sid
    return okResponse(rs) 


