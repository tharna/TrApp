'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); 
const jwt = require('jsonwebtoken');

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

var user = ''
var userInfo = {}


module.exports.submit = (event, context, callback) => {

  setUserInfo(event) 
  const requestBody = JSON.parse(event.body);
  const exercisename = requestBody.exercisename;
  const exercisetype = requestBody.exercisetype;
  const amount = requestBody.amount;
  const note = requestBody.note;
  const modifier = requestBody.modifier
  const date = requestBody.date

  if (typeof exercisename !== 'string' || typeof exercisetype !== 'string' || typeof amount !== 'number') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit exercise data because of validation errors.'));
    return;
  }

  checkUser();
  checkActivity();

  submitExercise(exerciseData(exercisename, exercisetype, amount, note, modifier, date))
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
  setUserInfo(event) 
    var params = {
        TableName: process.env.EXERCISE_TABLE,
        ProjectionExpression: "exercisename, exercisetype, amount, note, #date, modifier",
        ExpressionAttributeNames: {
          "#date": "date",
        },
        KeyConditionExpression: "userID = :user",
        ExpressionAttributeValues: {
          ":user": user
        },
        ScanIndexForward: false
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
  setUserInfo(event) 

  const period = event.queryStringParameters.period
  var date = new Date();
  var offset
  switch (period) {
    case 'Kuukausi':
      offset = 29
      break;
    case 'Treenijakso':
      offset = 89
      break;
    default:
      offset = 6
  }
  date.setDate(date.getDate() - offset);
  var dateString = date.toISOString().substr(0, 10);
  checkActivity();
  var params = {
      TableName: process.env.ACTIVITY_TABLE,
      ProjectionExpression: "#total, #date",
      KeyConditionExpression: "userID = :user AND #date > :date",
      ExpressionAttributeNames: {
        "#total": "total",
        "#date": "date",
      },
      ExpressionAttributeValues: {
        ":user": user,
        ":date": dateString
      }
  };

  console.log("Scanning exercise table.");
  const onScan = (err, data) => {

      if (err) {
          console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
          callback(err);
      } else {
          console.log("Scan succeeded.");
          var activity = new Array()
          var result;
          for(var i=offset;i>=0;i--) {
            date = new Date()
            date.setDate(date.getDate() - i)
            dateString = date.toISOString().substr(0, 10)
            if(result = data.Items.find(item => { return item.date === dateString })) {
              activity.push(result.total)
            } else {
              activity.push(0)
            }
             
          }
          return callback(null, {
              statusCode: 200,
              headers: {
                "Access-Control-Allow-Origin": "*"
              },
              body: JSON.stringify({
                  activity: activity
              })
          });
      }

  };

  dynamoDb.query(params, onScan);

};

module.exports.getUser = (event, context, callback) => {
  setUserInfo(event);
  checkUser().then(res => {

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
            user: calculateLevels(data.Item)
          })
        });
      }
    };
    dynamoDb.get(params, onScan);

  })
  .catch(err => {
    console.log("Error fetching user:", err);
  });

  const calculateLevels = (item) => {
    var sum = 0;
    var level = 0;
    const levelMultiplier = 4;
    item.current = {};
    while (sum + level * levelMultiplier < item.level.fire) {
      level++;
      sum += level * levelMultiplier;
    }
    item.level.fire = Math.round(item.level.fire / (sum + (level +1) * levelMultiplier) * 100);
    item.current.fire = level;
    sum = 0; level = 0;
    while (sum + level * levelMultiplier < item.level.water) {
      level++;
      sum += level * levelMultiplier;
    }
    item.level.water = Math.round(item.level.water / (sum + (level +1) * levelMultiplier) * 100);
    item.current.water = level;
    sum = 0; level = 0;
    while (sum + level * levelMultiplier < item.level.earth) {
      level++;
      sum += level * levelMultiplier;
    }
    item.level.earth = Math.round(item.level.earth / (sum + (level +1) * levelMultiplier) * 100);
    item.current.earth = level;
    sum = 0; level = 0;
    while (sum + level * levelMultiplier< item.level.air) {
      level++;
      sum += level * levelMultiplier;
    }
    item.level.air = Math.round(item.level.air / (sum + (level +1) * levelMultiplier) * 100);
    item.current.air = level;
    return item;
  };

};

