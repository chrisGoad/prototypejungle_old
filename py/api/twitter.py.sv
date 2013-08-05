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
import model.models
models  = model.models



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
    exu = models.loadUserDbyTwitter(tuname)
    rs = {"twitter_name":tuname}
    if exu:
      vprint("Existing twitter user")
      exu.tumblr_token = atkj
      exu.dynsave(False)
      tac = getattr(exu,"accepted_terms",0)
      #tac = 1
      rs["accepted_terms"] = tac
      utp = exu.topic
      uid = misc.pathLast(utp)
      rs["userId"] = uid
      if tac:
        # go ahead and generate a new session for this fellow
        s = exu.newSession()
        stp = s.topic
        sid = misc.pathLast(stp)
        rs["sessionId"] = sid
      return okResponse(rs)
    else:
      vprint("NEW TUMBLR USER")
      ucnt = dynamo.getCount("/user/count")
      if ucnt >= constants.maxUsers:
        rs["hit_limit"]=1
        return okResponse(rs)
      uid = dynamo.genNewUserId()
      nu = models.UserD(None)
      nu.topic = '/user/'+uid
      nu.name  = tuname
      nu.twitter_name = tuname
      nu.storage_allocation = constants.initial_storage_allocation
      nu.bandwidth_allocation = constants.initial_bandwidth_allocation
      nu.accepted_terms = 0
      nu.twitter_token = atkj
      nu.dynsave(True)
      dynamo.bumpCount("/user/count")
      vprint("NEW TUMBLR USER SAVED")
      rs["accepted_terms"] = 0
      rs["userId"] = uid

      return okResponse(rs)
  """ getting a access token in the course of a post to tumblr """
  sess = webin.session
  user = sess.user
  userD = models.loadUserD(user)
  atkj = json.dumps(access_token)
  userD.tumblr_token = atkj
  userD.dynsave(False)
  return okResponse()




  
"""

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

  

python
execfile("ops/execthis.py")

import api.tumblr as tumblr
    rs = oauth_tumblr.getUserInfo(tko["oauth_token"],tko["oauth_token_secret"])



params = {"type":"text","state":"draft","body":"Second TEST post"}
params = {"album":"/album/4294b0e/van_eyck_arnolfini/1","snap":9,"crop":12,"blog":"annotatedart.tumblr.com"}


api.tumblr.tumblrPost1("/user/4294b0e",params)


sess = models.loadSessionD('8dca034396f099459e413a415372df7d0c8313e705ae74c7e717922e')
  
  
"""
