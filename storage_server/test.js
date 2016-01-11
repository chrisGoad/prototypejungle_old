var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var passport = require('passport');
var ssutil = require('./ssutil');
var api = require('./api.js');
var s3 = require('./s3');
var user = require('./user.js');

console.log(user.hashPassword('abcd'));
