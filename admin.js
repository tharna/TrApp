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

  var auth = (userInfo['https://app.aikojentanssi.fi/group'] == 99)
  return auth
}