module.exports.getQuests = (event, context, callback) => {
  setUserInfo(event) 
  var date = new Date().toISOString();

  var params = {
    TableName: process.env.QUEST_TABLE,
    ScanIndexForward: false,
    ProjectionExpression: "questID, groupID, amount, #name, questActive, questDays, questDesc, questFailure, questMeasure, questPublish, questRepeat, questScope, questStory, questSuccess, #type, activity",
    ExpressionAttributeNames: {
      "#name": "name",
      "#type": "type"
    },
    FilterExpression: "groupID = :group OR groupID = :all",
    ExpressionAttributeValues: {
      ":group": userInfo["https://app.aikojentanssi.fi/group"].toString(),
      ":all": "Yhteinen",
    }
  };

  console.log("Scanning quest table.");
  const onScan = (err, data) => {
    if (err) {
      console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
      callback(err);
    } else {
      console.log("Scan succeeded.");
      var quests = new Array()
      data.Items.forEach((quest, index) => {
        if( quest.questPublish <= date) {
          var questObj = {
            questID: quest.questID,
            groupID: quest.groupID,
            type: quest.type,
            name: quest.name,
            questMeasure: quest.questMeasure,
            questSuccess: '',
            questFailure: '',
            questDesc: quest.questDesc,
            questStory: ''
          }
          var untilDate = new Date( );
          untilDate.setDate(untilDate.getDate(quest.questActive) + 6)

          if( quest.questActive <= date) {
            questObj.questStory = quest.questStory
          }
          if( quest.questActive <= date && date <= untilDate.toISOString()) {
            questObj.isActive = true;
          }
          var members = 1
          var repeats = 1
          if(quest.questScope == 1) {
            members = memberCount(quest.groupID)
          } 
          
          if(quest.questRepeat == 2) {
            repeats = quest.questDays
          }
          var total = quest.amount * members * repeats
          var progress = quest.activity.reduce(function (total, value) {
            if (!isNaN(parseFloat(value.amount)) && isFinite(value.amount)) {
              return total + parseInt(value.amount)
            } else {
              return total
            }
          }, 0)
          questObj.progress = Math.round(progress / total * 100)
          if ( questObj.progress >= 100) {
            questObj.progress = 100
            questObj.questSuccess = quest.questSuccess
          } else if ( date >= untilDate.toISOString( )) {
            questObj.questFailure = quest.questFailure
          }
          // TODO: Check personal status      
          quests.push(questObj);
        } 

      });
      return callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          quests: quests
        })
      });
    }
  };
  dynamoDb.scan(params, onScan);
};

