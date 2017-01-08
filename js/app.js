!function(){"use strict";var t="undefined"==typeof window?global:window;if("function"!=typeof t.require){var e={},r={},n={},i={}.hasOwnProperty,o=/^\.\.?(\/|$)/,a=function(t,e){for(var r,n=[],i=(o.test(e)?t+"/"+e:e).split("/"),a=0,u=i.length;a<u;a++)r=i[a],".."===r?n.pop():"."!==r&&""!==r&&n.push(r);return n.join("/")},u=function(t){return t.split("/").slice(0,-1).join("/")},s=function(e){return function(r){var n=a(u(e),r);return t.require(n,e)}},c=function(t,e){var n=null;n=y&&y.createHot(t);var i={id:t,exports:{},hot:n};return r[t]=i,e(i.exports,s(t),i),i.exports},l=function(t){return n[t]?l(n[t]):t},f=function(t,e){return l(a(u(t),e))},p=function(t,n){null==n&&(n="/");var o=l(t);if(i.call(r,o))return r[o].exports;if(i.call(e,o))return c(o,e[o]);throw new Error("Cannot find module '"+t+"' from '"+n+"'")};p.alias=function(t,e){n[e]=t};var h=/\.[^.\/]+$/,d=/\/index(\.[^\/]+)?$/,g=function(t){if(h.test(t)){var e=t.replace(h,"");i.call(n,e)&&n[e].replace(h,"")!==e+"/index"||(n[e]=t)}if(d.test(t)){var r=t.replace(d,"");i.call(n,r)||(n[r]=t)}};p.register=p.define=function(t,n){if("object"==typeof t)for(var o in t)i.call(t,o)&&p.register(o,t[o]);else e[t]=n,delete r[t],g(t)},p.list=function(){var t=[];for(var r in e)i.call(e,r)&&t.push(r);return t};var y=t._hmr&&new t._hmr(f,p,e,r);p._cache=r,p.hmr=y&&y.wrap,p.brunch=!0,t.require=p}}(),function(){var t;window;require.register("apis/coordinates.js",function(t,e,r){"use strict";var n=e("superagent"),i=e("superagent-jsonp"),o=function(t){n.get("//freegeoip.net/json").use(i).end(function(e,r){if(!r)return t({error:e});var n=r.body,i=n.latitude,o=n.longitude;t({lat:i,"long":o})})};r.exports={getFromIp:o}}),require.register("apis/flight_data.js",function(t,e,r){"use strict";var n=e("superagent"),i="https://cors-anywhere.herokuapp.com/opensky-network.org/api",o=function(t){return n.get(i+"/states/all").end(function(e,r){t(r.body)})};r.exports={getAll:o}}),require.register("initialize.js",function(t,e,r){"use strict";document.addEventListener("DOMContentLoaded",function(){var t=e("lodash"),r=e("moment"),n=e("leaflet"),i=e("./apis/flight_data"),o=e("./objects/map"),a=e("./objects/flight"),u=e("./objects/flight_marker"),s=new o("app-map"),c=new n.FeatureGroup;s.addLayer(c);var l={},f=function h(){i.getAll(function(t){var e=r.unix(t.time).format();console.log(t.states.length+" flights updated "+e);for(var n=0,i=0;i<t.states.length;i++){var o=new a(t.states[i]),s=l[o.icao24];if(o.isPlottable&&!o.onGround){var f=new u(o);s&&c.removeLayer(s.marker),c.addLayer(f),l[o.icao24]={flight:o,marker:f},n++}else s&&(c.removeLayer(s.marker),delete l[o.icao24])}console.log("Plotted "+n+" flights"),p(),setTimeout(h,1e4)})},p=function(){var e=r().subtract(5,"minutes").unix();t.each(l,function(t,r){var n=t.flight;n.timePosition<e&&delete l[r]})};f()})}),require.register("objects/flight.js",function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=function(){function t(t,e){var r=[],n=!0,i=!1,o=void 0;try{for(var a,u=t[Symbol.iterator]();!(n=(a=u.next()).done)&&(r.push(a.value),!e||r.length!==e);n=!0);}catch(s){i=!0,o=s}finally{try{!n&&u["return"]&&u["return"]()}finally{if(i)throw o}}return r}return function(e,r){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),o=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}();r.exports=function(){function t(e){n(this,t);var r=i(e,13),o=r[0],a=r[1],u=r[2],s=r[3],c=r[4],l=r[5],f=r[6],p=r[7],h=r[8],d=r[9],g=r[10],y=r[11],v=r[12];this.icao24=o,this.callsign=a?a.trim():null,this.originCountry=u,this.timePosition=s,this.timeVelocity=c,this.longitude=l,this.latitude=f,this.altitude=p,this.onGround=h,this.velocity=d,this.heading=g,this.verticalRate=y,this.sensors=v}return o(t,[{key:"altitudeFt",get:function(){return 3.28084*this.altitude}},{key:"altitudeM",get:function(){return this.altitude}},{key:"mph",get:function(){return 2.23694*this.velocity}},{key:"kph",get:function(){return 3.6*this.velocity}},{key:"verticalFps",get:function(){return 3.28084*this.verticalRate}},{key:"verticalMps",get:function(){return this.verticalRate}},{key:"isPlottable",get:function(){return this.longitude&&this.latitude}}]),t}()}),require.register("objects/flight_marker.js",function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function o(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}var a=e("leaflet");e("leaflet-rotatedmarker");var u=function(t){var e=t.altitudeFt,r=void 0;switch(!0){case e>=35e3:r="high";break;case e>=2e4:r="medium";break;case e<2e4:r="low";break;default:r="default"}return a.icon({iconUrl:"./img/airplane-"+r+".svg",iconSize:[20,20],iconAnchor:[10,10],popupAnchor:[0,-5]})},s=function(t,e){var r=void 0,n=void 0,i=void 0;return r=t.callsign?"Flight "+t.callsign:"Unidentified Flight",n="metric"==e?Math.round(t.kph)+" kph":Math.round(t.mph)+" mph",i="metric"==e?Math.round(t.altitudeM)+" m":Math.round(t.altitudeFt)+" ft","<strong>"+r+"</strong><br />"+("Speed: <strong>"+n+"</strong><br />")+("Altitude: <strong>"+i+"</strong>")};r.exports=function(t){function e(t){var r;return n(this,e),(r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,[t.latitude,t.longitude],{icon:u(t),title:t.callsign,rotationAngle:Math.round(t.heading),rotationOrigin:"center center"}))).bindTooltip(s(t)),r.flight=t,r}return o(e,t),e}(a.Marker)}),require.register("objects/map.js",function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function o(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}var a=e("leaflet"),u=e("../apis/coordinates"),s={url:"//cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}@2x.png",attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'},c=function(t){var e=t.url,r=t.attribution;return new a.TileLayer(e,{minZoom:4,maxZoom:12,attribution:r})};r.exports=function(t){function e(t){n(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t));return r.addLayer(c(s)),setTimeout(function(){r.invalidateSize()},0),u.getFromIp(function(t){var e=t.lat,n=t["long"],i=void 0;i=e&&n?new a.LatLng(e,n):new a.LatLng(39.8333333,(-98.585522)),r.setView(i,6)}),r}return o(e,t),e}(a.Map)}),require.alias("buffer/index.js","buffer"),require.alias("process/browser.js","process"),t=require("process"),require.register("___globals___",function(t,e,r){})}(),require("___globals___");