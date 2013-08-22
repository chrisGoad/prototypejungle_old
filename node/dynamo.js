  /**
     * This is our Node.JS code, running server-side.
     * from http://arguments.callee.info/2010/04/20/running-apache-and-node-js-together/
     */
  

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./keys/awskeys.json');
exports.db =  new AWS.DynamoDB();
