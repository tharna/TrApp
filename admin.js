'use strict'

const uuid = require('uuid')
const AWS = require('aws-sdk') 
const jwt = require('jsonwebtoken')

AWS.config.setPromisesDependency(require('bluebird'))

const dynamoDb = new AWS.DynamoDB.DocumentClient()

var user = ''
var userInfo = {}


module.exports.listQuests = (event, context, callback) => {
  if(!setUserInfo(event)) {
    console.error('Authentication Failed')
    callback(new Error('You are unauthorized to perform this action.'))
    return
  }
  var params = {
    TableName: process.env.QUEST_TABLE,
    ScanIndexForward: false
  }

  console.log('Scanning quest table.')
  const onScan = (err, data) => {
    if (err) {
      console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2))
      callback(err)
    } else {
      console.log('Scan succeeded.')
      data.Items.forEach((quest, index) => {
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
        data.Items[index].progress = Math.round(progress / total * 100)
      })

      return callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          quests: data.Items
        })
      })
    }
  }
  dynamoDb.scan(params, onScan)
}

module.exports.addQuest = (event, context, callback) => {
  if(!setUserInfo(event)) {
    console.error('Authentication Failed')
    callback(new Error('You are unauthorized to perform this action.'))
    return
  }
  const requestBody = JSON.parse(event.body)

  submitQuest(questData(requestBody))
    .then(res => {
      callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Sucessfully added new quest.',
        })
      })
    })
    .catch(err => {
      console.log(err)
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Unable to submit quest'
        })
      })
    })

}

module.exports.updateQuest = (event, context, callback) => {
  if(!setUserInfo(event)) {
    console.error('Authentication Failed')
    callback(new Error('You are unauthorized to perform this action.'))
    return
  }
  const requestBody = JSON.parse(event.body)

  saveQuest(questData(requestBody))
    .then(res => {
      if( requestBody.questGroup != requestBody.questGroupOld) {

        var params = {
          TableName: process.env.QUEST_TABLE,
          Key:{
            'questID': requestBody.questID,
            'groupID': requestBody.questGroupOld
          }
        }
        dynamoDb.delete(params).promise()
          .then(res => {
          })
          .catch(err => {
            console.log(err)
            callback(null, {
              statusCode: 500,
              body: JSON.stringify({
                message: 'Unable to update quest'
              })
            })
          })
      }

      callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Sucessfully updated quest.',
        })
      })
    })
    .catch(err => {
      console.log(err)
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Unable to update quest'
        })
      })
    })

}
module.exports.deleteQuest = (event, context, callback) => {
  if(!setUserInfo(event)) {
    console.error('Authentication Failed')
    callback(new Error('You are unauthorized to perform this action.'))
    return
  }
  const requestBody = JSON.parse(event.body)
  var params = {
    TableName: process.env.QUEST_TABLE,
    Key:{
      'questID':requestBody.questID,
      'groupID':requestBody.questGroup
    }
  }
  dynamoDb.delete(params).promise()
    .then(res => {
      callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Sucessfully deleted quest.',
        })
      })
    }).catch(err => {
      console.log(err)
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Unable to delete quest'
        })
      })
    })
}


const submitQuest = quest => {
  console.log('Submitting quest')
  const questInfo = {
    TableName: process.env.QUEST_TABLE,
    Item: quest,
  }
  return dynamoDb.put(questInfo).promise()
    .then(res => quest)
}

const saveQuest = quest => {
  console.log('Updating quest')

  const activity = {
    TableName: process.env.QUEST_TABLE,
    Key: {
      questID: quest.questID,
      groupID: quest.groupID
    },
    ProjectionExpression: 'activity'
  }

  return dynamoDb.get(activity).promise()
    .then(res => {
      console.log( res)
      quest.activity = res.Item.activity

      const questInfo = {
        TableName: process.env.QUEST_TABLE,
        Item: quest,
      }
      dynamoDb.put(questInfo).promise()
        .then(res => quest)
    }).catch( err => {
      console.log(err)
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Unable to quest activity'
        })
      })
    })
}


