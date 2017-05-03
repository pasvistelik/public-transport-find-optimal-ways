import Point from './point';
import GeoCoords from './../geo-coords-functions/geoCoords';
var distance = GeoCoords.distance;


function getTimeForGoingTo(distance, goingSpeed) {
    return Math.floor(distance / (goingSpeed / 3.6));
}

const TableType = { table: 1, periodic: 2 };

class Points {
    constructor(nowPos, needPos) {
        this.collection = [];
        this.startPoint = new Point(0, nowPos, null, null);
        this.finalPoint = new Point(2160000000, needPos, null, null);
        this.currentSelectedPoint = null;
    }
    findElement(station_or_point) {
        if (station_or_point.hashcode != null) {
            if (station_or_point.point != null) return station_or_point.point;
            var newCreatdPoint = new Point(2160000000, station_or_point, null, null);
            this.collection.push(newCreatdPoint);
            return newCreatdPoint;
        }
        else {
            for (var i = 0, n = this.collection.length, p = this.collection[0]; i < n; p = this.collection[++i]) {
                if (p.coords === station_or_point.coords && p.stationCode === station_or_point.stationCode) return p;
            }
            return null;
        }
    }
    fillStartData(stationsList, goingSpeed, reservedTime, myIgnoringFragments) {
        this.finalPoint.tryUpdate(getTimeForGoingTo(distance(this.startPoint.coords, this.finalPoint.coords), goingSpeed) + 1200/*+ TimeSpan.FromMinutes(20)*/, this.startPoint, null, null);
        for (var i = 0, n = stationsList.length, st = stationsList[0]; i < n; st = stationsList[++i]) {
            if (myIgnoringFragments != null && myIgnoringFragments.contains(st.hashcode, null, null)) continue;

            var add = new Point(2160000000, st, null, null);
            add.tryUpdate(getTimeForGoingTo(distance(this.startPoint.coords, st.coords), goingSpeed) + reservedTime, this.startPoint, null, null);
            this.collection.push(add);
        }
    }
    getNextUnvisitedPoint() {
        if (this.currentSelectedPoint != null) this.currentSelectedPoint.setVisited();

        this.currentSelectedPoint = this.selectPointWithMinimalMark();

        return this.currentSelectedPoint;
    }
    selectPointWithMinimalMark() {
        var p = null;
        for (var i = 0, n = this.collection.length, t = this.collection[0]; i < n; t = this.collection[++i]) {
            if (!(t.isVisited)) {
                p = t;
                for (t = this.collection[++i]; i < n; t = this.collection[++i]) {
                    if (!(t.isVisited) && t.totalTimeSeconds < p.totalTimeSeconds) {
                        p = t;
                    }
                }
                return p;
            }
        }
        return null;
    }
    countShortWay(ignoringRoutes, myIgnoringFragments, time, types, speed, reservedTime) {
        //TimeSpan overLimitResedvedTime = TimeSpan.FromMinutes(20);

        for (var selectedPoint = this.getNextUnvisitedPoint(), selectedPointStation, selectedPointTotalTimeSeconds, selectedPointStationHashcode, selectedPointFromWhichRoute, momentWhenComingToStation, routesOnStation, selectedPointCoords; selectedPoint != null; selectedPoint = this.getNextUnvisitedPoint()) {
            //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            selectedPointTotalTimeSeconds = selectedPoint.totalTimeSeconds;
            if (selectedPointTotalTimeSeconds > this.finalPoint.totalTimeSeconds/* + overLimitResedvedTime*/) //... Пропускаем и удаляем, если значение метки превышает минимальное время до пункта назначения.
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
                routesOnStation = null;// = routesOnStation = Database.GetRoutesOnStation(selectedPointStation.hashcode, canReadDataFromLocalCopy: true);
                if (selectedPointStation.routes != null) routesOnStation = selectedPointStation.routes;
                else continue;

                for (var i = 0, n = routesOnStation.length, selectedRoute = routesOnStation[0], nextStation; i < n; selectedRoute = routesOnStation[++i]) {
                    if (ignoringRoutes != null && ignoringRoutes.includes(selectedRoute)) continue;
                    if (types.includes(selectedRoute.type)) {
                        // Следующая остановка у данного тран спорта:
                        nextStation = selectedRoute.getNextStation(selectedPointStation);

                        /*// Код остановки, на которую попадем на данном транспорте:
                        string nextCode = selectedRoute.getNextStationCodeAfter(selectedPointStation.hashcode, canReadDataFromLocalCopy: true);*/
                        if (nextStation/*nextCode*/ != null) // Если остановка не является конечной, то:
                        {
                            // Загружаем расписание:
                            var table = selectedRoute.getTimetable(selectedPointStation);//Database.getTimetable(selectedPointStation.hashcode, selectedRoute.hashcode, databaseMysqlConnection, canReadDataFromLocalCopy: true);
                            // Блокируем попытку попасть указанным транспортом на указанную остановку:
                            if (myIgnoringFragments!= null && myIgnoringFragments.contains(nextStation.hashcode/*nextCode*/, selectedRoute.hashcode, selectedPointStationHashcode)) continue;

                            if (table.type === TableType.table) // Если это точное расписание, то:
                            {
                                // Минимальный начальный момент, с который можно начинать ожидать посадку:
                                var momentWhenAskingForGoing = momentWhenComingToStation;

                                // Резервируем дополнительное время, если будем пересаживаться на другой маршрут:
                                //if (selectedPoint.RouteCode == null || selectedPoint.RouteCode != selectedRoute.hashcode) momentWhenAskingForGoing += reservedTime;
                                if (selectedPointFromWhichRoute != null && selectedPointFromWhichRoute !== selectedRoute) momentWhenAskingForGoing += reservedTime;

                                // Подсчитываем, сколько будем ожидать этот транспорт на остановке:
                                var waitingTime = table.findTimeAfter(momentWhenAskingForGoing);

                                // Момент, когда мы сядем в транспорт:
                                var momentWhenSitInTransport = momentWhenAskingForGoing + waitingTime;

                                /*// Следующая остановка у данного транспорта:
                                Station nextStation = Database.GetStationByHashcode(nextCode, databaseMysqlConnection, canReadDataFromLocalCopy: true);*/

                                // И соответствующее расписание на этой остановке:
                                var tbl = selectedRoute.getTimetable(nextStation);//Database.getTimetable(nextStation.hashcode, selectedRoute.hashcode, databaseMysqlConnection, canReadDataFromLocalCopy: true);
                                
                                // (сколько будем ехать до следующей остановки):
                                var goingOnTransportTime = tbl.findTimeAfter(momentWhenSitInTransport);
                                
                                // Метка времени:
                                var onNextPointtotalTimeSeconds = momentWhenSitInTransport - momentWhenComingToStation + goingOnTransportTime + selectedPointTotalTimeSeconds;
                                
                                if (this.findElement(nextStation).tryUpdate(onNextPointtotalTimeSeconds, selectedPoint, selectedPointStation, selectedRoute)) {
                                    //console.log("upd...");
                                }
                            }
                            else if (table.type === TableType.periodic) {
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
            for (var j = 0, m = this.collection.length, p = this.collection[0], distanceToSelectedPoint, goingTime, newTime; j < m; p = this.collection[++j])
                if (!p.isVisited && p !== selectedPoint) {
                    // Блокируем попытку дойти пешком до указанной остановки:
                    if (myIgnoringFragments != null && myIgnoringFragments.contains(p.stationCode, null, selectedPointStationHashcode)) continue;

                    distanceToSelectedPoint = distance(selectedPointCoords, p.coords);
                    
                    goingTime = getTimeForGoingTo(distanceToSelectedPoint, speed/*, true, sp*/);

                    newTime = selectedPointTotalTimeSeconds + goingTime + reservedTime;
                    /*if (p != myFinishPoint)*/ // newTime += reservedTime;
                    
                    if (p.tryUpdate(newTime, selectedPoint, selectedPointStation, null)) {
                        //console.log("upd...");
                    }
                }

            if (myIgnoringFragments != null && myIgnoringFragments.contains(null, null, selectedPointStationHashcode)) continue;
            
            var tryingNewTime = selectedPointTotalTimeSeconds + getTimeForGoingTo(distance(selectedPointCoords, this.finalPoint.coords), speed);
            if (this.finalPoint.tryUpdate(tryingNewTime, selectedPoint, selectedPointStation, null)) {
                //console.log("upd: " + selectedPointStation.hashcode);
            }
        }

        // Сокращаем время ходьбы пешком до минимума и избавляемся от "бессмысленных" пересадок, сохраняя общее время неизменным:
        var currentPoint = this.finalPoint.previousPoint;
        while (currentPoint !== this.startPoint) {
            var r = currentPoint.fromWhichRoute;
            if (r != null) {
                var previousPoint = currentPoint.previousPoint;
                if (previousPoint !== this.startPoint && previousPoint.fromWhichRoute !== r) // Если на предыдущую остановку мы добрались другим транспортом, то:
                {
                    var previousRouteStation = r.getPreviousStation(previousPoint.station);
                    if (previousRouteStation != null) {
                        var point = previousRouteStation.point;
                        if (point != null && point.isVisited) {
                            var ttt = r.getTimetable(previousRouteStation);
                            if (ttt != null) {
                                //var ddd = time + previousPoint.totalTimeSeconds;
                                //var moment = r.getTimetable(currentPoint.station).findTimeAfter(ddd);
                                //var tmp_time = ttt.findTimeBefore(ddd + moment);

                                //var momentArriveOnCurrent = previousPoint.totalTimeSeconds + moment;
                                //var momentSittingOnPrevious = momentArriveOnCurrent + tmp_time;
                                /*bool bbb = point.fromWhichRoute != null && point.fromWhichRoute.getTimetable(point.station) != null && point.fromWhichRoute.getTimetable(point.station).findTimeAfter(time + point.totalTimeSeconds) <= previousPoint.totalTimeSeconds + moment + tmp_time;
                                if (bbb)
                                {
                                    previousPoint.fromWhichRoute = r;
                                    previousPoint.previousPoint = point;////!bbb && point.totalTimeSeconds <= momentSittingOnPrevious &&
                                }
                                else */
                                if (/*point.totalGoingTime>=previousPoint.totalGoingTime || */point.totalTimeSeconds <= previousPoint.totalTimeSeconds/* && point.totalGoingTime <= previousPoint.totalGoingTime*/) {
                                    previousPoint.fromWhichRoute = r;
                                    previousPoint.previousPoint = point;
                                }
                            }
                        }
                    }
                }
            }
            currentPoint = currentPoint.previousPoint;
        }
    }


}

export default Points;