module.exports.postQuest = (event, context, callback) => {
  setUserInfo(event) 
  const requestBody = JSON.parse(event.body);
  submitQuest(questData(requestBody))
    .then(res => {
      callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          message: 'Sucessfully submitted quest activity',
          candidateId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit quest activity`
        })
      })
    });
};

const submitQuest = quest => {
  console.log('Submitting quest');
  const date = new Date().toISOString();
  const questInfo = {
    TableName: process.env.QUEST_TABLE,
    Key: {
      questID: quest.questID,
      groupID: quest.groupID
    },
    UpdateExpression: "SET activity = list_append(activity, :activity)",
    ExpressionAttributeValues: {
      ":activity": [{user: user, amount: quest.activity, date: date }]
    },
    ReturnValues: "UPDATED_NEW"
  };
  // TODO: add individual activity record

  return dynamoDb.update(questInfo).promise().then(res => quest);
};

const questData = (requestBody) => {
  //if (typeof questname !== 'string' || typeof questtype !== 'string' || typeof amount !== 'number') {
    //console.error('Validation Failed');
    //return new Error('Couldn\'t submit quest data because of validation errors.');
  //}

  const date = new Date().toISOString();

  return {
    questID: requestBody.questID,
    groupID: requestBody.groupID,
    date: date,
    user: user,
    activity: requestBody.questActivity,
  };
};

module.exports.getAchievements = (event, context, callback) => {
  setUserInfo(event) 
  var date = new Date().toISOString();

  var params = {
    TableName: process.env.ACHIEVEMENT_TABLE,
    ScanIndexForward: false,
  };

  console.log("Scanning achievement table.");
  const onScan = (err, data) => {
    if (err) {
      console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
      callback(err);
    } else {
      console.log("Scan succeeded.");
      var achievements = new Array()
      data.Items.forEach((achievement, index) => {
        if( achievement.achievementPublish <= date) {
          var achievementObj = {
            achievementID: achievement.achievementID,
            achievementType: achievement.type,
            name: achievement.name,
            achievementMeasure: achievement.achievementMeasure,
            achievementDesc: achievement.achievementDesc,
          }

          if( achievement.achievementActive <= date && date <= achievement.achievementActiveEnd) {
            achievementObj.isActive = true;
          }
          achievementObj.level = 2
          achievementObj.progress = 35
          
          // TODO: Check personal status      
          // TODO: progress and level completion
          achievements.push(achievementObj);

        } 

      });
      return callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          achievements: achievements
        })
      });
    }
  };
  dynamoDb.scan(params, onScan);
};
/*
module.exports.postQuest = (event, context, callback) => {
  setUserInfo(event) 
  const requestBody = JSON.parse(event.body);
  submitQuest(questData(requestBody))
    .then(res => {
      callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          message: 'Sucessfully submitted quest activity',
          candidateId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit quest activity`
        })
      })
    });
};

const submitQuest = quest => {
  console.log('Submitting quest');
  const date = new Date().toISOString();
  const questInfo = {
    TableName: process.env.QUEST_TABLE,
    Key: {
      questID: quest.questID,
      groupID: quest.groupID
    },
    UpdateExpression: "SET activity = list_append(activity, :activity)",
    ExpressionAttributeValues: {
      ":activity": [{user: user, amount: quest.activity, date: date }]
    },
    ReturnValues: "UPDATED_NEW"
  };
  // TODO: add individual activity record

  return dynamoDb.update(questInfo).promise().then(res => quest);
};

const questData = (requestBody) => {
  //if (typeof questname !== 'string' || typeof questtype !== 'string' || typeof amount !== 'number') {
    //console.error('Validation Failed');
    //return new Error('Couldn\'t submit quest data because of validation errors.');
  //}

  const date = new Date().toISOString();

  return {
    questID: requestBody.questID,
    groupID: requestBody.groupID,
    date: date,
    user: user,
    activity: requestBody.questActivity,
  };
};
*/


const submitExercise = exercise => {
  console.log('Submitting exercise');
  const exerciseInfo = {
    TableName: process.env.EXERCISE_TABLE,
    Item: exercise,
  };
  return dynamoDb.put(exerciseInfo).promise()
    .then(res => exercise);
};

const exerciseData = (exercisename, exercisetype, amount, note, modifier, date) => {
  // TODO should modifier affect activity too?
  updateActivity(amount, date)
    .then(res => {
      console.log("Activity updated.");
    })
    .catch(err => {
      console.log("Updating activity failed:", err);
    });

/* TODO: Levels will be enabled on 1.3
  updateLevels(amount, exercisename)
    .then(res => {
      console.log("Levels updated.");
    })
    .catch(err => {
      console.log("Updating levels failed:", err);
    });
*/
  const timestamp = new Date().getTime();
  if ( note == '') {
    note = ' ';
  }
  return {
    userID: user,
    date: date,
    exercisename: exercisename,
    exercisetype: exercisetype,
    amount: amount,
    updatedAt: timestamp,
    note: note,
    modifier: modifier
  };
};