const questData = (requestBody) => {

  console.log(requestBody)        

  //if (typeof questname !== 'string' || typeof questtype !== 'string' || typeof amount !== 'number') {
  //console.error('Validation Failed');
  //return new Error('Couldn\'t submit quest data because of validation errors.');
  //}


  return {
    questID: (requestBody.questID)? requestBody.questID : uuid.v1(),
    groupID: requestBody.questGroup.toString(),
    name: requestBody.questName,
    type: requestBody.questType,
    amount: requestBody.amount,
    questDesc: (requestBody.questDesc == '')? ' ' : requestBody.questDesc,
    questSuccess: (requestBody.questSuccess == '')? ' ' : requestBody.questSuccess,
    questFailure: (requestBody.questFailure == '')? ' ' : requestBody.questFailure,
    questMeasure: (requestBody.questMeasure == '')? ' ': requestBody.questMeasure,
    questActive: requestBody.questActive,
    questPublish: requestBody.questPublish,
    questStory: (requestBody.questStory == '')? ' ' : requestBody.questStory,
    questDays: requestBody.questDays,
    questScope: requestBody.questScope,
    questRepeat: requestBody.questRepeat,
    grandQuest: requestBody.grandQuest,
    activity: [{}]
  }
  //questActive: requestBody.questActive.substr(0, 10),
  //questPublish: requestBody.questPublish.substr(0, 10)
}


// ACHIEVEMENTS

module.exports.listAchievements = (event, context, callback) => {
  if(!setUserInfo(event)) {
    console.error('Authentication Failed')
    callback(new Error('You are unauthorized to perform this action.'))
    return
  }
  var params = {
    TableName: process.env.ACHIEVEMENT_TABLE,
    ScanIndexForward: false
  }

  console.log('Scanning achievement table.')
  const onScan = (err, data) => {
    if (err) {
      console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2))
      callback(err)
    } else {
      console.log('Scan succeeded.')
      return callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          achievements: data.Items
        })
      })
    }
  }
  dynamoDb.scan(params, onScan)
}

module.exports.addAchievement = (event, context, callback) => {
  if(!setUserInfo(event)) {
    console.error('Authentication Failed')
    callback(new Error('You are unauthorized to perform this action.'))
    return
  }
  const requestBody = JSON.parse(event.body)

  submitAchievement(achievementData(requestBody))
    .then(res => {
      callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Sucessfully added new achievement.',
        })
      })
    })
    .catch(err => {
      console.log(err)
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Unable to submit achievement'
        })
      })
    })

}

module.exports.updateAchievement = (event, context, callback) => {
  if(!setUserInfo(event)) {
    console.error('Authentication Failed')
    callback(new Error('You are unauthorized to perform this action.'))
    return
  }
  const requestBody = JSON.parse(event.body)

  saveAchievement(achievementData(requestBody))
    .then(res => {
      callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Sucessfully updated achievement.',
        })
      })
    })
    .catch(err => {
      console.log(err)
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Unable to update achievement'
        })
      })
    })

}

module.exports.deleteAchievement = (event, context, callback) => {
  if(!setUserInfo(event)) {
    console.error('Authentication Failed')
    callback(new Error('You are unauthorized to perform this action.'))
    return
  }
  const requestBody = JSON.parse(event.body)
  var params = {
    TableName: process.env.ACHIEVEMENT_TABLE,
    Key:{
      'achievementID':requestBody.achievementID,
    }
  }
  dynamoDb.delete(params).promise()
    .then(res => {
      callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Sucessfully deleted achievement.',
        })
      })
    }).catch(err => {
      console.log(err)
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Unable to delete achievement'
        })
      })
    })
}

