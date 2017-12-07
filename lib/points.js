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
        this.startPoint = new _point2.default(0, nowPos, null, null, 0);
        this.finalPoint = new _point2.default(2160000000, needPos, null, null, 2160000000);
        this.currentSelectedPoint = null;
    }

    _createClass(Points, [{
        key: 'findElement',
        value: function findElement(station_or_point) {
            if (station_or_point.hashcode != null) {
                if (station_or_point.point != null) return station_or_point.point;
                var newCreatdPoint = new _point2.default(2160000000, station_or_point, null, null, 2160000000);
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
            if (ignoringRoutes == null || !ignoringRoutes.includes(null)) this.finalPoint.tryUpdate(tmpTime /*+ 1800/*+ TimeSpan.FromMinutes(20)*/, this.startPoint, null, null, tmpTime, 2160000000, 0, tmpTime);
            var finalPointCoords = this.finalPoint.coords;
            for (var i = 0, n = stationsList.length, st = stationsList[0], add, goingTime; i < n; st = stationsList[++i]) {
                if (myIgnoringFragments != null && myIgnoringFragments.contains(st.hashcode, null, null)) continue;

                add = new _point2.default(2160000000, st, null, null, 2160000000);
                add.heuristicTimeToFinalPoint = (0, _geoCoordsDistance2.default)(add.coords, finalPointCoords) / 5;
                goingTime = getTimeForGoingTo((0, _geoCoordsDistance2.default)(this.startPoint.coords, st.coords), goingSpeed);
                add.tryUpdate(goingTime + reservedTime, this.startPoint, null, null, goingTime, 2160000000, 0, goingTime); //!!!!! param_1: is need to add reservedTime??????
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
                    //currentMarkValue = p.totalGoingTimeSeconds;
                    for (t = this.collection[++i]; i < n; t = this.collection[++i]) {
                        if (!t.isVisited && t.totalTimeSeconds + t.heuristicTimeToFinalPoint < currentMarkValue) {
                            //if (!(t.isVisited) && t.totalGoingTimeSeconds < currentMarkValue) {
                            p = t;
                            currentMarkValue = p.totalTimeSeconds + p.heuristicTimeToFinalPoint;
                            //currentMarkValue = p.totalGoingTimeSeconds;
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
                /*if (selectedPointTotalTimeSeconds + selectedPoint.heuristicTimeToFinalPoint > this.finalPoint.totalTimeSeconds + overLimitResedvedTime) //... Пропускаем и удаляем, если значение метки превышает минимальное время до пункта назначения.
                {
                    break;
                }*/
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
                                            if (selectedPointFromWhichRoute != null && selectedPointFromWhichRoute !== selectedRoute) {
                                                momentWhenAskingForGoing += reservedTime;
                                            }

                                            // Подсчитываем, сколько будем ожидать этот транспорт на остановке:
                                            var waitingTime = table.findTimeAfter(momentWhenAskingForGoing, day);

                                            // Момент, когда мы сядем в транспорт:
                                            var momentWhenSitInTransport = momentWhenAskingForGoing + waitingTime;

                                            // Расписание данного транспорта на следующей остановке:
                                            var tbl = selectedRoute.getTimetable(nextStation);

                                            // (сколько будем ехать до следующей остановки):
                                            var goingOnTransportTime = tbl.findTimeAfter(momentWhenSitInTransport, day);

                                            // Метка времени:
                                            //var dispatchTime = momentWhenSitInTransport - time;//momentWhenComingToStation + selectedPointTotalTimeSeconds;
                                            //var arrivalTime = dispatchTime + goingOnTransportTime;
                                            //var onNextPointTotalTimeSeconds = arrivalTime;

                                            var dispatchTime = momentWhenSitInTransport - momentWhenComingToStation + selectedPointTotalTimeSeconds;
                                            var arrivalTime = dispatchTime + goingOnTransportTime;
                                            var onNextPointTotalTimeSeconds = arrivalTime;

                                            //var dispatchTime = /*selectedPoint.arrivalTime +*/ waitingTime + selectedPointTotalTimeSeconds;
                                            //var arrivalTime = momentWhenSitInTransport - momentWhenComingToStation + selectedPointTotalTimeSeconds + goingOnTransportTime;
                                            //var onNextPointTotalTimeSeconds = arrivalTime;

                                            var nextPoint = this.findElement(nextStation);
                                            if (nextPoint.tryUpdate(onNextPointTotalTimeSeconds, selectedPoint, selectedPointStation, selectedRoute, arrivalTime, 2160000000, dispatchTime, selectedPoint.totalGoingTimeSeconds)) {
                                                //selectedPoint.dispatchTime = 
                                                //selectedPoint.setDispatchTime(dispatchTime);
                                                //nextPoint.previousPoint.setDispatchTime(dispatchTime);

                                                //console.log("upd...");
                                                //if(selectedPoint.dispatchTime == null) console.log(selectedPoint);
                                                /*if (selectedPointFromWhichRoute != null && selectedPointFromWhichRoute !== selectedRoute) {
                                                    //if(dispatchTime !== selectedPoint.dispatchTime){
                                                        //console.log("\nCurrent point:");
                                                        //console.log(selectedPoint);
                                                        console.log("Next point:");
                                                        console.log(nextPoint);
                                                        console.log("waitingTime = "+waitingTime);
                                                        console.log("time WhenComingToStation = "+(momentWhenComingToStation-time));
                                                        console.log("time WhenAskingForGoing = "+(momentWhenAskingForGoing-time));
                                                        console.log("time WhenSitInTransport = "+(momentWhenSitInTransport-time));
                                                        console.log("goingOnTransportTime = "+goingOnTransportTime);
                                                        console.log("arrive to current = "+selectedPoint.arrivalTime+" = "+nextPoint.previousPoint.arrivalTime);
                                                        console.log("dispath = "+dispatchTime+" = "+selectedPoint.dispatchTime+" = "+nextPoint.previousPoint.dispatchTime);
                                                        console.log("arrive to next = "+arrivalTime+" = "+nextPoint.arrivalTime);
                                                        
                                                        console.log("\n");
                                                    //}
                                                }*/
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

                        if (p.tryUpdate(newTime, selectedPoint, selectedPointStation, null, arrivalTime, 2160000000, selectedPointTotalTimeSeconds, selectedPoint.totalGoingTimeSeconds + goingTime)) {
                            //selectedPoint.setDispatchTime(selectedPointTotalTimeSeconds);
                            //console.log("upd...");
                        }
                    }
                }if (myIgnoringFragments != null && myIgnoringFragments.contains(null, null, selectedPointStationHashcode)) continue;

                // Пытаемся пройти пешком до пункта назначения:
                var goingTime = getTimeForGoingTo((0, _geoCoordsDistance2.default)(selectedPointCoords, this.finalPoint.coords), speed);
                var tryingNewTime = selectedPointTotalTimeSeconds + goingTime;
                if (this.finalPoint.tryUpdate(tryingNewTime, selectedPoint, selectedPointStation, null, tryingNewTime, 2160000000, selectedPointTotalTimeSeconds, selectedPoint.totalGoingTimeSeconds + goingTime)) {
                    //console.log("upd: " + selectedPointStation.hashcode);
                    //selectedPoint.setDispatchTime(selectedPointTotalTimeSeconds);
                }
            }
        }
    }, {
        key: 'optimizeFindedWay',
        value: function optimizeFindedWay(day, time, reservedTime, goingSpeed) {
            var tmp = [];
            //console.log("\n\n\nTry optimize...");
            if (this.finalPoint.previousPoint == null) return;
            // Сокращаем время ходьбы пешком до минимума и избавляемся от "бессмысленных" пересадок, сохраняя общее время неизменным:
            for (var _nextPoint = this.finalPoint.previousPoint, _selectedRoute = _nextPoint.fromWhichRoute, currentPoint = _nextPoint.previousPoint; _nextPoint !== this.startPoint; _nextPoint = _nextPoint.previousPoint, _selectedRoute = _nextPoint.fromWhichRoute, currentPoint = _nextPoint.previousPoint) {

                // Рассматриваем вершину только если использованные маршруты не совпадают. Пути "пешком" не рассматриваем.
                if (_selectedRoute == null || currentPoint === this.startPoint || currentPoint.fromWhichRoute === _selectedRoute) continue;

                var previousStationOfSelectedRoute = _selectedRoute.getPreviousStation(currentPoint.station); //!!! currentPoint
                if (previousStationOfSelectedRoute == null) continue;

                var point = previousStationOfSelectedRoute.point;
                if (point == null || !point.isVisited) continue;

                // Загружаем расписание:
                var table = _selectedRoute.getTimetable(previousStationOfSelectedRoute); //point.station
                if (table == null) continue;

                if (table.type === TableType.table) // Если это точное расписание, то:
                    {
                        // Момент отправки.
                        //var momentOfDispatchFromPoint = nextPoint.totalTimeSeconds + table.findTimeBefore(time + nextPoint.totalTimeSeconds, day);
                        var momentOfDispatchFromPoint = currentPoint.dispatchTime + table.findTimeBefore(time + currentPoint.dispatchTime, day);
                        //var momentOfDispatchFromPoint = point.arrivalTime + reservedTime + table.findTimeBefore(time + currentPoint.arrivalTime, day);

                        // Момент отправки не может наступить раньше момента прибытия на эту остановку.
                        if (momentOfDispatchFromPoint >= point.arrivalTime + reservedTime) {
                            //point.totalTimeSeconds

                            var p1 = point.getTotalGoingTime();
                            var p2 = currentPoint.getTotalGoingTime(); //!!! currentPoint
                            tmp.push({
                                /*point: currentPoint,
                                oldPrevious: currentPoint.previousPoint,
                                newPrevious: point,*/
                                route: _selectedRoute.number + " " + _selectedRoute.type,
                                p1: p1,
                                p2: p2,
                                s: point.station.name
                            });
                            if (p1 <= p2) {

                                //}

                                //console.log("Добавили станцию '" + point.station.name + "' к пути на транспорте '" + selectedRoute.type + " " + selectedRoute.number + "'");


                                //currentPoint.totalTimeSeconds = momentOfDispatchFromPoint + selectedRoute.getTimetable(currentPoint.station).findTimeAfter(time + momentOfDispatchFromPoint, day);
                                currentPoint.totalTimeSeconds = currentPoint.dispatchTime;

                                //console.log("\n"+currentPoint.arrivalTime+" to "+currentPoint.totalTimeSeconds);
                                currentPoint.arrivalTime = currentPoint.dispatchTime; //currentPoint.totalTimeSeconds;//!!!!!!!!!!!!!
                                //console.log("from "+point.dispatchTime+" to "+momentOfDispatchFromPoint+", pointArrivalTime = "+point.arrivalTime+", arrivalTime = "+currentPoint.arrivalTime);
                                point.dispatchTime = momentOfDispatchFromPoint; //!!!!!!!!!!!!!!

                                currentPoint.previousPoint = point;
                                currentPoint.fromWhichRoute = _selectedRoute;
                                currentPoint.fromWhichStation = previousStationOfSelectedRoute; //point.station;
                            }
                        }
                        //else console.log("Не будем добавлять станцию '" + point.station.name + "' к пути на транспорте '" + selectedRoute.type + " " + selectedRoute.number + "'. ( " + momentOfDispatchFromPoint + " < " + (point.totalTimeSeconds + reservedTime) + " )");
                    } else {
                    //if (table.type === TableType.periodic)
                    throw new Error();
                }
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var selectedRoute = this.finalPoint.previousPoint.fromWhichRoute;
            if (selectedRoute == null) return;

            var startStation = this.finalPoint.previousPoint.station;
            if (startStation == null) return;
            console.log("startStation: " + startStation.hashcode);
            var minimalDistance = (0, _geoCoordsDistance2.default)(this.finalPoint.previousPoint.coords, this.finalPoint.coords);
            var oldDistance = minimalDistance;
            for (var selectedPoint = this.finalPoint.previousPoint, nextPoint;; selectedPoint = nextPoint) {
                var selectedPointStation = selectedPoint.station;
                var nextStation = selectedRoute.getNextStation(selectedPointStation);
                console.log(nextStation); //11111111111111
                if (nextStation == null || nextStation === selectedPointStation || nextPoint.hashcode === startStation.hashcode) break;
                nextPoint = this.findElement(nextStation);
                var dist = (0, _geoCoordsDistance2.default)(nextPoint.coords, this.finalPoint.coords);
                //console.log("Check to change "+minimalDistance+" to "+dist);
                if (dist < minimalDistance) {
                    minimalDistance = dist;
                }
            }
            console.log("!!!!!!!!!!! Can change " + oldDistance + " to " + minimalDistance);
            return; //11111111111
            console.log("111111111111111111111111111111111111");
            if (oldDistance > minimalDistance) {
                for (var _selectedPoint = this.finalPoint.previousPoint;;) {

                    if ((0, _geoCoordsDistance2.default)(_selectedPoint.coords, this.finalPoint.coords) == minimalDistance) break;

                    var selectedPointStation = _selectedPoint.station;
                    // Следующая остановка у данного транспорта:
                    var _nextStation = selectedRoute.getNextStation(selectedPointStation);

                    if (_nextStation != null) // Если остановка не является конечной, то:
                        {
                            // Загружаем расписание:
                            var table = selectedRoute.getTimetable(selectedPointStation);
                            if (table == null) continue;
                            // Блокируем попытку попасть указанным транспортом на указанную остановку:
                            //if (myIgnoringFragments!= null && myIgnoringFragments.contains(nextStation.hashcode, selectedRoute.hashcode, selectedPointStationHashcode)) continue;

                            if (table.type === TableType.table) // Если это точное расписание, то:
                                {
                                    // Момент, когда мы сядем в транспорт:
                                    var momentWhenSitInTransport = time + _selectedPoint.totalTimeSeconds;

                                    // Расписание данного транспорта на следующей остановке:
                                    var tbl = selectedRoute.getTimetable(_nextStation);

                                    // (сколько будем ехать до следующей остановки):
                                    var goingOnTransportTime = tbl.findTimeAfter(momentWhenSitInTransport, day);

                                    var arrivalTime = _selectedPoint.totalTimeSeconds + goingOnTransportTime;
                                    var onNextPointTotalTimeSeconds = arrivalTime;

                                    var nextPoint = this.findElement(_nextStation);

                                    nextPoint.fromWhichRoute = selectedRoute;
                                    nextPoint.previousPoint = _selectedPoint;
                                    nextPoint.totalTimeSeconds = onNextPointTotalTimeSeconds;
                                    nextPoint.fromWhichStation = selectedPointStation;
                                    nextPoint.arrivalTime = arrivalTime;
                                    nextPoint.dispatchTime = arrivalTime;
                                    nextPoint.totalGoingTimeSeconds = _selectedPoint.totalGoingTimeSeconds;
                                    var newDistance = (0, _geoCoordsDistance2.default)(nextPoint.coords, this.finalPoint.coords);
                                    var newGoingTimeFromNewToFinal = getTimeForGoingTo(newDistance, goingSpeed);
                                    this.finalPoint.previousPoint = nextPoint;
                                    this.finalPoint.fromWhichStation = _nextStation;
                                    this.finalPoint.totalTimeSeconds = arrivalTime + newGoingTimeFromNewToFinal;
                                    this.finalPoint.arrivalTime = arrivalTime + newGoingTimeFromNewToFinal;
                                    this.finalPoint.totalGoingTimeSeconds = nextPoint.totalGoingTimeSeconds + newGoingTimeFromNewToFinal;

                                    _selectedPoint = nextPoint;
                                } else if (table.type === TableType.periodic) {
                                throw new Error();
                            }
                        }
                }
            }
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


            //console.log(tmp);
        }
    }, {
        key: 'fixTimeAttributes',
        value: function fixTimeAttributes(day, time, reservedTime) {
            //...

            if (this.finalPoint.previousPoint == null) return;
            // Сокращаем время ходьбы пешком до минимума и избавляемся от "бессмысленных" пересадок, сохраняя общее время неизменным:
            for (var nextPoint = this.finalPoint.previousPoint, selectedRoute = nextPoint.fromWhichRoute, currentPoint = nextPoint.previousPoint; nextPoint !== this.startPoint; nextPoint = nextPoint.previousPoint, selectedRoute = nextPoint.fromWhichRoute, currentPoint = nextPoint.previousPoint) {

                // Рассматриваем вершину только если использованные маршруты не совпадают. Пути "пешком" не рассматриваем.
                if (selectedRoute == null || currentPoint === this.startPoint /*|| currentPoint.fromWhichRoute === selectedRoute*/) continue;

                // Загружаем расписание:
                var table = selectedRoute.getTimetable(currentPoint.station);
                if (table == null) continue;

                if (table.type === TableType.table) // Если это точное расписание, то:
                    {
                        // Момент отправки.
                        //var momentOfDispatchFromPoint = nextPoint.totalTimeSeconds + table.findTimeBefore(time + nextPoint.totalTimeSeconds, day);
                        var momentOfDispatchFromPoint = nextPoint.dispatchTime + table.findTimeBefore(time + nextPoint.dispatchTime, day);
                        //var momentOfDispatchFromPoint = point.arrivalTime + reservedTime + table.findTimeBefore(time + currentPoint.arrivalTime, day);

                        currentPoint.dispatchTime = momentOfDispatchFromPoint;
                        if (currentPoint.fromWhichRoute != selectedRoute) {
                            currentPoint.totalTimeSeconds = currentPoint.arrivalTime + reservedTime;
                        } else {
                            currentPoint.arrivalTime = momentOfDispatchFromPoint;
                            currentPoint.totalTimeSeconds = momentOfDispatchFromPoint;
                        }
                    } else {
                    //if (table.type === TableType.periodic)
                    throw new Error();
                }
            }
        }
    }, {
        key: 'countShortWay',
        value: function countShortWay(ignoringRoutes, myIgnoringFragments, time, types, speed, reservedTime) {
            //try {

            var day = new Date().getDay();

            this.countFirstShortestWay(ignoringRoutes, myIgnoringFragments, day, time, types, speed, reservedTime);
            this.optimizeFindedWay(day, time, reservedTime, speed);
            this.fixTimeAttributes(day, time, reservedTime);

            //}
            //catch(e) {
            //     console.log(e);
            //}
        }
    }]);

    return Points;
}();

exports.default = Points;