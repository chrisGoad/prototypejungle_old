#!/usr/bin/env python
# python /var/www/neo.com/store/createdb.py fub
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/prototypejungle/py"
export PYTHONPATH
cd /mnt/ebs0/prototypejungle/py/store
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

    
tverbose  = False # transaction print
def tprint(*args):
  if tverbose:
    misc.printargs(args,"TDYNAMO")
  
  
def connect():
  global dconn
  if dconn==None:
    dconn = boto.connect_dynamodb(aws_access_key_id=keyId,aws_secret_access_key=secretKey) 

connect()

import json

prefix="";

theTables = {}


tableProps = {}



def getTable(tnm):
  rs = theTables.get(tnm,None)
  if rs:
    return rs
  rs = dconn.get_table(prefix+tnm)
  theTables[tnm] = rs
  return rs


 
schema = dconn.create_schema(
    hash_key_name='topic',
    hash_key_proto_value='S',
    range_key_name='create_time',
    range_key_proto_value=0
  )
 


def createTable(tnm):
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

    
  

def extractProps(x,props):
  "x has come from dynamo; this converts it for external use"
  tp = x["topic"]
  rs = {"topic":tp}
  ctm = x.get("create_time")
  if ctm:
    rs["create_time"] = ctm
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



def  filterProperties(dst,x,props)
  for p in props:
    v = x.get(p,None)
    if v!=None:
      dst[p] = v
  

  
def saveDict(tnm,value,isNew=True,rkey):
  vprint("NEW ",tnm," USING DYNAMODB FOR ",value)
  tprint("saveObject",tnm,value["topic"],isNew,rkey)
  tp = value["topic"]
  tprint("saveDict",tnm,tp,isNew,rkey)
  tab = getTable(tnm)
  props = tableProps[tnm]
  vprint("NEW PROPS ",props)
  itm = tab.new_item(
    hash_key =tp,
    range_key = rkey
  )
  filterProperties(itm,value,props)
  tm = int(time.time()*1000)
  if isNew:
    itm["create_time"] = tm
    vprint("NEW ITEM ",itm)
    #traceback.print_stack()
    itm.put()
  else:
    vprint("UPDATE OF ",itm)
    itm.save()
  return itm
  


def putAttribute(tnm,topic,attr,value):
  tprint("putAttribute",tnm,attr,value)
  tab = getTable(tnm)
  hasRange = tableIncludesRange[tnm]
  if hasRange:
    itm = boto.dynamodb.item.Item(tab,topic,-1)
  else:
    itm = boto.dynamodb.item.Item(tab,topic)
  itm.put_attribute(attr,dynamoify(value))
  itm.save()

  
# name will be tumblr_ or twitter_
#kind will be "tumblr" or "twitter"  or whatever is supported later

tableProps["user"] = ["name","kind","deleted","token","accepted_terms","reponame"]



 
tableProps["session"]  = ["user","start_time","last_access_time","active","timed_out"]


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
  tab = getTable("session")
  itm = tab.new_item(
    hash_key = stopic,
  )
  itm["user"] = user
  tm = int(time.time())
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
  return getDict("User",topic)
  


  



  
def saveUser(userD,newUser=True):
  vprint("NEW USER USING DYNAMODB FOR ",userD.__dict__)
  tp = userD.topic
  return saveObject("User",userD,newUser)
 
    


  

  
  

def pathLast(s):
  rf = s.rfind("/")
  return s[rf+1:]
  



def buildImageToAlbums():
  itms = getTable("Album").scan()
  tab = getTable("ImageToAlbums")
  for i in itms:
    vprint("imageToAlbum",i["image"],i["topic"])
    ii = tab.new_item(
      hash_key=i["image"],
      range_key = i["topic"]
      )
    ii.put()
  

"""
def createTables():
dyn.createTable("Count")
dyn.createTable("Image")
dyn.createTable("Album")
dyn.createImageToAlbumsTable()
dynamo.createAlbumToSnapsTable()

dyn.createTable("Session")
dyn.createTable("User")
dyn.createTable("Snap")
dyn.createTable("Upload")
dyn.xferTable("/type/userD","User")
dyn.xferTable("/type/imageD","Image")
dyn.xferTable("/type/albumD","Album")
dyn.buildImageToAlbums()snaps.xferSnaps("/album/cg/The_Ambassadors/1")
import store.dynamo
dynamo = store.dynamo



def deleteItems(tnm):


PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

  

python
execfile("ops/execthis.py")

uu = dynamo.allUsers()
byt = {}
for u in uu:
  byt[u["topic"]] = u

byt["/user/e244d69"]


dynamo.deleteItems("Post")
dir(boto.exception)

boto.dynamodb.exceptions.ProvisionedThroughputExceededException
tp = "/snap/4294b0e/one_dollar_bill_obverse/1/2"
snp = dynamo.getItem("Snap",tp)
btp = "/snap/4294b0e/one_dollar_bill_obverse/1/2444"
snp = dynamo.getItem("Snap",btp)
tab = dynamo.getTable("Snap")
try:
  itm = tab.get_item(hash_key=btp,range_key=-1)
except boto.exception as exx:
  print "HOO"


try:
  itm = tab.get_item(hash_key=btp,range_key=-1)
except Exception as exx:
  print "HOO"


snps = dynamo.getItems("Snap",[tp],True)

tm = snp["current_item_create_time"]


foo = dynamo.stashObject("Snap",tp)


import time

dynamo.timeOutAllSessions()

dynamo.deleteItems("Session")



import time
dyn = dynamo

dyn.getItem("Image",tp)

def repeatGetItem(tnm,topic,count,interval):
  stm = time.time()
  itms = []
  for i in range(0,count):
    print i
    itm = dynamo.getItem(tnm,topic)
    itms.append(itm)
    time.sleep(interval)
  return (time.time()-stm) - interval*count


utp = "/user/047f8da"
dynamo.getItem("User",tp)
itp = "/image/4294b0e/garden_of_earthly_delights"

repeatGetItem("User",utp,1000,0.05) # result 289 seconds
repeatGetItem("Image",itp,1000,0.05) # result 11 secs


tp = "/session/f2c0a987415af8526552889cf51137ab9b173e69a278fc0279bc55ce"

dyn.getItem("Session",tp)



def repeatPutItem(tnm,topic,prop,count,interval):
  stm = time.time()
  itms = []
  itm = dynamo.getItem(tnm,topic)
  for i in range(0,count):
    itm.put_attribute(prop,i)
    itm.save()
    time.sleep(interval)
  return (time.time()-stm) - interval*count



repeatPutItem("Session",tp,"start_time",400,0.01)

repeatGetItem("Session",tp,400,0.01)

"""
  #furb()