module.exports.getAchievementActivity = (event, context, callback) => {
  if(!setUserInfo(event)) {
    console.error('Authentication Failed')
    callback(new Error('You are unauthorized to perform this action.'))
    return
  }
 
  var achievementID = event.pathParameters.achievementID
  var params = {
    TableName: process.env.ACHIEVEMENT_ACTIVITY_TABLE,
    FilterExpression: 'achievementID = :achievementID',
    ExpressionAttributeValues: {
      ':achievementID': achievementID,
    },
  }

  const onScan = (err, data) => {
    if (err) {
      console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2))
      callback(err)
    } else {
      console.log('Scan succeeded.')
      console.log(data)
      getAchievement(achievementID).then(res => {
/*        var achievements = new Array()
        data.Items.forEach((activity, index) => {

            if (userAchievement = res.Items.find(item => { return item.achievementID === achievementObj.achievementID })) {
              achievementObj.activity = userAchievement.activity

              if ( achievement.type == 1) {
                achievementObj.level = userAchievement.activity
                switch ( achievementObj.level) {
                  case 1:
                  achievementObj.currentLevelDesc = achievement.achievementLVL2
                    break
                  case 2:
                  achievementObj.currentLevelDesc = achievement.achievementLVL3
                    break
                  case 3:
                  achievementObj.currentLevelDesc = achievement.achievementLVL4
                    break
                  case 4:
                  achievementObj.currentLevelDesc = achievement.achievementLVL5
                    break
                  case 5:
                  achievementObj.currentLevelDesc = "Maksimitaso saavutettu"
                    break

                }
              } else {
                var next = achievementObj.achievementLVL1amount
                if ( achievement.type == 3) {
                  achievementObj.bestStreak = userAchievement.streak
                  achievementObj.activity = userAchievement.activity
                  if ( userAchievement.date == date.substr( 0, 10)) {
                    achievementObj.today = 1
                  }
                }
                next = achievement.achievementLVL1amount
                if ( achievementObj.activity >= parseInt(achievement.achievementLVL1amount)) {
                  achievementObj.level++
                  next = achievement.achievementLVL2amount
                  achievementObj.currentLevelDesc = achievement.achievementLVL2
                }
                if ( achievementObj.activity >= parseInt(achievement.achievementLVL2amount)) {
                  achievementObj.level++
                  next = achievement.achievementLVL3amount
                  achievementObj.currentLevelDesc = achievement.achievementLVL3
                }
                if ( achievementObj.activity >= parseInt(achievement.achievementLVL3amount)) {
                  achievementObj.level++
                  next = achievement.achievementLVL4amount
                  achievementObj.currentLevelDesc = achievement.achievementLVL4
                }
                if ( achievementObj.activity >= parseInt(achievement.achievementLVL4amount)) {
                  achievementObj.level++
                  next = achievement.achievementLVL5amount
                  achievementObj.currentLevelDesc = achievement.achievementLVL5
                }
                if ( achievementObj.activity >= parseInt(achievement.achievementLVL5amount)) {
                  achievementObj.level++
                  next = achievementObj.activity
                }
                achievementObj.progress = Math.round(achievementObj.activity / parseInt(next) * 100)
              }
            }

            achievements.push(achievementObj)

          } 
*/
        })
        return callback(null, {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            activity: ''
            })
          })
      }
    }

    
  dynamoDb.scan(params, onScan)
}
module.exports.getAchievementsByUser = (event, context, callback) => {
  if(!setUserInfo(event)) {
    console.error('Authentication Failed')
    callback(new Error('You are unauthorized to perform this action.'))
    return
  }
  var userID = event.pathParameters.userID

  var params = {
    TableName: process.env.ACHIEVEMENT_TABLE,
    ScanIndexForward: false,
  }

  console.log('Scanning achievement table.')
  const onScan = (err, data) => {
    if (err) {
      console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2))
      callback(err)
    } else {
      console.log('Scan succeeded.')
      getUserAchievements(userID).then(res => {

        var achievements = new Array()
        data.Items.forEach((achievement, index) => {
            var userAchievement = {}
            var achievementObj = {
              achievementID: achievement.achievementID,
              achievementType: achievement.type,
              name: achievement.name,
              achievementMeasure: achievement.achievementMeasure,
              achievementDesc: achievement.achievementDesc,
              lvl1Desc: achievement.achievementLVL1,
              lvl2Desc: achievement.achievementLVL2,
              lvl3Desc: achievement.achievementLVL3,
              lvl4Desc: achievement.achievementLVL4,
              lvl5Desc: achievement.achievementLVL5,
              currentLevelDesc: achievement.achievementLVL1,
              level: 0,
              progress: 0,
              today: 0
            }


            if (userAchievement = res.Items.find(item => { return item.achievementID === achievementObj.achievementID })) {
              achievementObj.activity = userAchievement.activity

              if ( achievement.type == 1) {
                achievementObj.level = userAchievement.activity
                switch ( achievementObj.level) {
                  case 1:
                  achievementObj.currentLevelDesc = achievement.achievementLVL2
                    break
                  case 2:
                  achievementObj.currentLevelDesc = achievement.achievementLVL3
                    break
                  case 3:
                  achievementObj.currentLevelDesc = achievement.achievementLVL4
                    break
                  case 4:
                  achievementObj.currentLevelDesc = achievement.achievementLVL5
                    break
                  case 5:
                  achievementObj.currentLevelDesc = "Maksimitaso saavutettu"
                    break

                }
              } else {
                var next = achievementObj.achievementLVL1amount
                if ( achievement.type == 3) {
                  achievementObj.bestStreak = userAchievement.streak
                  achievementObj.activity = userAchievement.activity
                }
                next = achievement.achievementLVL1amount
                if ( achievementObj.activity >= parseInt(achievement.achievementLVL1amount)) {
                  achievementObj.level++
                  next = achievement.achievementLVL2amount
                  achievementObj.currentLevelDesc = achievement.achievementLVL2
                }
                if ( achievementObj.activity >= parseInt(achievement.achievementLVL2amount)) {
                  achievementObj.level++
                  next = achievement.achievementLVL3amount
                  achievementObj.currentLevelDesc = achievement.achievementLVL3
                }
                if ( achievementObj.activity >= parseInt(achievement.achievementLVL3amount)) {
                  achievementObj.level++
                  next = achievement.achievementLVL4amount
                  achievementObj.currentLevelDesc = achievement.achievementLVL4
                }
                if ( achievementObj.activity >= parseInt(achievement.achievementLVL4amount)) {
                  achievementObj.level++
                  next = achievement.achievementLVL5amount
                  achievementObj.currentLevelDesc = achievement.achievementLVL5
                }
                if ( achievementObj.activity >= parseInt(achievement.achievementLVL5amount)) {
                  achievementObj.level++
                  next = achievementObj.activity
                }
                achievementObj.progress = Math.round(achievementObj.activity / parseInt(next) * 100)
              }
            }

            achievements.push(achievementObj)

        })

        return callback(null, {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            achievements: achievements.sort(function( a,b) {
              if (typeof(a.activity) !== 'undefined') return -1
              if (typeof(b.activity) !== 'undefined') return 1
              if (a.activity < b.activity) return -1
              if (a.activity > b.activity) return 1

            })
          })
        })
      })
    }
  }
  dynamoDb.scan(params, onScan)
}
const getUserAchievements = (userID) => {
  var params = {
    TableName: process.env.ACHIEVEMENT_ACTIVITY_TABLE,
    KeyConditionExpression: 'userID = :user',
    ExpressionAttributeValues: {
      ':user': userID
    },
  }

  console.log('Scanning achievement activity table.')
  const onScan = (err, data) => {

    if (err) {
      console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2))
      callback(err)
    } else {
      console.log('Scan succeeded.')
      return data.Items
    }
  }

  return dynamoDb.query(params, onScan).promise()
}


