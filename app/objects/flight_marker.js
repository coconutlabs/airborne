const leaflet = require('leaflet')
require('leaflet-rotatedmarker')

const airplaneIcon = leaflet.icon({
    iconUrl: './img/airplane@2x.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -5]
})

const tooltipHtml = (flight, unit) => {
  let flightIdentifier, speed, altitude

  flightIdentifier =
    flight.callsign ?
    `Flight ${flight.callsign}` :
    'Unidentified Flight'
  speed =
    unit == 'metric' ?
    `${Math.round(flight.kph)} kph` :
    `${Math.round(flight.mph)} mph`
  altitude =
    unit == 'metric' ?
    `${Math.round(flight.altitudeM)} m` :
    `${Math.round(flight.altitudeFt)} ft`

  return `<strong>${flightIdentifier}</strong><br />` +
  `Speed: <strong>${speed}</strong><br />` +
  `Altitude: <strong>${altitude}</strong>`
}

module.exports = class AirborneFlightMarker extends leaflet.Marker {
  constructor(flight) {
    super([ flight.latitude, flight.longitude ], {
      icon: airplaneIcon,
      title: flight.callsign,
      rotationAngle: Math.round(flight.heading),
      rotationOrigin: 'center center'
    })
    .bindTooltip(tooltipHtml(flight))

    this.flight = flight
  }
}
