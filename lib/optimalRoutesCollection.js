'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _optimalRoute = require('./optimalRoute');

var _optimalRoute2 = _interopRequireDefault(_optimalRoute);

var _optimalWay = require('./optimalWay');

var _optimalWay2 = _interopRequireDefault(_optimalWay);

var _points = require('./points');

var _points2 = _interopRequireDefault(_points);

var _geoCoordsDistance = require('geo-coords-distance');

var _geoCoordsDistance2 = _interopRequireDefault(_geoCoordsDistance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //import IgnoringFragments from './ignoringFragments';


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
    _inherits(OptimalRoutesCollection, _Array);

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
    function OptimalRoutesCollection(allStations, nowPos, needPos, time, types, speed, dopTimeMinutes, oneWayOnly) {
        _classCallCheck(this, OptimalRoutesCollection);

        //dopTimeMinutes = -2;
        //console.log("TEST_111111111111111111111111111111111111111111111111111111111111111");/////////////////////////////////!!!!!!!!!!!!!!!!!!!!!!!
        var _this = _possibleConstructorReturn(this, (OptimalRoutesCollection.__proto__ || Object.getPrototypeOf(OptimalRoutesCollection)).call(this));

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
                        if (!t.isVisited && t.oldTotalTimeSeconds < p.oldTotalTimeSeconds) {
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

        var tmpAllCount = 1,
            tmpRealCount = 1;

        //oneWayOnly = true;//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        var maxCount = 100;
        if (!oneWayOnly) {

            //TODO: use solutions tree
            for (var selectedOptimalRoute = _this[0]; selectedOptimalRoute != null && tmpAllCount < maxCount; selectedOptimalRoute.setVisited(), selectedOptimalRoute = _this.selectOptimalRouteWithMinimalMark()) {
                var ddd = 0.9;

                ignoringRoutes = [];
                // Проходим по всем ребрам выбранного пути и строим новые маршруты при удалении ребер:
                for (var tmpP = selectedOptimalRoute.myPoints.finalPoint; tmpP.previousPoint != null; tmpP = tmpP.previousPoint) {
                    if (tmpP == null) console.log("err in optimalRoutesCollection.js");
                    if ( /*tmpP.fromWhichRoute != null &&*/!ignoringRoutes.includes(tmpP.fromWhichRoute)) ignoringRoutes.push(tmpP.fromWhichRoute);
                }
                for (var i = 0, n = ignoringRoutes.length, r = ignoringRoutes[0]; i < n; r = ignoringRoutes[++i]) {
                    if (selectedOptimalRoute.ignoringRoutes.includes(r)) continue;
                    var ignoringRoutesAdd = [];
                    ignoringRoutesAdd = ignoringRoutesAdd.concat(selectedOptimalRoute.ignoringRoutes);
                    ignoringRoutesAdd.push(r);

                    clearStations(allStations); //stationsList);

                    myPoints = new _points2.default(nowPos, needPos);
                    var tmpOptimalRoute = new _optimalRoute2.default(myPoints, stationsList, /*nowPos, needPos,*/time, types, speed, dopTimeMinutes, ignoringRoutesAdd);

                    tmpAllCount++;

                    if (tmpOptimalRoute.oldTotalTimeSeconds <= _this[0].oldTotalTimeSeconds / ddd + 1200) {
                        tmpOptimalRoute.hash = JSON.stringify(tmpOptimalRoute.points);
                        var ok = false;
                        for (var j = 0, m = _this.length, opt = _this[0]; j < m; opt = _this[++j]) {
                            if (opt.hash == null) opt.hash = JSON.stringify(opt.points);
                            if (opt.hash === tmpOptimalRoute.hash) {
                                ok = true;
                                break;
                            }
                        }
                        if (ok) continue;
                        _this.push(tmpOptimalRoute);
                        tmpRealCount++;
                        //console.log(tmpOptimalRoute);//!!!!!!!!!!!
                    }
                }
            }
        }

        //for(var i = 0, n = this.length; i < n; i++){
        //    this[i].optimizeAroundFinalPoint();
        //}
        console.log("All: " + tmpAllCount + ", real: " + tmpRealCount);
        //console.log(this);
        return _this;
    }

    return OptimalRoutesCollection;
}(Array);

exports.default = OptimalRoutesCollection;


function clearStations(stations) {
    //var j = 0;
    for (var i = 0, n = stations.length; i < n; i++) {
        //if(stations[i].point) j++;
        stations[i].point = null;
    }
    //console.log("Cleared: "+j+" stations.");
}