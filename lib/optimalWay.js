'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _wayPoint = require('./wayPoint');

var _wayPoint2 = _interopRequireDefault(_wayPoint);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OptimalWay = function OptimalWay(optimalRoute) {
    (0, _classCallCheck3.default)(this, OptimalWay);

    this.totalTimeSeconds = optimalRoute.totalTimeSeconds;
    this.totalGoingTimeSeconds = optimalRoute.totalGoingTime;
    this.totalTransportChangingCount = optimalRoute.totalTransportChangingCount;
    this.points = [];

    for (var tmpP = optimalRoute.myPoints.finalPoint; tmpP != null; tmpP = tmpP.previousPoint) {
        this.points.push(new _wayPoint2.default(tmpP.totalTimeSeconds, tmpP.station, tmpP.fromWhichRoute, tmpP.coords));
    }
    this.points.reverse();
};

exports.default = OptimalWay;