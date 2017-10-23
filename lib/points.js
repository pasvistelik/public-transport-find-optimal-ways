'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _point = require('./point');

var _point2 = _interopRequireDefault(_point);

var _geoCoordsDistance = require('geo-coords-distance');

var _geoCoordsDistance2 = _interopRequireDefault(_geoCoordsDistance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getTimeForGoingTo(distance, goingSpeed) {
    return Math.floor(distance / (goingSpeed / 3.6));
}

function getHeuristicTime(a_coords, b_coords) {
    return (0, _geoCoordsDistance2.default)(a_coords, b_coords) / 5;
}

var TableType = { table: 1, periodic: 2 };

var Points = function () {
    function Points(nowPos, needPos) {
        _classCallCheck(this, Points);

        this.collection = [];
        this.startPoint = new _point2.default(0, nowPos, null, null);
        this.finalPoint = new _point2.default(2160000000, needPos, null, null);
        this.currentSelectedPoint = null;
    }

    _createClass(Points, [{
        key: 'findElement',
        value: function findElement(station_or_point) {
            if (station_or_point.hashcode != null) {
                if (station_or_point.point != null) return station_or_point.point;
                var newCreatdPoint = new _point2.default(2160000000, station_or_point, null, null);
                newCreatdPoint.heuristicTimeToFinalPoint = (0, _geoCoordsDistance2.default)(newCreatdPoint.coords, this.finalPoint.coords) / 5; //!!!
                this.collection.push(newCreatdPoint);
                return newCreatdPoint;
            } else {
                console.log("test 0");
                for (var i = 0, n = this.collection.length, p = this.collection[0]; i < n; p = this.collection[++i]) {
                    if (p.coords === station_or_point.coords && p.stationCode === station_or_point.stationCode) return p;
                }
                return null;
            }
        }
    }, {
        key: 'fillStartData',
        value: function fillStartData(stationsList, goingSpeed, reservedTime, myIgnoringFragments, ignoringRoutes) {
            var tmpTime = getTimeForGoingTo((0, _geoCoordsDistance2.default)(this.startPoint.coords, this.finalPoint.coords), goingSpeed);
            if (ignoringRoutes == null || !ignoringRoutes.includes(null)) this.finalPoint.tryUpdate(tmpTime /*+ 1800/*+ TimeSpan.FromMinutes(20)*/, this.startPoint, null, null, tmpTime, null);
            var finalPointCoords = this.finalPoint.coords;
            for (var i = 0, n = stationsList.length, st = stationsList[0], add, goingTime; i < n; st = stationsList[++i]) {
                if (myIgnoringFragments != null && myIgnoringFragments.contains(st.hashcode, null, null)) continue;

                add = new _point2.default(2160000000, st, null, null);
                add.heuristicTimeToFinalPoint = (0, _geoCoordsDistance2.default)(add.coords, finalPointCoords) / 5;
                goingTime = getTimeForGoingTo((0, _geoCoordsDistance2.default)(this.startPoint.coords, st.coords), goingSpeed);
                add.tryUpdate(goingTime + reservedTime, this.startPoint, null, null, goingTime, null);
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
        // TODO: Определять следующую вершину можно прямо на каждом шаге алгоритма при вызове tryUpdate, не придется повторно просматривать список.

    }, {
        key: 'selectPointWithMinimalMark',
        value: function selectPointWithMinimalMark() {
            for (var i = 0, n = this.collection.length, t = this.collection[0], p = null, currentMarkValue; i < n; t = this.collection[++i]) {
                if (!t.isVisited) {
                    p = t;
                    currentMarkValue = p.totalTimeSeconds + p.heuristicTimeToFinalPoint;
                    for (t = this.collection[++i]; i < n; t = this.collection[++i]) {
                        if (!t.isVisited && t.totalTimeSeconds + t.heuristicTimeToFinalPoint < currentMarkValue) {
                            p = t;
                            currentMarkValue = p.totalTimeSeconds + p.heuristicTimeToFinalPoint;
                        }
                    }
                    return p;
                }
            }
            return null;
        }
    }, {
        key: 'countFirstShortestWay',
        value: function countFirstShortestWay(ignoringRoutes, myIgnoringFragments, day, time, types, speed, reservedTime) {
            var overLimitResedvedTime = 1200;

            for (var selectedPoint = this.getNextUnvisitedPoint(), selectedPointStation, selectedPointTotalTimeSeconds, selectedPointStationHashcode, selectedPointFromWhichRoute, momentWhenComingToStation, routesOnStation, selectedPointCoords; selectedPoint != null; selectedPoint = this.getNextUnvisitedPoint()) {
                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                selectedPointTotalTimeSeconds = selectedPoint.totalTimeSeconds;
                if (selectedPointTotalTimeSeconds + selectedPoint.heuristicTimeToFinalPoint > this.finalPoint.totalTimeSeconds + overLimitResedvedTime) //... Пропускаем и удаляем, если значение метки превышает минимальное время до пункта назначения.
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
                        if (ignoringRoutes != null && selectedRoute != null && ignoringRoutes.includes(selectedRoute)) continue;
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
                                            var waitingTime = table.findTimeAfter(momentWhenAskingForGoing, day);

                                            // Момент, когда мы сядем в транспорт:
                                            var momentWhenSitInTransport = momentWhenAskingForGoing + waitingTime;

                                            // Расписание данного транспорта на следующей остановке:
                                            var tbl = selectedRoute.getTimetable(nextStation);

                                            // (сколько будем ехать до следующей остановки):
                                            var goingOnTransportTime = tbl.findTimeAfter(momentWhenSitInTransport, day);

                                            // Метка времени:
                                            var dispatchTime = momentWhenSitInTransport - momentWhenComingToStation + selectedPointTotalTimeSeconds;
                                            var arrivalTime = dispatchTime + goingOnTransportTime;
                                            var onNextPointTotalTimeSeconds = arrivalTime;

                                            if (this.findElement(nextStation).tryUpdate(onNextPointTotalTimeSeconds, selectedPoint, selectedPointStation, selectedRoute, arrivalTime, null)) {
                                                selectedPoint.dispatchTime = dispatchTime;
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
                for (var j = 0, m = this.collection.length, p = this.collection[0], goingTime, newTime; j < m; p = this.collection[++j]) {
                    if (!p.isVisited && p !== selectedPoint) {
                        // Блокируем попытку дойти пешком до указанной остановки:
                        if (myIgnoringFragments != null && myIgnoringFragments.contains(p.stationCode, null, selectedPointStationHashcode)) continue;

                        goingTime = getTimeForGoingTo((0, _geoCoordsDistance2.default)(selectedPointCoords, p.coords), speed);

                        var arrivalTime = selectedPointTotalTimeSeconds + goingTime;
                        newTime = arrivalTime + reservedTime;
                        /*if (p != myFinishPoint)*/ // newTime += reservedTime;

                        if (p.tryUpdate(newTime, selectedPoint, selectedPointStation, null, arrivalTime, null)) {
                            selectedPoint.dispatchTime = selectedPointTotalTimeSeconds;
                            //console.log("upd...");
                        }
                    }
                }if (myIgnoringFragments != null && myIgnoringFragments.contains(null, null, selectedPointStationHashcode)) continue;

                var tryingNewTime = selectedPointTotalTimeSeconds + getTimeForGoingTo((0, _geoCoordsDistance2.default)(selectedPointCoords, this.finalPoint.coords), speed);
                if (this.finalPoint.tryUpdate(tryingNewTime, selectedPoint, selectedPointStation, null, tryingNewTime, null)) {
                    //console.log("upd: " + selectedPointStation.hashcode);
                    selectedPoint.dispatchTime = selectedPointTotalTimeSeconds;
                }
            }
        }
    }, {
        key: 'optimizeFindedWay',
        value: function optimizeFindedWay(ignoringRoutes, myIgnoringFragments, day, time, types, speed, reservedTime) {
            var tmp = [];
            //console.log("\n\n\nTry optimize...");
            if (this.finalPoint.previousPoint == null) return;
            // Сокращаем время ходьбы пешком до минимума и избавляемся от "бессмысленных" пересадок, сохраняя общее время неизменным:
            for (var currentPoint = this.finalPoint.previousPoint, selectedRoute = currentPoint.fromWhichRoute, previousPoint = currentPoint.previousPoint; currentPoint !== this.startPoint; currentPoint = currentPoint.previousPoint, selectedRoute = currentPoint.fromWhichRoute, previousPoint = currentPoint.previousPoint) {

                // Рассматриваем вершину только если использованные маршруты не совпадают. Пути "пешком" не рассматриваем.
                if (selectedRoute == null || previousPoint === this.startPoint || previousPoint.fromWhichRoute === selectedRoute) continue;

                var previousStationOfSelectedRoute = selectedRoute.getPreviousStation(previousPoint.station); //!!! previousPoint
                if (previousStationOfSelectedRoute == null) continue;

                var point = previousStationOfSelectedRoute.point;
                if (point == null || !point.isVisited) continue;

                // Загружаем расписание:
                var table = selectedRoute.getTimetable(point.station);
                if (table == null) continue;

                if (table.type === TableType.table) // Если это точное расписание, то:
                    {
                        // Момент отправки.
                        var momentOfDispatchFromPoint = currentPoint.totalTimeSeconds + table.findTimeBefore(time + currentPoint.totalTimeSeconds, day);

                        // Момент отправки не может наступить раньше момента прибытия на эту остановку.
                        if (momentOfDispatchFromPoint >= point.totalTimeSeconds + reservedTime) {

                            var p1 = point.getTotalGoingTime();
                            var p2 = previousPoint.getTotalGoingTime(); //!!! previousPoint
                            tmp.push({
                                /*point: previousPoint,
                                oldPrevious: previousPoint.previousPoint,
                                newPrevious: point,*/
                                route: selectedRoute.number + " " + selectedRoute.type,
                                p1: p1,
                                p2: p2,
                                s: point.station.name
                            });
                            if (p1 <= p2) {

                                //}

                                //console.log("Добавили станцию '" + point.station.name + "' к пути на транспорте '" + selectedRoute.type + " " + selectedRoute.number + "'");

                                previousPoint.previousPoint = point;
                                previousPoint.fromWhichRoute = selectedRoute;
                                previousPoint.fromWhichStation = point.station;
                                previousPoint.totalTimeSeconds = momentOfDispatchFromPoint + selectedRoute.getTimetable(previousPoint.station).findTimeAfter(time + momentOfDispatchFromPoint, day);

                                previousPoint.arrivalTime = previousPoint.totalTimeSeconds; //!!!!!!!!!!!!!
                                point.changedDispatchTime = "from " + point.dispatchTime + " to " + momentOfDispatchFromPoint;
                                point.dispatchTime = momentOfDispatchFromPoint; //!!!!!!!!!!!!!!

                            }
                        }
                        //else console.log("Не будем добавлять станцию '" + point.station.name + "' к пути на транспорте '" + selectedRoute.type + " " + selectedRoute.number + "'. ( " + momentOfDispatchFromPoint + " < " + (point.totalTimeSeconds + reservedTime) + " )");
                    } else {
                    //if (table.type === TableType.periodic)
                    throw new Error();
                }
            }
            //console.log(tmp);
        }
    }, {
        key: 'countShortWay',
        value: function countShortWay(ignoringRoutes, myIgnoringFragments, time, types, speed, reservedTime) {
            //try {

            var day = new Date().getDay();

            this.countFirstShortestWay(ignoringRoutes, myIgnoringFragments, day, time, types, speed, reservedTime);
            this.optimizeFindedWay(ignoringRoutes, myIgnoringFragments, day, time, types, speed, reservedTime);

            //}
            //catch(e) {
            //     console.log(e);
            //}
        }
    }]);

    return Points;
}();

exports.default = Points;