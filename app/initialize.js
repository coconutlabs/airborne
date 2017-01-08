document.addEventListener('DOMContentLoaded', () => {
	const _ = require('lodash')
	const moment = require('moment')
	const leaflet = require('leaflet')

	const FlightData = require('./apis/flight_data')

	const AirborneMap = require('./objects/map')
	const AirborneFlight = require('./objects/flight')
	const AirborneFlightMarker = require('./objects/flight_marker')

	const appMap = new AirborneMap('app-map')

	let flightLayer = new leaflet.FeatureGroup()
	appMap.addLayer(flightLayer)

	const plottedFlights = {}

	const plotFlights = () => {
		FlightData.getAll((response) => {
			const dataTimestamp = moment.unix(response.time).format()
			console.log(`${response.states.length} flights updated ${dataTimestamp}`)

			let plotCount = 0

			for (let i = 0; i < response.states.length; i++) {
				let flight = new AirborneFlight(response.states[i])
				let plottedFlight = plottedFlights[flight.icao24]

				if (!flight.isPlottable || flight.onGround) {
					if (plottedFlight) {
						flightLayer.removeLayer(plottedFlight.marker)
						delete plottedFlights[flight.icao24]
					}
					continue;
				}

				let marker = new AirborneFlightMarker(flight)

				if (plottedFlight) flightLayer.removeLayer(plottedFlight.marker)
				flightLayer.addLayer(marker)

				plottedFlights[flight.icao24] = { flight, marker }

				plotCount++
			}

			console.log(`Plotted ${plotCount} flights`);

			cleanUpOldData()

			setTimeout(plotFlights, 10000)
		})
	}

	const cleanUpOldData = () => {
		const timeCutoff = moment().subtract(5, 'minutes').unix()

		_.each(plottedFlights, (data, identifier) => {
			const { flight } = data
			if (flight.timePosition < timeCutoff) { delete plottedFlights[identifier] }
		})
	}

	plotFlights()
});
