const leaflet = require('leaflet')

const airplaneIcon = leaflet.icon({
    iconUrl: '/img/airplane.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -5]
})

module.exports = class AirborneFlightMarker extends leaflet.Marker {
  constructor(flight) {
    super([ flight.latitude, flight.longitude ], {
      icon: airplaneIcon,
      title: flight.callsign
    })
    this.flight = flight
  }
}
