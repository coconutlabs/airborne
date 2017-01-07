const leaflet = require('leaflet')
const coordinates = require('../apis/coordinates')

const cartoLightServer = {
  url: '//cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}@2x.png',
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, ' +
    '&copy; <a href="https://carto.com/attribution">CARTO</a>'
}

const tileLayerForServer = (tileServer) => {
  const { url, attribution } = tileServer

  return new leaflet.TileLayer(url, { minZoom: 4, maxZoom: 12, attribution })
}

module.exports = class AirborneMap extends leaflet.Map {
  constructor(domElement) {
    super(domElement)

    this.addLayer(tileLayerForServer(cartoLightServer))
    setTimeout(() => { this.invalidateSize() }, 0)

    coordinates.getFromIp((coordinates) => {
      const { lat, long } = coordinates
      let location

      if (!lat || !long) {
        location = new leaflet.LatLng(39.8333333, -98.585522) // US Center
      } else {
        location = new leaflet.LatLng(lat, long)
      }

      this.setView(location, 6)
    })
  }
}
