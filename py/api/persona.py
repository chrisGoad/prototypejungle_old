OBSOLETE MOVED TO LOGIN#!/usr/bin/env python

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
import requests


verbose = True
testingFailure = False

def vprint(*args):
  if verbose:
    misc.printargs(args,"personaAPI")
    
    

    
def personaLogin(webin):
  
  cn = webin.content()
  #print "CONTENT",cn
  cob=json.loads(cn)
  assertion = cob["assertion"];
  vprint("assertion ",assertion);
  data = {'assertion':assertion,'audience':'http://dev.prototypejungle.org:80'}
  resp = requests.post('https://verifier.login.persona.org/verify', data=data, verify=True)
  vprint("ok",resp.ok)
  if resp.ok and (not testingFailure):
    # Parse the response
    verification_data = json.loads(resp.content)

    # Check if the assertion was valid
    vprint("verificationData",verification_data['status'])
    vprint("verificationData",verification_data);
    if verification_data['status'] == 'okay':
      email = verification_data['email']# Log the user in by setting a secure session cookie
      vprint("email",email)
      uname = "persona_"+email;    
      rs = {"userName":uname}
      usr = models.loadUserD(uname)
      if usr:
        vprint("ExisTing persona user",usr.__dict__)
        tac = getattr(usr,"accepted_terms",0)
        tac = 1 # no checking for terms yet
        handle = getattr(usr,"handle",None)
        if handle:
          rs["handle"] = handle
        rs["accepted_terms"] = tac
      else:
        vprint("New user")
        usr = models.UserD(uname)
        usr.accepted_terms = 1
        usr.save(True)
        rs["new_user"] = 1
      rs["accepted_terms"] = 1
      s = usr.newSession()
      sid = s.id
      rs["sessionId"] = sid
      return okResponse(rs) 
    else:
      return failResponse("notVerivied")
  else:
    return failResponse("failedRequestToPersona")

