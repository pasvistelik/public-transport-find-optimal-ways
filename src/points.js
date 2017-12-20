import Point from './point';

import distance from 'geo-coords-distance';


function getTimeForGoingTo(distance, goingSpeed) {
    return Math.floor(distance / (goingSpeed / 3.6));
}

function getHeuristicTime(a_coords, b_coords) {
    return distance(a_coords, b_coords) / 5;
}

const TableType = { table: 1, periodic: 2 };

function distanceBetweenStations(station_a, station_b){
    var result = null;
    if ((result=station_a.distance_to[station_b.local_id]) !== 0){
        return result;
    }
    else {
        var dist = distance(station_a.coords, station_b.coords);
        station_a.distance_to[station_b.local_id] = dist;
        station_b.distance_to[station_a.local_id] = dist;
        return dist;
    }
}

class Points {
    constructor(nowPos, needPos) {
        this.collection = [];
        this.startPoint = new Point(0, nowPos, null, null, 0);
        this.finalPoint = new Point(2160000000, needPos, null, null, 2160000000);
        this.currentSelectedPoint = null;
    }
    findElement(station_or_point) {
        if (station_or_point.hashcode != null) {
            if (station_or_point.point != null) return station_or_point.point;
            var newCreatdPoint = new Point(2160000000, station_or_point, null, null, 2160000000);
            newCreatdPoint.heuristicTimeToFinalPoint = distance(newCreatdPoint.coords, this.finalPoint.coords) / 5;//!!!
            this.collection.push(newCreatdPoint);
            return newCreatdPoint;
        }
        else {
            console.log("test 0");
            for (var i = 0, n = this.collection.length, p = this.collection[0]; i < n; p = this.collection[++i]) {
                if (p.coords === station_or_point.coords && p.stationCode === station_or_point.stationCode) return p;
            }
            return null;
        }
    }
    fillStartData(stationsList, goingSpeed, reservedTime, myIgnoringFragments, ignoringRoutes) {
        var tmpTime = getTimeForGoingTo(distance(this.startPoint.coords, this.finalPoint.coords), goingSpeed);
        if (ignoringRoutes == null || !(ignoringRoutes.includes(null))) this.finalPoint.tryUpdate(tmpTime /*+ 1800/*+ TimeSpan.FromMinutes(20)*/, this.startPoint, null, null, tmpTime, 2160000000, 0, tmpTime);
        const finalPointCoords = this.finalPoint.coords;
        for (var i = 0, n = stationsList.length, st = stationsList[0], add, goingTime; i < n; st = stationsList[++i]) {
            if (myIgnoringFragments != null && myIgnoringFragments.contains(st.hashcode, null, null)) continue;

            add = new Point(2160000000, st, null, null, 2160000000);
            add.heuristicTimeToFinalPoint = distance(add.coords, finalPointCoords) / 5;
            goingTime = getTimeForGoingTo(distance(this.startPoint.coords, st.coords), goingSpeed);
            add.tryUpdate(goingTime + reservedTime, this.startPoint, null, null, goingTime, 2160000000, 0, goingTime); //!!!!! param_1: is need to add reservedTime??????
            this.collection.push(add);
        }
    }
    getNextUnvisitedPoint() {
        if (this.currentSelectedPoint != null) this.currentSelectedPoint.setVisited();

        this.currentSelectedPoint = this.selectPointWithMinimalMark();

        return this.currentSelectedPoint;
    }
    // TODO: Определять следующую вершину можно прямо на каждом шаге алгоритма при вызове tryUpdate, не придется повторно просматривать список.
    selectPointWithMinimalMark() {
        for (var i = 0, n = this.collection.length, t = this.collection[0], p = null, currentMarkValue; i < n; t = this.collection[++i]) {
            if (!(t.isVisited)) {
                p = t;
                currentMarkValue = p.totalTimeSeconds + p.heuristicTimeToFinalPoint;
                //currentMarkValue = p.totalGoingTimeSeconds;
                for (t = this.collection[++i]; i < n; t = this.collection[++i]) {
                    if (!(t.isVisited) && t.totalTimeSeconds + t.heuristicTimeToFinalPoint < currentMarkValue) {
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
    countFirstShortestWay(ignoringRoutes, myIgnoringFragments, day, time, types, speed, reservedTime, timeType) {

        const overLimitResedvedTime = 1200;

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
                if (selectedPointStation.routes != null) routesOnStation = selectedPointStation.routes;
                else continue;

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
                            if (myIgnoringFragments!= null && myIgnoringFragments.contains(nextStation.hashcode, selectedRoute.hashcode, selectedPointStationHashcode)) continue;

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
            for (var j = 0, m = this.collection.length, p = this.collection[0], goingTime, newTime; j < m; p = this.collection[++j])
                if (!p.isVisited && p !== selectedPoint) {
                    // Блокируем попытку дойти пешком до указанной остановки:
                    if (myIgnoringFragments != null && myIgnoringFragments.contains(p.stationCode, null, selectedPointStationHashcode)) continue;
                    
                    //goingTime = getTimeForGoingTo(distance(selectedPointCoords, p.coords), speed);//!!!!!!!!!!!!!!!!!!!!!111111111111111111_test
                    goingTime = getTimeForGoingTo(distanceBetweenStations(selectedPointStation, p.station), speed);

                    var arrivalTime = selectedPointTotalTimeSeconds + goingTime;
                    newTime = arrivalTime + reservedTime;
                    /*if (p != myFinishPoint)*/ // newTime += reservedTime;
                    
                    if (p.tryUpdate(newTime, selectedPoint, selectedPointStation, null, arrivalTime, 2160000000, selectedPointTotalTimeSeconds, selectedPoint.totalGoingTimeSeconds + goingTime)) {
                        //selectedPoint.setDispatchTime(selectedPointTotalTimeSeconds);
                        //console.log("upd...");
                    }
                }

            if (myIgnoringFragments != null && myIgnoringFragments.contains(null, null, selectedPointStationHashcode)) continue;
            
            // Пытаемся пройти пешком до пункта назначения:
            var goingTime = getTimeForGoingTo(distance(selectedPointCoords, this.finalPoint.coords), speed);
            var tryingNewTime = selectedPointTotalTimeSeconds + goingTime;
            if (this.finalPoint.tryUpdate(tryingNewTime, selectedPoint, selectedPointStation, null, tryingNewTime, 2160000000, selectedPointTotalTimeSeconds, selectedPoint.totalGoingTimeSeconds + goingTime)) {
                //console.log("upd: " + selectedPointStation.hashcode);
                //selectedPoint.setDispatchTime(selectedPointTotalTimeSeconds);
            }
        }


        this.finalPoint.oldTotalTimeSeconds = this.finalPoint.totalTimeSeconds;

        
    }
    optimizeFindedWay(day, time, reservedTime, speed) {
        var tmp = [];
        //console.log("\n\n\nTry optimize...");
        if(this.finalPoint.previousPoint == null) return;
        // Сокращаем время ходьбы пешком до минимума и избавляемся от "бессмысленных" пересадок, сохраняя общее время неизменным:
        for (let nextPoint = this.finalPoint.previousPoint, selectedRoute = nextPoint.fromWhichRoute, currentPoint = nextPoint.previousPoint; nextPoint !== this.startPoint; nextPoint = nextPoint.previousPoint, selectedRoute = nextPoint.fromWhichRoute, currentPoint = nextPoint.previousPoint) {
            
            // Рассматриваем вершину только если использованные маршруты не совпадают. Пути "пешком" не рассматриваем.
            if (selectedRoute == null || currentPoint === this.startPoint || currentPoint.fromWhichRoute === selectedRoute) continue;
            
            var previousStationOfSelectedRoute = selectedRoute.getPreviousStation(currentPoint.station);//!!! currentPoint
            if (previousStationOfSelectedRoute == null) continue;

            var point = previousStationOfSelectedRoute.point;
            if (point == null || !(point.isVisited)) continue;

            // Загружаем расписание:
            var table = selectedRoute.getTimetable(previousStationOfSelectedRoute);//point.station
            if (table == null) continue;

            if (table.type === TableType.table) // Если это точное расписание, то:
            {
                // Момент отправки.
                //var momentOfDispatchFromPoint = nextPoint.totalTimeSeconds + table.findTimeBefore(time + nextPoint.totalTimeSeconds, day);
                var momentOfDispatchFromPoint = currentPoint.dispatchTime + table.findTimeBefore(time + currentPoint.dispatchTime, day);
                //var momentOfDispatchFromPoint = point.arrivalTime + reservedTime + table.findTimeBefore(time + currentPoint.arrivalTime, day);

                // Момент отправки не может наступить раньше момента прибытия на эту остановку.
                if (momentOfDispatchFromPoint >= point.arrivalTime + reservedTime) {  //point.totalTimeSeconds

                    var p1 = point.getTotalGoingTime();
                    var p2 = currentPoint.getTotalGoingTime();//!!! currentPoint
                    tmp.push({
                        /*point: currentPoint,
                        oldPrevious: currentPoint.previousPoint,
                        newPrevious: point,*/
                        route: selectedRoute.number + " " + selectedRoute.type,
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
                        currentPoint.arrivalTime = currentPoint.dispatchTime;//currentPoint.totalTimeSeconds;//!!!!!!!!!!!!!
                        //console.log("from "+point.dispatchTime+" to "+momentOfDispatchFromPoint+", pointArrivalTime = "+point.arrivalTime+", arrivalTime = "+currentPoint.arrivalTime);
                        point.dispatchTime = momentOfDispatchFromPoint;//!!!!!!!!!!!!!!
                        
                        currentPoint.previousPoint = point;
                        currentPoint.fromWhichRoute = selectedRoute;
                        currentPoint.fromWhichStation = previousStationOfSelectedRoute;//point.station;
                    }
                }
                //else console.log("Не будем добавлять станцию '" + point.station.name + "' к пути на транспорте '" + selectedRoute.type + " " + selectedRoute.number + "'. ( " + momentOfDispatchFromPoint + " < " + (point.totalTimeSeconds + reservedTime) + " )");
            }
            else  { //if (table.type === TableType.periodic)
                throw new Error();
            }
            
        }



        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        if (this.finalPoint.previousPoint == null) return;
        var selectedRoute = this.finalPoint.previousPoint.fromWhichRoute;
        if (selectedRoute == null) return;
        
        
        var startStation = this.finalPoint.previousPoint.station;
        var oldStation = startStation, NewStation = startStation;
        if (startStation == null) return;
        var minimalDistance = distance(startStation.coords, this.finalPoint.coords);
        var oldDistance = minimalDistance;
        var appendedTimeSeconds = 0;
        var oldTotalTimeSeconds = this.finalPoint.totalTimeSeconds, newTotalTimeSeconds = oldTotalTimeSeconds;
        //for (var selectedPointStation = startStation, nextStation; ; selectedPointStation = nextStation){
        for (var selectedPoint = this.finalPoint.previousPoint, selectedPointStation, nextPoint, nextStation; ; selectedPoint = nextPoint){
            selectedPointStation = selectedPoint.station;
            nextStation = selectedRoute.getNextStation(selectedPointStation);
            //console.log(nextStation);//11111111111111
            if (nextStation == null || nextStation === selectedPointStation || nextStation === startStation) break;


            // Загружаем расписание:
            var table = selectedRoute.getTimetable(nextStation);
            if (table == null) continue;

            if (table.type === TableType.table) // Если это точное расписание, то:
            {
                // Момент, когда мы сядем в транспорт:
                var momentWhenSitInTransport = time + selectedPoint.totalTimeSeconds;
                
                // (сколько будем ехать до следующей остановки):
                var goingOnTransportTime = table.findTimeAfter(momentWhenSitInTransport, day);

                var arrivalTime = selectedPoint.totalTimeSeconds + goingOnTransportTime;

                nextPoint = this.findElement(nextStation);

                //nextPoint.tryUpdate(arrivalTime, selectedPoint, selectedPointStation, selectedRoute, arrivalTime, arrivalTime, selectedPoint.dispatchTime, selectedPoint.totalGoingTimeSeconds, true);

                var newDistance = distance(nextPoint.coords, this.finalPoint.coords);
                var newGoingTimeFromNewToFinal = getTimeForGoingTo(newDistance, speed);

                if (oldTotalTimeSeconds + 600 < arrivalTime + newGoingTimeFromNewToFinal) break;

                if (newDistance < minimalDistance){
                    minimalDistance = newDistance;
                    NewStation = nextStation;
                    appendedTimeSeconds = arrivalTime + newGoingTimeFromNewToFinal - oldTotalTimeSeconds;
                }
            }
            else if (table.type === TableType.periodic) {
                throw new Error();
            }
        }
        if (minimalDistance < oldDistance) console.log("["+selectedRoute.type+" "+selectedRoute.number+"][+"+appendedTimeSeconds+" seconds, -"+getTimeForGoingTo(minimalDistance-oldDistance, speed)+" going seconds]: Can change "+oldStation.name+"("+oldDistance+") to "+NewStation.name+"("+minimalDistance+")");
        //return;
        //console.log("111111111111111111111111111111111111");
        if (oldDistance > minimalDistance){
            var oldTotalTimeSeconds = this.finalPoint.totalTimeSeconds;
            for (var selectedPoint = this.finalPoint.previousPoint; ;){
                
                if (distance(selectedPoint.coords, this.finalPoint.coords) === minimalDistance) break; // || selectedPoint.totalTimeSeconds > timeSeconds + 600

                var selectedPointStation = selectedPoint.station;
                // Следующая остановка у данного транспорта:
                var nextStation = selectedRoute.getNextStation(selectedPointStation);
                
                if (nextStation != null) // Если остановка не является конечной, то:
                {
                    // Загружаем расписание:
                    var table = selectedRoute.getTimetable(nextStation);
                    if (table == null) continue;
    
                    if (table.type === TableType.table) // Если это точное расписание, то:
                    {
                        // Момент, когда мы сядем в транспорт:
                        var momentWhenSitInTransport = time + selectedPoint.totalTimeSeconds;
                        
                        // (сколько будем ехать до следующей остановки):
                        var goingOnTransportTime = table.findTimeAfter(momentWhenSitInTransport, day);
    
                        var arrivalTime = selectedPoint.totalTimeSeconds + goingOnTransportTime;

                        var nextPoint = this.findElement(nextStation);
                        
                        /*nextPoint.fromWhichRoute = selectedRoute;
                        nextPoint.previousPoint = selectedPoint;
                        nextPoint.totalTimeSeconds = arrivalTime;
                        nextPoint.fromWhichStation = selectedPointStation;
                        nextPoint.arrivalTime = arrivalTime;
                        nextPoint.dispatchTime = arrivalTime;
                        nextPoint.totalGoingTimeSeconds = selectedPoint.totalGoingTimeSeconds;
                        nextPoint.isVisited = true;*/

                        nextPoint.tryUpdate(arrivalTime, selectedPoint, selectedPointStation, selectedRoute, arrivalTime, arrivalTime, selectedPoint.dispatchTime, selectedPoint.totalGoingTimeSeconds, true);

                        var newDistance = distance(nextPoint.coords, this.finalPoint.coords);
                        var newGoingTimeFromNewToFinal = getTimeForGoingTo(newDistance, speed);

                        if (oldTotalTimeSeconds < arrivalTime + newGoingTimeFromNewToFinal) break;

                        let oldValue = this.finalPoint.totalGoingTimeSeconds;

                        /*this.finalPoint.previousPoint = nextPoint;
                        this.finalPoint.fromWhichStation = nextStation;
                        this.finalPoint.totalTimeSeconds = arrivalTime + newGoingTimeFromNewToFinal;
                        this.finalPoint.arrivalTime = arrivalTime + newGoingTimeFromNewToFinal;
                        this.finalPoint.totalGoingTimeSeconds = nextPoint.totalGoingTimeSeconds + newGoingTimeFromNewToFinal;*/

                        this.finalPoint.tryUpdate(arrivalTime + newGoingTimeFromNewToFinal, nextPoint, nextStation, null, arrivalTime + newGoingTimeFromNewToFinal, 2160000000, nextPoint.dispatchTime, nextPoint.totalGoingTimeSeconds + newGoingTimeFromNewToFinal, true);

                        selectedPoint = nextPoint;

                        //console.log("[TMP]: Changed:  "+oldValue+" to "+(nextPoint.totalGoingTimeSeconds + newGoingTimeFromNewToFinal));
                    }
                    else if (table.type === TableType.periodic) {
                        throw new Error();
                    }
                }
    
            }
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        //console.log(tmp);
    }
    fixTimeAttributes(day, time, reservedTime, speed) {
        //...
        
        if(this.finalPoint.previousPoint == null) return;
        // Сокращаем время ходьбы пешком до минимума и избавляемся от "бессмысленных" пересадок, сохраняя общее время неизменным:
        for (let nextPoint = this.finalPoint.previousPoint, selectedRoute = nextPoint.fromWhichRoute, currentPoint = nextPoint.previousPoint; nextPoint !== this.startPoint; nextPoint = nextPoint.previousPoint, selectedRoute = nextPoint.fromWhichRoute, currentPoint = nextPoint.previousPoint) {
            
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
                }
                else {
                    currentPoint.arrivalTime = momentOfDispatchFromPoint
                    currentPoint.totalTimeSeconds = momentOfDispatchFromPoint;
                }
                
            }
            else  { //if (table.type === TableType.periodic)
                throw new Error();
            }
            
        }


        



    }
    countShortWay(ignoringRoutes, myIgnoringFragments, timeSeconds, transportTypes, goingSpeed, reservedTimeSeconds, timeType) {
        //try {

        var dayOfWeek = (new Date()).getDay();

        this.countFirstShortestWay(ignoringRoutes, myIgnoringFragments, dayOfWeek, timeSeconds, transportTypes, goingSpeed, reservedTimeSeconds, timeType);
        this.optimizeFindedWay(dayOfWeek, timeSeconds, reservedTimeSeconds, goingSpeed);


        





        //this.fixTimeAttributes(dayOfWeek, timeSeconds, reservedTimeSeconds, goingSpeed);//!!!!!!!!!!!!!!!!!!!!!!

        //}
        //catch(e) {
        //     console.log(e);
        //}
    }
}

export default Points;