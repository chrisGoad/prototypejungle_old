pj.account = {};

var isNew = false;
var currentCount;

var signOut = function () {
  if (fb.currentUser) {
    var auth = firebase.auth();
    auth.signOut().then(function () {
      location.href = "/draw.html";
    });
  }
}

var setFieldValue = function (field) {
  var input =  document.getElementById(field+'Input');
  var value = fb.account[field];
  if (value  !== undefined) {
    input.value = value;
  }
}

var newFields = ['userName'];//,'inviteKey'];

var fields = ['name','profile','email'];

var toLink = function (url) {
  if (!url) {
    return '';
  }
  return (url.substr(0,4) === 'http')?'<a href="'+url+'">'+url+'</a>':url
}

var checkUserString = function (string) {
  if ((string === undefined) || (!string.match)) { 
    pj.error('Bad argument');
  }
  if (string==='') return false;
  return !!string.match(/^([a-z]|[A-Z])(?:\w)*$/)
}
var setMessage = function (msg) {
  document.getElementById('message').innerHTML = msg;
}

var checkUserName = function (name,cb) {
  if (!checkUserString(name)) {
      setMessage('User names must be alphanumeric and start with a letter. No spaces.');
      cb(false);
  } else {
    fb.userNameToAccount(name,function (account) {// NEEDS Work
      if (account) {
        setMessage('That user name is taken. Please try another');
        cb(false);
      } else {
        cb(true);
      }
    });
  }
}

var blank = function (s) {
  var wb = s.replace(/\ /g,'');
  return wb.length == 0;
}
var checkInviteKey = function (key,cb) {
  if (blank(key)) {
     return cb(false);
  }
  fb.inviteKeyExists(key,function (exists) {
    if (exists) {
      fb.inviteKeyToAccount(key,function (account) {
        cb(!account);
      });
    } else {
      cb(false);
    }
  });
}
var valuesOk;
var saveFieldValue = function (field) {
  var input =  document.getElementById(field+'Input');
  fb.account[field] = input.value;
  return true;
}

var checkCount = function (cb) {
  fb.maxCount(function (max) {
    fb.currentCount(function (current) {
      if (current+1 < max) {
        cb(current);
      } else {
        cb(false);
      }
    });
  });
}


var saveAccount = function () {
  var ifOk = function (newCount) {
    if (isNew) {
      fb.setCurrentCount(newCount,function () {
        var date = new Date();
        fb.account.creationDate = date.toString();
        fb.account.creationTime = date.getTime();
        fb.setAccountValues(undefined,fb.account,function () {
          location.href = '/diagrams.html'
        });
      });
    } else {
      fb.setAccountValues(undefined,fb.account,function () {
          location.href = '/diagrams.html'
        });
    }
  }
  fields.forEach(saveFieldValue);
  if (isNew) {
    newFields.forEach(saveFieldValue);
    checkUserName(fb.account.userName,function (userNameOk) {
      if (userNameOk) {
         ifOk(currentCount+1);
      } else {
        cb(false);
      }
    });
  } else {
    ifOk();
  }
}

var setHandler = function (id,fn) {
 document.getElementById(id).addEventListener('click',fn);
}

var setEnterHandler = function (id,fn) {
  document.getElementById(id).addEventListener("keyup",fn);
}

var hideElement = function (id) {
  document.getElementById(id).style.display = 'none';
}


var showElement = function (id) {
  document.getElementById(id).style.display = 'block';
}



var setHandlers = function (field) {
  setHandler('edit'+field,function (){editField(field)});
  setHandler('edit'+field+'Done',function (){editFieldDone(null,field)});
}

pj.account.pageReady = function () {
  fb.setCurrentUser(function () {
    setHandler('signOut',signOut);
    setHandler('save',saveAccount);
    setHandler('cancel',function () {location.href = '/diagrams.html';});
    setHandler('cancel2',function () {location.href = '/index.html';});
    fb.getAccount(undefined,function (erm,account) {
      if (!account) {
        account = fb.account = {};//name:'',profile:'',email:''};
        isNew = true;
        checkCount(function (count) {
          if (count === false) {
             setMessage('The limit for number of accounts for the beta has been reached. Please try again later, or request an invite key from prototypejungle@gmail.com');
             hideElement('account1');
             hideElement('account2');
             return;
          } else {
            currentCount = count;
            showElement('welcome');
            document.getElementById('save').innerHTML = 'Sign In';
            showElement('userNameNew');
            hideElement('cancel2');
          }
        });
      } else {
         showElement('userName');
         document.getElementById('userNameSpan').innerHTML = fb.account.userName;
        hideElement('cancel2'); 
      }
      fields.forEach(setFieldValue);
    
    });    
  });
}
