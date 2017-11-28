'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); 

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.submit = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const excercisename = requestBody.excercisename;
  const excercisetype = requestBody.excercisetype;
  const amount = requestBody.amount;

  if (typeof excercisename !== 'string' || typeof excercisetype !== 'string' || typeof amount !== 'number') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit excercise data because of validation errors.'));
    return;
  }

  submitExcercise(excerciseData(excercisename, excercisetype, amount))
    .then(res => {
      callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          message: 'Sucessfully submitted excercise data',
          candidateId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit excercise data`
        })
      })
    });
};

module.exports.get = (event, context, callback) => {
    var params = {
        TableName: process.env.EXCERCISE_TABLE,
        ProjectionExpression: "id, excercisename, excercisetype, amount",
    };

    console.log("Scanning excercise table.");
    const onScan = (err, data) => {

        if (err) {
            console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
        } else {
            console.log("Scan succeeded.");
            return callback(null, {
                statusCode: 200,
                headers: {
                  "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({
                    excercises: data.Items
                })
            });
        }

    };

    dynamoDb.scan(params, onScan);

};
module.exports.getByType = (event, context, callback) => {
  const params = {
    TableName: process.env.EXCERCISE_TABLE,
    ProjectionExpression: "id, excercisename, amount",
    FilterExpression: "excercisetype = :type",
    ExpressionAttributeValues: {
      ":type":event.pathParameters.type
    }
  };
  const onScan = (err, data) => {

    if (err) {
      console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
      callback(err);
    } else {
      console.log("Scan succeeded.");
      return callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          excercises: data.Items
        })
      });
    }

  };


  dynamoDb.scan(params, onScan);
};

const submitExcercise = excercise => {
  console.log('Submitting excercise');
  const excerciseInfo = {
    TableName: process.env.EXCERCISE_TABLE,
    Item: excercise,
  };
  return dynamoDb.put(excerciseInfo).promise()
    .then(res => excercise);
};

const excerciseData = (excercisename, excercisetype, amount) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    excercisename: excercisename,
    excercisetype: excercisetype,
    amount: amount,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
};