const submitAchievement = achievement => {
  console.log('Submitting achievement')
  console.log(achievement)
  const achievementInfo = {
    TableName: process.env.ACHIEVEMENT_TABLE,
    Item: achievement,
  }
  return dynamoDb.put(achievementInfo).promise()
    .then(res => achievement)
}

const saveAchievement = achievement => {
  console.log('Updating achievement')

  const achievementInfo = {
    TableName: process.env.ACHIEVEMENT_TABLE,
    Item: achievement,
  }
  return dynamoDb.put(achievementInfo).promise()
    .then(res => achievement)
}


const achievementData = (requestBody) => {

  console.log(requestBody)        

  //if (typeof questname !== 'string' || typeof questtype !== 'string' || typeof amount !== 'number') {
  //console.error('Validation Failed');
  //return new Error('Couldn\'t submit quest data because of validation errors.');
  //}


  return {
    achievementID: (requestBody.achievementID)? requestBody.achievementID : uuid.v1(),
    name: requestBody.achievementName,
    type: requestBody.achievementType,
    achievementDesc: (requestBody.achievementDesc == '')? ' ' : requestBody.achievementDesc,
    achievementMeasure: (requestBody.achievementMeasure == '')? ' ' : requestBody.achievementMeasure,
    achievementLVL1: (requestBody.achievementLVL1 == '')? ' ' : requestBody.achievementLVL1,
    achievementLVL2: (requestBody.achievementLVL2 == '')? ' ' : requestBody.achievementLVL2,
    achievementLVL3: (requestBody.achievementLVL3 == '')? ' ' : requestBody.achievementLVL3,
    achievementLVL4: (requestBody.achievementLVL4 == '')? ' ' : requestBody.achievementLVL4,
    achievementLVL5: (requestBody.achievementLVL5 == '')? ' ' : requestBody.achievementLVL5,
    achievementLVL1amount: (requestBody.achievementLVL1amount == '')? ' ' : requestBody.achievementLVL1amount,
    achievementLVL2amount: (requestBody.achievementLVL2amount == '')? ' ' : requestBody.achievementLVL2amount,
    achievementLVL3amount: (requestBody.achievementLVL3amount == '')? ' ' : requestBody.achievementLVL3amount,
    achievementLVL4amount: (requestBody.achievementLVL4amount == '')? ' ' : requestBody.achievementLVL4amount,
    achievementLVL5amount: (requestBody.achievementLVL5amount == '')? ' ' : requestBody.achievementLVL5amount,
    achievementActive: requestBody.achievementActive,
    achievementActiveEnd: requestBody.achievementActiveEnd,
    achievementPublish: requestBody.achievementPublish
  }
}

