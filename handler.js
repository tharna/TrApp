'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); 

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const user = "test";


module.exports.submit = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const exercisename = requestBody.exercisename;
  const exercisetype = requestBody.exercisetype;
  const amount = requestBody.amount;
  const note = requestBody.note;

  if (typeof exercisename !== 'string' || typeof exercisetype !== 'string' || typeof amount !== 'number') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit exercise data because of validation errors.'));
    return;
  }

  checkUser();
  checkActivity();

  submitExercise(exerciseData(exercisename, exercisetype, amount, note))
    .then(res => {
      callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          message: 'Sucessfully submitted exercise data',
          candidateId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit exercise data`
        })
      })
    });
};

module.exports.get = (event, context, callback) => {
    var params = {
        TableName: process.env.EXERCISE_TABLE,
        ProjectionExpression: "exercisename, exercisetype, amount, note",
        KeyConditionExpression: "userID = :user",
        ExpressionAttributeValues: {
          ":user": user
        }
    };

    console.log("Scanning exercise table.");
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
                    exercises: data.Items
                })
            });
        }

    };

    dynamoDb.query(params, onScan);

};
/*
module.exports.getByType = (event, context, callback) => {
  const params = {
    TableName: process.env.EXERCISE_TABLE,
    ProjectionExpression: "exercisename, amount, note",
    KeyConditionExpression: "userID = :user",
    ExpressionAttributeValues: {
      ":user":"test"
    }
    FilterExpression: "exercisetype = :type",
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
          exercises: data.Items
        })
      });
    }

  };


  dynamoDb.scan(params, onScan);
};
*/
module.exports.getActivity = (event, context, callback) => {
  checkActivity();
  var params = {
      TableName: process.env.ACTIVITY_TABLE,
      ProjectionExpression: "#total",
      ExpressionAttributeNames: {
        "#total": "total",
      },
      KeyConditionExpression: "userID = :user",
      ExpressionAttributeValues: {
        ":user": user
      }
  };

  console.log("Scanning exercise table.");
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
                  activity: data.Items
              })
          });
      }

  };

  dynamoDb.query(params, onScan);

};

module.exports.getUser = (event, context, callback) => {
  checkUser();

  var params = {
      TableName: process.env.USER_TABLE,
      Key: {
        userID: user,
      },
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
          user: data.Item
        })
      });
    }
  };

  dynamoDb.get(params, onScan);
};


const submitExercise = exercise => {
  console.log('Submitting exercise');
  const exerciseInfo = {
    TableName: process.env.EXERCISE_TABLE,
    Item: exercise,
  };
  return dynamoDb.put(exerciseInfo).promise()
    .then(res => exercise);
};

const exerciseData = (exercisename, exercisetype, amount, note) => {
  // TODO get userInfo
  // TODO check achievements
  
  updateActivity(amount)
    .then(res => {
      console.log("Activity updated.");
    })
    .catch(err => {
      console.log("Updating activity failed:", err);
    });

  updateLevels(amount, exercisename)
    .then(res => {
      console.log("Levels updated.");
    })
    .catch(err => {
      console.log("Updating levels failed:", err);
    });

  const timestamp = new Date().getTime();
  const date = new Date().toISOString();
  return {
    userID: user,
    date: date,
    exercisename: exercisename,
    exercisetype: exercisetype,
    amount: amount,
    updatedAt: timestamp,
    note: note,
  };
};

const updateActivity = (amount) => {
  const date = new Date().toISOString().substr(0, 10);
  const activityInfo = {
    TableName: process.env.ACTIVITY_TABLE,
    Key: {
      userID: user,
      date: date,
    },
    UpdateExpression: "add #total :amount" ,
    ExpressionAttributeNames: {
      "#total": "total",
    },
    ExpressionAttributeValues: {
      ":amount": amount,
    },
    ReturnValues:"UPDATED_NEW",
  }
  return dynamoDb.update(activityInfo).promise()
  .then(res => activityInfo);
}

const updateLevels = (amount, exercisename) => {
  const element = getElement(exercisename);
  console.log(element);
  const levelInfo = {
    TableName: process.env.USER_TABLE,
    Key: {
      userID: user,
    },
    UpdateExpression: "add level.#element :amount",
    ExpressionAttributeNames: {
      "#element": element,
    },
    ExpressionAttributeValues: {
      ":amount": amount,
    },
    ReturnValues:"UPDATED_NEW",
  }
  return dynamoDb.update(levelInfo).promise()
  .then(res => levelInfo);

}
const getElement = (exercisename) => {
  // TODO actually get element based on exercise type
  const elements = {
    Juoksu: "earth",
    Kuntosali: "fire",
    Uinti: "water",
    Pyöräily: "air",
  }
  return elements[exercisename];
}

const checkUser = () => {
  var params = {
      TableName: process.env.USER_TABLE,
      Key: {
        userID: user,
      },
  };

  console.log("Check user.");
  const onScan = (err, data) => {

      if (err) {
        console.log("Error getting user.");
      } else {
        console.log("Userdata:", data);
        if (!data.Item) {
          addUser()
          .then(res => {
            console.log("User added.");
          })
          .catch(err => {

            console.log("adding user failed:", err);
          });
        }
        console.log("User found.");
      }
  };

  dynamoDb.get(params, onScan);
}

const addUser = userData => {
  const userInfo = {
    TableName: process.env.USER_TABLE,
    Item: {
      userID: user,
      level: {
        fire: 0,
        earth: 0,
        water: 0,
        air: 0,
      },
    },
  };
  console.log("Adding new user.");
  return dynamoDb.put(userInfo).promise( )
    .then(res => userData);
}
const checkActivity = () => {
  const date = new Date().toISOString().substr(0, 10);
  var params = {
      TableName: process.env.ACTIVITY_TABLE,
      Key: {
        userID: user,
        date: date,
      },
  };

  console.log("Scanning activity table.");
  const onScan = (err, data) => {

      if (err) {
        console.log("Activity scan failed.");
      } else {
        console.log(data);
        if (!data.Item) {
          addActivity()
          .then(res => {
            console.log("Activity added succesfully.");
          })
          .catch(err => {
            console.log("Adding activity failed:", err);
          });
        }
        console.log("Activity scan succeeded.");
      }
  };

  dynamoDb.get(params, onScan);
}

const addActivity = activity => {
  const date = new Date().toISOString().substr(0, 10);
  const activityInfo = {
    TableName: process.env.ACTIVITY_TABLE,
    Item: {
      userID: user,
      date: date,
      total: 0,
    },
  };
  console.log("Adding new activity record.");
  return dynamoDb.put(activityInfo).promise()
    .then(res => activity);
}
