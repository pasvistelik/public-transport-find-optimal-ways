'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _wayPoint = require('./wayPoint');

var _wayPoint2 = _interopRequireDefault(_wayPoint);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OptimalWay = function OptimalWay(optimalRoute) {
    _classCallCheck(this, OptimalWay);

    this.totalTimeSeconds = optimalRoute.totalTimeSeconds;
    this.totalGoingTimeSeconds = optimalRoute.totalGoingTime;
    this.totalTransportChangingCount = optimalRoute.totalTransportChangingCount;
    this.totalWaitingTime = optimalRoute.totalWaitingTime;
    this.minimalWaitingTime = optimalRoute.minimalWaitingTime;
    //this.minimalWaitingTime = 0;
    this.points = [];

    for (var tmpP = optimalRoute.myPoints.finalPoint; tmpP != null; tmpP = tmpP.previousPoint) {
        this.points.push(new _wayPoint2.default(tmpP.totalTimeSeconds, tmpP.station, tmpP.fromWhichRoute, tmpP.coords, tmpP.arrivalTime, tmpP.dispatchTime));
    }
    this.points.reverse();
};

exports.default = OptimalWay;