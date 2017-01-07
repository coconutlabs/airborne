module.exports = class Flight {
  constructor(stateVector) {
    // See https://opensky-network.org/apidoc/rest.html#response
    const [
      icao24,
      callsign,
      origin_country,
      time_position,
      time_velocity,
      longitude,
      latitude,
      altitude,
      on_ground,
      velocity,
      heading,
      vertical_rate,
      sensors
    ] = stateVector

    this.icao24 = icao24 // string
    this.callsign = callsign // string
    this.originCountry = origin_country // string
    this.timePosition = time_position // unix timestamp (seconds)
    this.timeVelocity = time_velocity // unix timestamp (seconds)
    this.longitude = longitude // float
    this.latitude = latitude // float
    this.altitude = altitude // int (meters)
    this.onGround = on_ground // boolean
    this.velocity = velocity // (meters/second)
    this.heading = heading // float
    this.verticalRate = vertical_rate // (meters/second)
    this.sensors = sensors // array of ids
  }

  get mph() { return this.velocity * 2.23694 }
  get kph() { return this.velocity * 3.6 }

  get verticalFps() { return this.verticalRate * 3.28084 }
  get verticalMps() { return this.verticalRate }

  get isPlottable() { return this.longitude && this.latitude }
}
