const superagent = require('superagent')
const jsonp = require('superagent-jsonp')

const getFromIp = (callback) => {
  superagent.get('//freegeoip.net/json')
  .use(jsonp)
  .end((error, response) => {
    if (!response) { return callback({ error }) }

    const { body: { latitude, longitude } } = response

    callback({ lat: latitude, long: longitude })
  })
}

module.exports = {
  getFromIp
}
