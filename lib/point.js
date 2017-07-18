"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Point = function () {
    function Point(totalTimeSeconds, station_or_crds, fromWhichStation, fromWhichRoute) {
        (0, _classCallCheck3.default)(this, Point);

        if (station_or_crds.hashcode !== undefined) {
            this.station = station_or_crds;
            this.stationCode = station_or_crds.hashcode;
            station_or_crds.point = this;
            this.coords = station_or_crds.coords;
        } else {
            this.coords = station_or_crds;
            this.station = null;
            this.stationCode = null;
        }
        this.totalTimeSeconds = totalTimeSeconds;
        this.fromWhichStation = fromWhichStation;
        this.fromWhichRoute = fromWhichRoute;

        this.isVisited = false;

        this.previousPoint = null;
    }

    (0, _createClass3.default)(Point, [{
        key: "tryUpdate",
        value: function tryUpdate(totalTimeSeconds, previousPoint, fromWhichStation, fromWhichRoute) {
            if (totalTimeSeconds < this.totalTimeSeconds) {
                this.fromWhichRoute = fromWhichRoute;
                this.previousPoint = previousPoint;
                this.totalTimeSeconds = totalTimeSeconds;
                this.fromWhichStation = fromWhichStation;

                return true;
            }
            return false;
        }
    }, {
        key: "setVisited",
        value: function setVisited() {
            this.isVisited = true;
        }
    }, {
        key: "toString",
        value: function toString() {
            var to, tr; //, from, p;
            //if (this.fromWhichStation != null) from = this.fromWhichStation.name;
            //else from = "null";
            if (this.station != null) to = this.station.name;else to = "null";
            if (this.fromWhichRoute != null) tr = this.fromWhichRoute.type + " " + this.fromWhichRoute.number + " " + this.fromWhichRoute.from + " - " + this.fromWhichRoute.to;else tr = "пешком";
            //if (this.previousPoint != null) p = this.previousPoint.toString();
            //else p = "null";
            return (/*p+" -->> */"(" + this.totalTimeSeconds + ") " + to + " (" + tr + ")"
            ); // from " + from + " to
        }
    }, {
        key: "getTotalGoingTime",
        value: function getTotalGoingTime() {
            var goingTime = 0;
            var tmpP = this;
            //this.points.Add(tmpP.ToString());
            while (tmpP.previousPoint != null) {
                if (tmpP.fromWhichRoute == null /*&& tmpP.fromWhichRoute.hashcode == null*/) goingTime += tmpP.totalTimeSeconds - tmpP.previousPoint.totalTimeSeconds;
                tmpP = tmpP.previousPoint;
            }
            return goingTime;
        }
    }, {
        key: "getTotalTransportChangingCount",
        value: function getTotalTransportChangingCount() {
            var result = 0;
            var tmpP = this;
            //this.points.Add(tmpP.ToString());
            while (tmpP.previousPoint != null) {
                if (tmpP.fromWhichRoute != null && tmpP.fromWhichRoute.hashcode != null && tmpP.fromWhichRoute !== tmpP.previousPoint.fromWhichRoute) result++;
                tmpP = tmpP.previousPoint;
            }
            return result;
        }
    }]);
    return Point;
}();

exports.default = Point;