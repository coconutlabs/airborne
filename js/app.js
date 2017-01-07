(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = null;
    hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("apis/coordinates.js", function(exports, require, module) {
'use strict';

var superagent = require('superagent');
var jsonp = require('superagent-jsonp');

var getFromIp = function getFromIp(callback) {
  superagent.get('//freegeoip.net/json').use(jsonp).end(function (error, response) {
    if (!response) {
      return callback({ error: error });
    }

    var _response$body = response.body,
        latitude = _response$body.latitude,
        longitude = _response$body.longitude;


    callback({ lat: latitude, long: longitude });
  });
};

module.exports = {
  getFromIp: getFromIp
};
});

;require.register("apis/flight_data.js", function(exports, require, module) {
'use strict';

var superagent = require('superagent');

var openSkyApiUrl = 'https://cors-anywhere.herokuapp.com/opensky-network.org/api';

var getAll = function getAll(callback) {
  return superagent.get(openSkyApiUrl + '/states/all').end(function (error, response) {
    callback(response.body);
  });
};

module.exports = {
  getAll: getAll
};
});

;require.register("initialize.js", function(exports, require, module) {
'use strict';

document.addEventListener('DOMContentLoaded', function () {
	var moment = require('moment');
	var leaflet = require('leaflet');

	var FlightData = require('./apis/flight_data');

	var AirborneMap = require('./objects/map');
	var AirborneFlight = require('./objects/flight');
	var AirborneFlightMarker = require('./objects/flight_marker');

	var appMap = new AirborneMap('app-map');

	var allFlights = [];

	FlightData.getAll(function (response) {
		console.log(response.states.length + ' flights updated ' + moment.unix(response.time).format('dddd, MMMM Do YYYY, h:mm:ss a'));

		for (var i = 0; i < response.states.length; i++) {
			var flight = new AirborneFlight(response.states[i]);
			if (!flight.isPlottable) {
				continue;
			}

			var marker = new AirborneFlightMarker(flight);
			marker.addTo(appMap);

			allFlights.push(flight);
		}

		console.log('Plotted ' + allFlights.length + ' flights');
	});
});
});

require.register("objects/flight.js", function(exports, require, module) {
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function Flight(stateVector) {
    _classCallCheck(this, Flight);

    // See https://opensky-network.org/apidoc/rest.html#response
    var _stateVector = _slicedToArray(stateVector, 13),
        icao24 = _stateVector[0],
        callsign = _stateVector[1],
        origin_country = _stateVector[2],
        time_position = _stateVector[3],
        time_velocity = _stateVector[4],
        longitude = _stateVector[5],
        latitude = _stateVector[6],
        altitude = _stateVector[7],
        on_ground = _stateVector[8],
        velocity = _stateVector[9],
        heading = _stateVector[10],
        vertical_rate = _stateVector[11],
        sensors = _stateVector[12];

    this.icao24 = icao24; // string
    this.callsign = callsign; // string
    this.originCountry = origin_country; // string
    this.timePosition = time_position; // unix timestamp (seconds)
    this.timeVelocity = time_velocity; // unix timestamp (seconds)
    this.longitude = longitude; // float
    this.latitude = latitude; // float
    this.altitude = altitude; // int (meters)
    this.onGround = on_ground; // boolean
    this.velocity = velocity; // (meters/second)
    this.heading = heading; // float
    this.verticalRate = vertical_rate; // (meters/second)
    this.sensors = sensors; // array of ids
  }

  _createClass(Flight, [{
    key: "mph",
    get: function get() {
      return this.velocity * 2.23694;
    }
  }, {
    key: "kph",
    get: function get() {
      return this.velocity * 3.6;
    }
  }, {
    key: "verticalFps",
    get: function get() {
      return this.verticalRate * 3.28084;
    }
  }, {
    key: "verticalMps",
    get: function get() {
      return this.verticalRate;
    }
  }, {
    key: "isPlottable",
    get: function get() {
      return this.longitude && this.latitude;
    }
  }]);

  return Flight;
}();
});

;require.register("objects/flight_marker.js", function(exports, require, module) {
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var leaflet = require('leaflet');

var airplaneIcon = leaflet.icon({
  iconUrl: './img/airplane@2x.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -5]
});

module.exports = function (_leaflet$Marker) {
  _inherits(AirborneFlightMarker, _leaflet$Marker);

  function AirborneFlightMarker(flight) {
    _classCallCheck(this, AirborneFlightMarker);

    var _this = _possibleConstructorReturn(this, (AirborneFlightMarker.__proto__ || Object.getPrototypeOf(AirborneFlightMarker)).call(this, [flight.latitude, flight.longitude], {
      icon: airplaneIcon,
      title: flight.callsign
    }));

    _this.flight = flight;
    return _this;
  }

  return AirborneFlightMarker;
}(leaflet.Marker);
});

;require.register("objects/map.js", function(exports, require, module) {
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var leaflet = require('leaflet');
var coordinates = require('../apis/coordinates');

var cartoLightServer = {
  url: '//cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}@2x.png',
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, ' + '&copy; <a href="https://carto.com/attribution">CARTO</a>'
};

var tileLayerForServer = function tileLayerForServer(tileServer) {
  var url = tileServer.url,
      attribution = tileServer.attribution;


  return new leaflet.TileLayer(url, { minZoom: 4, maxZoom: 12, attribution: attribution });
};

module.exports = function (_leaflet$Map) {
  _inherits(AirborneMap, _leaflet$Map);

  function AirborneMap(domElement) {
    _classCallCheck(this, AirborneMap);

    var _this = _possibleConstructorReturn(this, (AirborneMap.__proto__ || Object.getPrototypeOf(AirborneMap)).call(this, domElement));

    _this.addLayer(tileLayerForServer(cartoLightServer));
    setTimeout(function () {
      _this.invalidateSize();
    }, 0);

    coordinates.getFromIp(function (coordinates) {
      var lat = coordinates.lat,
          long = coordinates.long;

      var location = void 0;

      if (!lat || !long) {
        location = new leaflet.LatLng(39.8333333, -98.585522); // US Center
      } else {
        location = new leaflet.LatLng(lat, long);
      }

      _this.setView(location, 6);
    });
    return _this;
  }

  return AirborneMap;
}(leaflet.Map);
});

;require.alias("brunch/node_modules/buffer/index.js", "buffer");require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map