const updateActivity = (amount, date) => {
  date = date.substr(0, 10);
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
  const levelInfo = {
    TableName: process.env.USER_TABLE,
    Key: {
      userID: user,
    },
    UpdateExpression: "SET #level.#element = #level.#element + :amount",
    ExpressionAttributeNames: {
      "#level": "level",
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
    Lihaskunto: "fire",
    Kestävyys: "earth",
    Ketteryys: "water",
    Kehonhuolto: "air",
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

  return dynamoDb.get(params, onScan).promise();
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
      group: 0,
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

const setUserInfo = event => {
  const pubKey = `-----BEGIN CERTIFICATE-----
MIIDCTCCAfGgAwIBAgIJSnIFajlclSxIMA0GCSqGSIb3DQEBCwUAMCIxIDAeBgNV
BAMTF2FyY3RpY2xvb24uZXUuYXV0aDAuY29tMB4XDTE3MTIwNjEwNTAwNFoXDTMx
MDgxNTEwNTAwNFowIjEgMB4GA1UEAxMXYXJjdGljbG9vbi5ldS5hdXRoMC5jb20w
ggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDkX7IPRIaFSHnhKXgSbpbY
lyE6nHsYFlh0H2O7XAlcZJCyaj+fjLnQlxODuEnOTaKoSJ8L5FZ4o2wWL/AX1TJo
OfiCsduW/J2hL4kfzAz8XNdwAKlehupLHcsAL8WXwcvkp2SLPAicKB3OFnHx2pkY
4qr6eqeqD2zF4pUR+iOliu38KZtiu/AYTLVfvS0CLwcacT1wf/3JAoffJAM74Roe
Ynycca/2JQqLRcxB3Sl1JAOpHAqx6+AiT95UCyjUynuUFoXu/LzQ4l8YgYulAgU3
L5iwLmzMBBkB5dbk9ZHSSVZG7ajNyK8J6aoMcmFGPn3XQsMYsIT1ZJ+qAR4P9c2D
AgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFFatn+dezvf/gDfA
rnJkOK1XGAJgMA4GA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEAbDo7
e4pmPgmRmp2vg9exLLE11l4Cd1SNyNCZdsUZYnoykUsh6AjGyjP4j5jnIG4fJcvP
GZhLOVuUjTQ+I051jLiTc22se70TBnkQRe0kA5JCEyUOMMh9yE43gFQB4Xgma174
Ds4dOQYJqLYlmduaVdEotGWH1cPESzQhdG/Rj92dZT8MCCcQgWOmIWLdCZirxvT+
XHpij2FyOMscbKxpJ0XorMUvdezkdhRWRX3FXKSlHThPYkzUWnxRkt+PSpUuVFA/
mBuJxeQ0+UXroBVygxgDSmIYdqZ2pvYDdZBPA0oRVKsWjhXucFBm86Huw01yPm/+
0ZowFWWHPSGDAnPROw== \ 
-----END CERTIFICATE-----`;

  userInfo = jwt.verify(event.headers['Authorization'].substr(7), pubKey, { algorithms: ['RS256'] });
  user = userInfo.email;
}

const memberCount = (groupID) => {
  const groups = [{
      value: 'Kekäle',
      members: 5 
    }, {
      value: 'Kvantti',
      members: 3
    }, {
      value: 'Loharit',
      members: 9
    }, {
      value: 'Lopparit',
      members: 9
    }, {
      value: 'Manse',
      members: 7
    }, {
      value: 'Pöllöt',
      members: 4 
    }, {
      value: 'Tammi',
      members: 6
    }, {
      value: 'Karhut',
      members: 5
    }, {
      value: 'Iku',
      members: 5
    }, {
      value: 'Mekanistit',
      members: 8
    }, {
      value: 'Yhteinen',
      members: 61
    }
  ] 
  return groups.find(group => { return group.value === groupID }).members 
}
