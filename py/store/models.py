#!/usr/bin/env python

import constants

# clean this up; not all of these imports are needed
import re
import math
import hashlib
import os
import store.dynamo
dynamo = store.dynamo

import time
import math
import misc
import urllib
import ops.oauth_tumblr as oauth_tumblr
import ops.oauth_twitter as oauth_twitter





verbose = True
def vprint(*args):
  if verbose:
    misc.printargs(args)
   

      
def toDict(src,props):
  rs = {}
  setProperties(rs,src.__dict__,props)
  return rs



def toDicts(src,props):
  return [toDict(srce,props) for srce in src]

  


def genId(seed=None):
  import hashlib
  tm = time.time()
  tm = str(tm)+"n98235J"
  if seed:
    tm += seed
  sid = hashlib.sha224(tm).hexdigest()
  return sid


class SessionD():


  def __init__(self,id):
    self.id = id

    
  def deactivate(self):
    dynamo.deactivateSession(self.id)
    



def loadSessionD(id):
  d = dynamo.getSession(id)
  if d==None:
    return None
  rs = SessionD(id)
  rs.__dict__.update(d)
  constants.session = rs
  vprint("SETTING SESSION")
  return rs



  

class UserD():

  
  def __init__(self,name):
    self.name = name
    


  
  def newSession(self):
    s =  dynamo.newSession(self.name)
    rs = SessionD(s["id"])
    rs.user = self.name
    rs.start_time = s["start_time"]
    rs.active = s["active"]
    return rs
  
  


  def save(self,isNew=True):
    return dynamo.saveUser(self,isNew)
  
  def tumblrInfo(self):
    tk = getattr(self,"token",None)
    if not tk: return None
    tko = json.loads(tk)
    rs = oauth_tumblr.getUserInfo(tko["oauth_token"],tko["oauth_token_secret"])
    rso = json.loads(rs)
    return rso["response"]['user']
    
    
  def twitterInfo(self):
    tk = getattr(self,"token",None)
    if not tk: return None
    tko = json.loads(tk)
    rs = oauth_twitter.getUserInfo(tko["oauth_token"],tko["oauth_token_secret"])    
    rso = json.loads(rs)
    return uinf["screen_name"]

  def setHandle(self,handle):
    uname = self.name;
    prev = getattr(self,"handle",None)
    vprint("previous handle",prev)

    if prev == handle:
      return "doneAlready"
    rs = dynamo.setHandle(uname,handle)
    if rs != "ok":
      return rs
    dynamo.putAttribute("user",uname,"handle",handle)
    if prev:
      dynamo.deleteItem("handle",prev)
    return "ok"
  


def loadUserD(topic):
  d = dynamo.getUser(topic)
  vprint("LOADED USER FROM DYNAMO ",d)
  if d == None:
    rs = None
  else:
    rs = UserD(topic)
    rs.__dict__.update(d)
  return rs
  
def newUser(name):
  rs = UserD(name)
  tm = int(time.time())
  rs.create_time = tm
  rs.modify_time = tm
  rs.save()
  return rs


def dictToUserD(d):
  rs = UserD()
  rs.__dict__.update(d)
  return rs

  
def allUsers():
  rsd = dynamo.allUsers()
  rs = [dictToUserD(d) for d in rsd]
  return rs

  
def checkSession(sid):
  s =  dynamo.getSession(sid)
  u = s["user"]
  vprint("session",s["id"])
  if not s:
    return "noSuchSession"
  if s["timed_out"]:
    return "timed_out"
  return loadUserD(u);
    

def apiCheckSession(cob):  # cob is the data sent in the api call; returns the userD if successful
  sid = cob.get("sessionId",None)
  if not sid:
    return "noSession"
  return checkSession(sid)
  
  

    
  
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/prototypejungledev/py"
export PYTHONPATH
cd /mnt/ebs0/prototypejungledev/py

python
import store.dynamo as dyn
import store.models as models

uu = models.loadUserD("persona_cagoad@gmail.com")
uu.setHandle("cg_handle1")


uu = models.loadUserD("twitter_prototypejungle")
uu.setHandle("cg_handle0")

uu = models.checkSession("beca1622ba1b44eaffd2c6dfe0349f39833a9a0e9de0c8a25347cf36")

'uu = models.newUser("cg")'

ss = uu.newSession()

"""