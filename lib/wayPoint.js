"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WayPoint = function WayPoint(time, station, route, coords) {
    _classCallCheck(this, WayPoint);

    this.time = time;
    this.station = station == null ? null : { hashcode: station.hashcode, name: station.name, routes: null, Coords: { lat: station.coords.lat, lng: station.coords.lng } };
    this.route = route == null ? null : { vehicles: [], gpsTrack: null, hashcode: route.hashcode, number: route.number, type: route.type, from: route.from, to: route.to, owner: "", stations: null, timetables: null, stationsJSON: null };
    this.coords = coords;
};

exports.default = WayPoint;