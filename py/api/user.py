#!/usr/bin/env python


import time
import subprocess
import urlparse

from WebClasses import WebResponse,okResponse,failResponse
import constants
import os
import json
import store.models as models
import misc

def setHandle(webin):
  cob=json.loads(webin.content())
  cs = models.apiCheckSession(cob)
  if type(cs)==str:
    return failResponse(cs)
  handle = cob["handle"]
  if not misc.checkName(handle):
    return failResponse("badForm")
  # todo check for right form
  rs = cs.setHandle(handle)
  if rs=="ok":
    return okResponse();
  if rs=="doneAlready":
    return okResponse("doneAlready");
  return failResponse(rs);


def getUser(webin):
  cob=json.loads(webin.content())
  cs = models.apiCheckSession(cob)
  if type(cs)==str:
    return failResponse(cs)
  return okRespose(cs.__dict)
  
