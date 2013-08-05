#!/usr/bin/env python
# python /var/www/neo.com/store/createdb.py fub
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/prototypejungledev/py"
export PYTHONPATH
cd /mnt/ebs0/prototypejungledev/py/store
python
import dynamo
"""

import boto
import time
import traceback
import misc
import constants

def time_msec():
  return int(time.time()*1000)
  
#import boto.dynamodb

from keys.aws import keyId,secretKey


dconn = None



verbose = False

def vprint(*args):
  if verbose:
    misc.printargs(args,"DYNAMO")

    
tverbose  = True # transaction print
def tprint(*args):
  if tverbose:
    misc.printargs(args,"TDYNAMO")
  
  
def connect():
  global dconn
  if dconn==None:
    dconn = boto.connect_dynamodb(aws_access_key_id=keyId,aws_secret_access_key=secretKey) 

connect()

import json

prefix="pj_";

theTables = {}

tableRangeKey = {}

tablePrimaryKey = {}

tableProps = {}



def getTable(tnm):
  rs = theTables.get(tnm,None)
  if rs:
    return rs
  rs = dconn.get_table(prefix+tnm)
  theTables[tnm] = rs
  return rs


 


# restriction, for now: primary keys are strings, and range keys are numerical
def createTable(tnm):
  pk = tablePrimaryKey[tnm]
  rk = tableRangeKey[tnm]
  schema = dconn.create_schema(
    hash_key_name=pk,
    hash_key_proto_value='S',
    range_key_name=rk,
    range_key_proto_value=0
  )
 
  dconn.create_table(
    name=prefix+tnm,
    schema = schema,
    read_units=10,
    write_units=5
  )  
    



  
  
def deleteTable(tnm):
  tab = getTable(tnm)
  dconn.delete_table(tab)

  
def deleteItems(tnm):
  tab = getTable(tnm)
  g = tab.scan()
  for i in g:
    i.delete()

    
  


    
def setProperties(dst,src,props):
  for p in props:
    pv = src.get(p,None)
    if pv != None:
      dst[p] = pv
      

def extractProperties(x,props):
  rs = {}
  for p in props:
    pv = x.get(p,None)
    if pv!=None: 
      rs[p]=pv
  return rs




def getItem(tnm,topic):
  tab = getTable(tnm)
  tprint("getItem",tnm,topic)
  try:
    itm = tab.get_item(hash_key=topic)
      
  except boto.dynamodb.exceptions.DynamoDBKeyNotFoundError:
    return None
  return itm

""" Watch out: may not return all. See getTopics for batched version (getItems should be excised)"""
def getItems(tnm,topics):
  tprint("getItems",tnm,topics)
  if len(topics)==0: return []
  tab = getTable(tnm)
  try:
    tprint("KEYS in getItems",topics)
    batchList = boto.dynamodb.batch.BatchList(dconn)
    batchList.add_batch(tab,topics)
    items = dconn.batch_get_item(batchList)      
  except boto.dynamodb.exceptions.DynamoDBKeyNotFoundError:
    return None
  return items["Responses"][tnm]["Items"]
 
def deleteItem(tnm,topic):
  tprint("deleteItem",tnm,topic)
  tab = getTable(tnm)
  itm = boto.dynamodb.item.Item(tab)
  itm = boto.dynamodb.item.Item(tab,hash_key=topic)
  itm.delete()
  




def getDict(tnm,topic,returnItemToo=False):
  itm = getItem(tnm,topic)
  props = tableProps[tnm]
  if itm:
    ep =  extractProps(itm,props)
    if returnItemToo:
      return (ep,itm)
    else:
      return ep
  else:
    return None
  
  
def getDicts(tnm,topics):
  items = getTopics(tnm,topics)
  vprint("ITEMS",items)
  props = tableProps[tnm]
  if items != None:
    return [extractProps(itm,props) for itm in items]
  else:
    return None




  
  tm = int(time.time()*1000)

  
def saveDict(tnm,value,isNew):
  vprint("NEW ",tnm," USING DYNAMODB FOR ",value)
  pk = tablePrimaryKey[tnm]
  rk = tableRangeKey[tnm]
  tp = value[pk]
  rv = value[rk]
  tprint("saveDict",tnm,tp,isNew,rv)
  tab = getTable(tnm)
  props = tableProps[tnm]
  vprint("NEW PROPS ",props)
  itm = tab.new_item(
    hash_key =tp,
    range_key = rv
  )
  setProperties(itm,value,props)
  if isNew:
    vprint("NEW ITEM ",itm)
    #traceback.print_stack()
    itm.put()
  else:
    itm.save()
  return itm
  


def putAttribute(tnm,topic,attr,value):
  tprint("putAttribute",tnm,attr,value)
  tab = getTable(tnm)
  hasRange = tableIncludesRange[tnm]
  itm = boto.dynamodb.item.Item(tab,topic)
  itm.put_attribute(attr,value)
  itm.save()

  
# name will be tumblr_ or twitter_
#kind will be "tumblr" or "twitter"  or whatever is supported later

tableProps["user"] = ["name","kind","deleted","token","accepted_terms","reponame","create_time","modify_time"]
tablePrimaryKey["user"] = "name"
tableRangeKey["user"] = "modify_time"


 
tableProps["session"]  = ["id","user","start_time","last_access_time","active","timed_out"]

tablePrimaryKey["session"] = "id"
tableRangeKey["session"] = "start_time"

def genId():
  import hashlib
  tm = time.time()
  tm = str(tm)+"n98735J"
  sid = hashlib.sha224(tm).hexdigest()
  return sid


def getSession(topic):
  def fprint(*a):
    if 0: misc.printargs(a,"getSession")
  rs = getDict("session",topic,returnItemToo=True)
  if rs:
    rsd = rs[0]
    rsi = rs[1]
   
    ctm = time.time()   
    lacc = rsd.get("last_access_time",ctm)
    fprint("session",rsd["topic"]," since last access ",ctm-lacc)
    # only bother writing access time every 10 minutes
    etm = ctm - lacc
    if (etm > constants.sessionTimeout):
      rsi.put_attribute("timed_out",1)
      tprint("sessionSave",topic)
      rsi.save()
      fprint("session timed out",rsd["topic"])
      rsd["timed_out"] = 1
      return rsd
    if rsd.get("timed_out",0) == 0: rsd["timed_out"] = 0
    if etm > 600:
      # rsi.put_attribute("last_access_time",ctm)
      # save the write: only write last access time every 10 minutes
      tprint("sessionSave",topic)
      rsi.put_attribute("last_access_time",ctm)
      rsi.save()
    return rsd
    
  
  

def deactivateSession(topic):
    vprint("DEACTIVATING SESSION FROM DYNAMODB")
    itm = getItem("session",topic)
    if itm==None:
      return None
    itm.put_attribute("active",0)
    tprint("deactivateSession",topic)
    itm.save()
 
 

def newSession(user):
  def fprint(*a):
    if 1: misc.printargs(a)
  id = genId()
  stopic = "/session/"+id
  fprint("NEW SESSION USING DYNAMODB FOR ",user,"=",stopic)
  tprint("newSession",stopic)
  tm = int(time.time())
  tab = getTable("session")
  itm = tab.new_item(
    hash_key = stopic,
    range_key = tm
  )
  itm["user"] = user
  itm["start_time"] = tm
  itm["last_access_time"] = tm
  itm["active"] = 1
  itm.put()
  return itm

def timeOutAllSessions():
  sess = allItems("session")
  for ses in sess:
    ses.put_attribute("timed_out",1)
    ses.save()

  
def deleteUser(topic):
  usr = getUser(topic)
  if usr:
    deleteItem("User",topic)
 



def allItems(tnm):
  tprint("allItems",tnm)
  tab = getTable(tnm)
  sc = tab.scan()
  return [itm for itm in sc]



  
def getUser(topic):
  return getDict("user",topic)
  


  



  
def saveUser(userD,newUser=True):
  vprint("NEW USER USING DYNAMODB FOR ",userD.__dict__)
  return saveDict("user",userD.__dict__,newUser)
 
    


  

  
  

def pathLast(s):
  rf = s.rfind("/")
  return s[rf+1:]
  



"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/prototypejungledev/py"
export PYTHONPATH
cd /mnt/ebs0/prototypejungledev/py
python
import store.dynamo as dyn
import store.models as models

dyn.createTable("user")

uu = models.newUser("cg2")

"""
  #furb()