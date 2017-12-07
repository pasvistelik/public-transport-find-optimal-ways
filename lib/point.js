"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Point = function () {
    function Point(totalTimeSeconds, station_or_crds, fromWhichStation, fromWhichRoute, totalGoingTimeSeconds) {
        _classCallCheck(this, Point);

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
        this.totalGoingTimeSeconds = totalGoingTimeSeconds;

        this.isVisited = false;

        this.previousPoint = null;

        this.arrivalTime = 0;
        this.dispatchTime = 2160000000;
    }

    _createClass(Point, [{
        key: "tryUpdate",
        value: function tryUpdate(totalTimeSeconds, previousPoint, fromWhichStation, fromWhichRoute, arrivalTime, dispatchTime, dispatchTimeFromPrevious, totalGoingTimeSeconds) {
            //if (totalTimeSeconds < this.totalTimeSeconds) {
            if (totalGoingTimeSeconds < this.totalGoingTimeSeconds) {
                this.fromWhichRoute = fromWhichRoute;
                this.previousPoint = previousPoint;
                this.totalTimeSeconds = totalTimeSeconds;
                this.fromWhichStation = fromWhichStation;
                this.arrivalTime = arrivalTime;
                this.dispatchTime = dispatchTime;

                this.totalGoingTimeSeconds = totalGoingTimeSeconds;

                this.previousPoint.setDispatchTime(dispatchTimeFromPrevious);

                return true;
            }
            return false;
        }
    }, {
        key: "setDispatchTime",
        value: function setDispatchTime(value) {
            this.dispatchTime = value;
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
    }, {
        key: "getTotalWaitingTime",
        value: function getTotalWaitingTime() {
            var result = 0;
            var tmpP = this.previousPoint;
            if (tmpP == null) return result;
            while (tmpP.previousPoint != null) {
                result += tmpP.dispatchTime - tmpP.arrivalTime;
                tmpP = tmpP.previousPoint;
            }
            return result;
        }
    }, {
        key: "getMinimalWaitingTime",
        value: function getMinimalWaitingTime() {
            var result = 2160000000;
            var tmpP = this.previousPoint;
            if (tmpP == null) return result; //0;
            var routeToNextStation = tmpP.fromWhichRoute;
            tmpP = tmpP.previousPoint;
            if (tmpP == null) return result; //0;
            //routeToNextStation = tmpP.fromWhichRoute;
            while (tmpP.previousPoint != null) {
                if (routeToNextStation != tmpP.fromWhichRoute && routeToNextStation != null) {
                    var temp = tmpP.dispatchTime - tmpP.arrivalTime;
                    if (temp < result) result = temp;
                }
                routeToNextStation = tmpP.fromWhichRoute;
                tmpP = tmpP.previousPoint;
            }
            return result;
        }
    }, {
        key: "getRiskEffectivity",
        value: function getRiskEffectivity() {
            function countProbability(xTimeSeconds) {
                //return 2*(Math.atan(Math.exp(1.5*xTimeSeconds/60+0.5))/Math.PI);
                return 2 * (Math.atan(Math.exp(1.1 * xTimeSeconds / 60 + 0.3)) / Math.PI);
            }
            var result = 1;
            var tmpP = this.previousPoint;
            if (tmpP == null) return result; //0;
            var routeToNextStation = tmpP.fromWhichRoute;
            tmpP = tmpP.previousPoint;
            if (tmpP == null) return result; //0;
            //routeToNextStation = tmpP.fromWhichRoute;
            while (tmpP.previousPoint != null) {
                if (routeToNextStation != tmpP.fromWhichRoute && routeToNextStation != null) {
                    var temp = tmpP.dispatchTime - tmpP.arrivalTime;
                    result *= countProbability(temp);
                }
                routeToNextStation = tmpP.fromWhichRoute;
                tmpP = tmpP.previousPoint;
            }
            return result;
        }
    }]);

    return Point;
}();

exports.default = Point;