// Dynamo stores data about users
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./keys/awskeys.json');
exports.db =  new AWS.DynamoDB();
