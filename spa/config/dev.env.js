var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_BASE_URL: '"https://7u4yroqy10.execute-api.eu-west-1.amazonaws.com/dev"'
})
