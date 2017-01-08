document.addEventListener('DOMContentLoaded', () => {
	const moment = require('moment')
	const leaflet = require('leaflet')

	const FlightData = require('./apis/flight_data')

	const AirborneMap = require('./objects/map')
	const AirborneFlight = require('./objects/flight')
	const AirborneFlightMarker = require('./objects/flight_marker')

	const appMap = new AirborneMap('app-map')
	let plottedFlights = new leaflet.FeatureGroup()

	const plotFlights = () => {
		const newFlightLayer = new leaflet.FeatureGroup()

		FlightData.getAll((response) => {
			const dataTimestamp = moment.unix(response.time).format('MMMM Do YYYY, h:mm:ss a')
			console.log(`${response.states.length} flights updated ${dataTimestamp}`)

			let plotCount = 0

			for (let i = 0; i < response.states.length; i++) {
				let flight = new AirborneFlight(response.states[i])
				if (!flight.isPlottable || flight.onGround) { continue; }

				let marker = new AirborneFlightMarker(flight)

				newFlightLayer.addLayer(marker)

				plotCount++
			}

			appMap.removeLayer(plottedFlights)
			appMap.addLayer(newFlightLayer)
			plottedFlights = newFlightLayer

			console.log(`Plotted ${plotCount} flights`);

			setTimeout(plotFlights, 10000)
		})
	}

	plotFlights()
});
