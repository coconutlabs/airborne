document.addEventListener('DOMContentLoaded', () => {
	const moment = require('moment')
	const leaflet = require('leaflet')

	const FlightData = require('./apis/flight_data')

	const AirborneMap = require('./objects/map')
	const AirborneFlight = require('./objects/flight')
	const AirborneFlightMarker = require('./objects/flight_marker')

	const appMap = new AirborneMap('app-map')

	let allFlights = []

	FlightData.getAll((response) => {
		console.log(`${response.states.length} flights updated ${moment.unix(response.time).format('dddd, MMMM Do YYYY, h:mm:ss a')}`)

		for (var i = 0; i < response.states.length; i++) {
			let flight = new AirborneFlight(response.states[i])
			if (!flight.isPlottable) { continue; }

			let marker = new AirborneFlightMarker(flight)
			marker.addTo(appMap)

			allFlights.push(flight)
		}

		console.log(`Plotted ${allFlights.length} flights`);
	})
});
