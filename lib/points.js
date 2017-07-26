'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _point = require('./point');

var _point2 = _interopRequireDefault(_point);

var _geoCoordsDistance = require('geo-coords-distance');

var _geoCoordsDistance2 = _interopRequireDefault(_geoCoordsDistance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getTimeForGoingTo(distance, goingSpeed) {
    return Math.floor(distance / (goingSpeed / 3.6));
}

var TableType = { table: 1, periodic: 2 };

var Points = function () {
    function Points(nowPos, needPos) {
        (0, _classCallCheck3.default)(this, Points);

        this.collection = [];
        this.startPoint = new _point2.default(0, nowPos, null, null);
        this.finalPoint = new _point2.default(2160000000, needPos, null, null);
        this.currentSelectedPoint = null;
    }

    (0, _createClass3.default)(Points, [{
        key: 'findElement',
        value: function findElement(station_or_point) {
            if (station_or_point.hashcode != null) {
                if (station_or_point.point != null) return station_or_point.point;
                var newCreatdPoint = new _point2.default(2160000000, station_or_point, null, null);
                newCreatdPoint.heuristicTimeToFinalPoint = (0, _geoCoordsDistance2.default)(newCreatdPoint.coords, this.finalPoint.coords) / 5;
                this.collection.push(newCreatdPoint);
                return newCreatdPoint;
            } else {
                for (var i = 0, n = this.collection.length, p = this.collection[0]; i < n; p = this.collection[++i]) {
                    if (p.coords === station_or_point.coords && p.stationCode === station_or_point.stationCode) return p;
                }
                return null;
            }
        }
    }, {
        key: 'fillStartData',
        value: function fillStartData(stationsList, goingSpeed, reservedTime, myIgnoringFragments) {
            this.finalPoint.tryUpdate(getTimeForGoingTo((0, _geoCoordsDistance2.default)(this.startPoint.coords, this.finalPoint.coords), goingSpeed) + 1800 /*+ TimeSpan.FromMinutes(20)*/, this.startPoint, null, null);
            var finalPointCoords = this.finalPoint.coords;
            for (var i = 0, n = stationsList.length, st = stationsList[0]; i < n; st = stationsList[++i]) {
                if (myIgnoringFragments != null && myIgnoringFragments.contains(st.hashcode, null, null)) continue;

                var add = new _point2.default(2160000000, st, null, null);
                add.heuristicTimeToFinalPoint = (0, _geoCoordsDistance2.default)(add.coords, finalPointCoords) / 5;
                add.tryUpdate(getTimeForGoingTo((0, _geoCoordsDistance2.default)(this.startPoint.coords, st.coords), goingSpeed) + reservedTime, this.startPoint, null, null);
                this.collection.push(add);
            }
        }
    }, {
        key: 'getNextUnvisitedPoint',
        value: function getNextUnvisitedPoint() {
            if (this.currentSelectedPoint != null) this.currentSelectedPoint.setVisited();

            this.currentSelectedPoint = this.selectPointWithMinimalMark();

            return this.currentSelectedPoint;
        }
    }, {
        key: 'selectPointWithMinimalMark',
        value: function selectPointWithMinimalMark() {
            var p = null;
            for (var i = 0, n = this.collection.length, t = this.collection[0]; i < n; t = this.collection[++i]) {
                if (!t.isVisited) {
                    p = t;
                    //var euristicTimeSecondsToFinalPoint = distance(p.coords, this.finalPoint.coords) / 5; // Оценка оставшегося времени пути в секундах.
                    for (t = this.collection[++i]; i < n; t = this.collection[++i]) {
                        //var tmpEuristic = distance(t.coords, this.finalPoint.coords) / 5;
                        if (!t.isVisited && t.totalTimeSeconds + t.heuristicTimeToFinalPoint < p.totalTimeSeconds + p.heuristicTimeToFinalPoint) {
                            p = t;
                            //euristicTimeSecondsToFinalPoint = tmpEuristic;
                        }
                    }
                    return p;
                }
            }
            return null;
        }
    }, {
        key: 'countShortWay',
        value: function countShortWay(ignoringRoutes, myIgnoringFragments, time, types, speed, reservedTime) {
            //TimeSpan overLimitResedvedTime = TimeSpan.FromMinutes(20);

            for (var selectedPoint = this.getNextUnvisitedPoint(), selectedPointStation, selectedPointTotalTimeSeconds, selectedPointStationHashcode, selectedPointFromWhichRoute, momentWhenComingToStation, routesOnStation, selectedPointCoords; selectedPoint != null; selectedPoint = this.getNextUnvisitedPoint()) {
                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                selectedPointTotalTimeSeconds = selectedPoint.totalTimeSeconds;
                if (selectedPointTotalTimeSeconds + selectedPoint.heuristicTimeToFinalPoint > this.finalPoint.totalTimeSeconds /* + overLimitResedvedTime*/) //... Пропускаем и удаляем, если значение метки превышает минимальное время до пункта назначения.
                    {
                        break;
                    }
                selectedPointStation = selectedPoint.station;
                selectedPointStationHashcode = selectedPointStation.hashcode;
                selectedPointFromWhichRoute = selectedPoint.fromWhichRoute;
                if (selectedPointStation != null) {
                    // Момент, когда мы прибудем на остановку:
                    momentWhenComingToStation = time + selectedPointTotalTimeSeconds;
                    // Загружаем маршруты, проходящие через остановку:
                    if (selectedPointStation.routes != null) routesOnStation = selectedPointStation.routes;else continue;

                    // Просматриваем все маршруты, проходящие через остановку:
                    for (var i = 0, n = routesOnStation.length, selectedRoute = routesOnStation[0], nextStation; i < n; selectedRoute = routesOnStation[++i]) {
                        if (ignoringRoutes != null && ignoringRoutes.includes(selectedRoute)) continue;
                        if (types.includes(selectedRoute.type)) {
                            // Следующая остановка у данного транспорта:
                            nextStation = selectedRoute.getNextStation(selectedPointStation);

                            if (nextStation != null) // Если остановка не является конечной, то:
                                {
                                    // Загружаем расписание:
                                    var table = selectedRoute.getTimetable(selectedPointStation);
                                    if (table == null) continue;
                                    // Блокируем попытку попасть указанным транспортом на указанную остановку:
                                    if (myIgnoringFragments != null && myIgnoringFragments.contains(nextStation.hashcode, selectedRoute.hashcode, selectedPointStationHashcode)) continue;

                                    if (table.type === TableType.table) // Если это точное расписание, то:
                                        {
                                            // Минимальный начальный момент, с который можно начинать ожидать посадку:
                                            var momentWhenAskingForGoing = momentWhenComingToStation;

                                            // Резервируем дополнительное время, если будем пересаживаться на другой маршрут:
                                            //if (selectedPoint.RouteCode == null || selectedPoint.RouteCode != selectedRoute.hashcode) momentWhenAskingForGoing += reservedTime;
                                            if (selectedPointFromWhichRoute != null && selectedPointFromWhichRoute !== selectedRoute) momentWhenAskingForGoing += reservedTime; //!!!!!

                                            // Подсчитываем, сколько будем ожидать этот транспорт на остановке:
                                            var waitingTime = table.findTimeAfter(momentWhenAskingForGoing);

                                            // Момент, когда мы сядем в транспорт:
                                            var momentWhenSitInTransport = momentWhenAskingForGoing + waitingTime;

                                            // Расписание данного транспорта на следующей остановке:
                                            var tbl = selectedRoute.getTimetable(nextStation);

                                            // (сколько будем ехать до следующей остановки):
                                            var goingOnTransportTime = tbl.findTimeAfter(momentWhenSitInTransport);

                                            // Метка времени:
                                            var onNextPointTotalTimeSeconds = momentWhenSitInTransport - momentWhenComingToStation + goingOnTransportTime + selectedPointTotalTimeSeconds;

                                            if (this.findElement(nextStation).tryUpdate(onNextPointTotalTimeSeconds, selectedPoint, selectedPointStation, selectedRoute)) {
                                                //console.log("upd...");
                                            }
                                        } else if (table.type === TableType.periodic) {
                                        throw new Error();
                                    }
                                }
                        }
                    }
                }
                selectedPointCoords = selectedPoint.coords;
                // Нет смысла идти пешком "транзитом" через остановку:
                if (selectedPointFromWhichRoute == null) continue;

                // Попробуем пройти пешком до других "вершин":
                for (var j = 0, m = this.collection.length, p = this.collection[0], distanceToSelectedPoint, goingTime, newTime; j < m; p = this.collection[++j]) {
                    if (!p.isVisited && p !== selectedPoint) {
                        // Блокируем попытку дойти пешком до указанной остановки:
                        if (myIgnoringFragments != null && myIgnoringFragments.contains(p.stationCode, null, selectedPointStationHashcode)) continue;

                        distanceToSelectedPoint = (0, _geoCoordsDistance2.default)(selectedPointCoords, p.coords);

                        goingTime = getTimeForGoingTo(distanceToSelectedPoint, speed /*, true, sp*/);

                        newTime = selectedPointTotalTimeSeconds + goingTime + reservedTime;
                        /*if (p != myFinishPoint)*/ // newTime += reservedTime;

                        if (p.tryUpdate(newTime, selectedPoint, selectedPointStation, null)) {
                            //console.log("upd...");
                        }
                    }
                }if (myIgnoringFragments != null && myIgnoringFragments.contains(null, null, selectedPointStationHashcode)) continue;

                var tryingNewTime = selectedPointTotalTimeSeconds + getTimeForGoingTo((0, _geoCoordsDistance2.default)(selectedPointCoords, this.finalPoint.coords), speed);
                if (this.finalPoint.tryUpdate(tryingNewTime, selectedPoint, selectedPointStation, null)) {
                    //console.log("upd: " + selectedPointStation.hashcode);
                }
            }

            // Сокращаем время ходьбы пешком до минимума и избавляемся от "бессмысленных" пересадок, сохраняя общее время неизменным:
            var currentPoint = this.finalPoint.previousPoint;
            //console.log("\n\n\n\ntry optimize...");
            while (currentPoint !== this.startPoint) {
                if (currentPoint == null) {
                    console.log("err 1 in points.js");
                }
                //console.log("\n Iteration:");
                var selectedRoute = currentPoint.fromWhichRoute; // r=selectedRoute // "r" is old variable
                if (selectedRoute != null) {
                    var previousPoint = currentPoint.previousPoint;
                    // Если на предыдущую остановку мы добрались другим транспортом, то:
                    if (previousPoint !== this.startPoint && previousPoint.fromWhichRoute !== selectedRoute) {
                        //console.log(selectedRoute + "and" + previousPoint.fromWhichRoute);
                        var previousStationOfSelectedRoute = selectedRoute.getPreviousStation(previousPoint.station);
                        if (previousStationOfSelectedRoute != null) {
                            var point = previousStationOfSelectedRoute.point;
                            //console.log(point);/////////////////////////////////////////////////////////////////////////
                            //console.log(previousPoint);/////////////////////////////////////////////////////////////////////////
                            //console.log(currentPoint);/////////////////////////////////////////////////////////////////////////
                            if (point != null && point.isVisited) {
                                /*if(point.totalTimeSeconds <= previousPoint.totalTimeSeconds) {  
                                    previousPoint.fromWhichRoute = selectedRoute;
                                    previousPoint.previousPoint = point;
                                    //console.log("ok");
                                }*/
                                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                                // Загружаем расписание:
                                var table = selectedRoute.getTimetable(point.station);
                                if (table == null) continue;

                                //var momentWhenComingToStation = time + point.totalTimeSeconds;

                                if (table.type === TableType.table) // Если это точное расписание, то:
                                    {
                                        var aaa = table.findTimeBefore(time + currentPoint.totalTimeSeconds);
                                        var bbb = aaa + currentPoint.totalTimeSeconds;
                                        //if(bbb >= point.totalTimeSeconds + reservedTime) {  
                                        previousPoint.previousPoint = point;
                                        previousPoint.fromWhichRoute = selectedRoute;
                                        previousPoint.fromWhichStation = point.station;

                                        var tbl = selectedRoute.getTimetable(previousPoint.station);
                                        var ccc = tbl.findTimeBefore(time + currentPoint.totalTimeSeconds);
                                        var ddd = ccc + currentPoint.totalTimeSeconds;
                                        previousPoint.totalTimeSeconds = ddd;

                                        //console.log("ok: " + currentPoint.totalTimeSeconds + " > " + ddd + " > " + bbb);
                                        //console.log(this);
                                        //}

                                        /*// Минимальный начальный момент, с который можно начинать ожидать посадку:
                                        var momentWhenAskingForGoing = momentWhenComingToStation;
                                          // Резервируем дополнительное время, если будем пересаживаться на другой маршрут:
                                        if (point.fromWhichRoute != null && point.fromWhichRoute !== selectedRoute) momentWhenAskingForGoing += reservedTime;//!!!!!
                                          // Подсчитываем, сколько будем ожидать этот транспорт на остановке:
                                        var waitingTime = table.findTimeAfter(momentWhenAskingForGoing);
                                          // Момент, когда мы сядем в транспорт:
                                        var momentWhenSitInTransport = momentWhenAskingForGoing + waitingTime;
                                          // Расписание данного транспорта на следующей остановке:
                                        var tbl = selectedRoute.getTimetable(previousPoint.station);
                                        
                                        // (сколько будем ехать до следующей остановки):
                                        var goingOnTransportTime = tbl.findTimeAfter(momentWhenSitInTransport);
                                        
                                        // Метка времени:
                                        var onNextPointTotalTimeSeconds = momentWhenSitInTransport - momentWhenComingToStation + goingOnTransportTime + point.totalTimeSeconds;
                                        
                                        if(onNextPointTotalTimeSeconds <= previousPoint.totalTimeSeconds) {  
                                            //previousPoint.fromWhichRoute = r;
                                            previousPoint.previousPoint = point;
                                            previousPoint.fromWhichRoute = selectedRoute;
                                            previousPoint.totalTimeSeconds = onNextPointTotalTimeSeconds;
                                            previousPoint.fromWhichStation = point.station;
                                            //console.log("ok");
                                        }*/
                                    } else if (table.type === TableType.periodic) {
                                    throw new Error();
                                }

                                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                            }
                        }
                    }
                }
                currentPoint = currentPoint.previousPoint;
            }
        }
    }]);
    return Points;
}();

exports.default = Points;