module.exports.getUserActivity = (event, context, callback) => {
  if(!setUserInfo(event)) {
    console.error('Authentication Failed')
    callback(new Error('You are unauthorized to perform this action.'))
    return
  }
  var params = {
    TableName: process.env.USER_TABLE,
    ScanIndexForward: false
  }

  console.log('Scanning activity table.')
  const onScan = (err, data) => {
    if (err) {
      console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2))
      callback(err)
    } else {
      console.log('Scan succeeded.')
      /*var users = {}
      data.Items.forEach((activity, index) => {
        users[activity.userID] = ( typeof(users[activity.userID]) !== 'undefined') ? users[activity.userID] + activity.total : activity.total
      })
      console.log( users)
      var userData = new Array( )
      Object.keys(users).forEach((item, index) => {
        userData.push({ user: item, total: users[item]})
      })
      */
      data.Items.forEach((user, index) => {
        user.total = user.level.air + user.level.earth + user.level.fire + user.level.water
      })
      return callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          users: data.Items
        })
      })
    }
  }
  dynamoDb.scan(params, onScan)
}

const getAchievement = (achievementID) => {
  var params = {
    TableName: process.env.ACHIEVEMENT_TABLE,
    KeyConditionExpression: 'achievementID = :achievementID',
    ExpressionAttributeValues: {
      ':achievementID': achievementID
    },
  }

  console.log('Scanning achievement activity table.')
  const onScan = (err, data) => {

    if (err) {
      console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2))
      callback(err)
    } else {
      console.log('Scan succeeded.')
      console.log( data)
      return data.Items
    }
  }

  return dynamoDb.query(params, onScan).promise()
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
-----END CERTIFICATE-----`

  userInfo = jwt.verify(event.headers['Authorization'].substr(7), pubKey, { algorithms: ['RS256'] })
  user = userInfo.email

  var auth = (userInfo['https://app.traininglarp.fi/is_admin'] == 1)
  return auth
}
const memberCount = (groupID) => {
  const groups = [{
    value: 'Ketut',
    members: 9 
  }, {
    value: 'Joutsenet',
    members: 7
  }, {
    value: 'Saukot',
    members: 7
  }, {
    value: 'Hirvet',
    members: 7
  }, {
    value: 'Ilvekset',
    members: 9
  }, {
    value: 'Jalopeurat',
    members: 7
  }, {
    value: 'Karhut',
    members: 4
  }, {
    value: 'Sudet',
    members: 7
  }, {
    value: 'Yhteinen',
    members: 61
  }, {
    value: 'NPC',
    members: 10
  }
  ] 
  return groups.find(group => { return group.value === groupID }).members 
}
