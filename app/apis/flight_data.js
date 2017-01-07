const superagent = require('superagent')

const openSkyApiUrl = 'https://cors-anywhere.herokuapp.com/opensky-network.org/api'

const getAll = (callback) =>
  superagent.get(`${openSkyApiUrl}/states/all`)
  .end((error, response) => {
    callback(response.body)
  })

module.exports = {
  getAll
}
