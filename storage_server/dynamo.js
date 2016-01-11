// Dynamo stores data about users
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./keys/aws.json');
exports.db =  new AWS.DynamoDB();

