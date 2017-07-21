'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _optimalRoute = require('./optimalRoute');

var _optimalRoute2 = _interopRequireDefault(_optimalRoute);

var _optimalWay = require('./optimalWay');

var _optimalWay2 = _interopRequireDefault(_optimalWay);

var _points = require('./points');

var _points2 = _interopRequireDefault(_points);

var _geoCoordsDistance = require('geo-coords-distance');

var _geoCoordsDistance2 = _interopRequireDefault(_geoCoordsDistance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import IgnoringFragments from './ignoringFragments';
var heuristicBestTransportSpeed = 40;

function getStationsAround(allStations, nowPos, needPos, goingSpeed, heuristicBestTransportSpeed) {
    var result = [];
    var fullDistance = (0, _geoCoordsDistance2.default)(nowPos, needPos);
    for (var i = 0, n = allStations.length, s = allStations[0]; i < n; s = allStations[++i]) {
        if (s != null && fullDistance > (0, _geoCoordsDistance2.default)(nowPos, s.coords) + goingSpeed * (0, _geoCoordsDistance2.default)(s.coords, needPos) / heuristicBestTransportSpeed) {
            result.push(s);
        }
    }
    return result;
}

var OptimalRoutesCollection = function (_Array) {
    (0, _inherits3.default)(OptimalRoutesCollection, _Array);

    /*getOptimalWays() {
        var result = [];
        for (var i = 0, n = this.length, r = this[0]; i < n; r = this[++i]) {
            result.push(new OptimalWay(r));
        }
        return result;
    }*/
    /*selectOptimalRouteWithMinimalMark() {
        var p = null;
        for (var i = 0, n = this.length, t = this[0]; i < n; t = this[++i]) {
            if (!(t.isVisited)) {
                p = t;
                for (t = this[++i]; i < n; t = this[++i]) {
                    if (!(t.isVisited) && t.totalTimeSeconds < p.totalTimeSeconds) {
                        p = t;
                    }
                }
                return p;
            }
        }
        return null;
    }*/
    function OptimalRoutesCollection(allStations, nowPos, needPos, time, types, speed, dopTimeMinutes) {
        (0, _classCallCheck3.default)(this, OptimalRoutesCollection);

        var _this = (0, _possibleConstructorReturn3.default)(this, (OptimalRoutesCollection.__proto__ || Object.getPrototypeOf(OptimalRoutesCollection)).call(this));

        console.log("TEST_111111111111111111111111111111111111111111111111111111111111111"); /////////////////////////////////!!!!!!!!!!!!!!!!!!!!!!!
        _this.getOptimalWays = function () {
            var result = [];
            for (var i = 0, n = this.length, r = this[0]; i < n; r = this[++i]) {
                result.push(new _optimalWay2.default(r));
            }
            return result;
        };
        _this.selectOptimalRouteWithMinimalMark = function () {
            var p = null;
            for (var i = 0, n = this.length, t = this[0]; i < n; t = this[++i]) {
                if (!t.isVisited) {
                    p = t;
                    for (t = this[++i]; i < n; t = this[++i]) {
                        if (!t.isVisited && t.totalTimeSeconds < p.totalTimeSeconds) {
                            p = t;
                        }
                    }
                    return p;
                }
            }
            return null;
        };

        var myPoints = new _points2.default(nowPos, needPos);
        // Получим "начальный" список станций:
        var stationsList = getStationsAround(allStations, nowPos, needPos, speed, heuristicBestTransportSpeed);

        _this.push(new _optimalRoute2.default(myPoints, stationsList, /*nowPos, needPos,*/time, types, speed, dopTimeMinutes));

        var ignoringRoutes = [];

        //var ignoringFragments = new IgnoringFragments();

        for (var selectedOptimalRoute = _this[0]; selectedOptimalRoute != null; selectedOptimalRoute.setVisited(), selectedOptimalRoute = _this.selectOptimalRouteWithMinimalMark()) {
            var ddd = 0.25;

            ignoringRoutes = [];
            // Проходим по всем ребрам выбранного пути и строим новые маршруты при удалении ребер:
            for (var tmpP = selectedOptimalRoute.myPoints.finalPoint; tmpP.previousPoint != null; tmpP = tmpP.previousPoint) {
                //if(tmpP == null) console.log("err in optimalRoutesCollection.js");
                if (tmpP.fromWhichRoute != null && !ignoringRoutes.includes(tmpP.fromWhichRoute)) ignoringRoutes.push(tmpP.fromWhichRoute);
            }
            for (var i = 0, n = ignoringRoutes.length, r = ignoringRoutes[0]; i < n; r = ignoringRoutes[++i]) {
                if (selectedOptimalRoute.ignoringRoutes.includes(r)) continue;
                var ignoringRoutesAdd = [];
                ignoringRoutesAdd = ignoringRoutesAdd.concat(selectedOptimalRoute.ignoringRoutes);
                ignoringRoutesAdd.push(r);
                myPoints = new _points2.default(nowPos, needPos);
                var tmpOptimalRoute = new _optimalRoute2.default(myPoints, stationsList, /*nowPos, needPos,*/time, types, speed, dopTimeMinutes, ignoringRoutesAdd);

                if (tmpOptimalRoute.totalTimeSeconds <= _this[0].totalTimeSeconds / ddd) {
                    var tmpJSON = JSON.stringify(tmpOptimalRoute.points);
                    var ok = false;
                    for (var j = 0, m = _this.length, opt = _this[0]; j < m; opt = _this[++j]) {
                        if (JSON.stringify(opt.points) === tmpJSON) {
                            ok = true;
                            break;
                        }
                    }
                    if (ok) continue;
                    _this.push(tmpOptimalRoute);
                }
            }
        }
        return _this;
    }

    return OptimalRoutesCollection;
}(Array);

exports.default = OptimalRoutesCollection;