//import IgnoringFragments from './ignoringFragments';
import OptimalRoute from './optimalRoute';
import OptimalWay from './optimalWay';
import Points from './points';

import distance from 'geo-coords-distance';

const heuristicBestTransportSpeed = 40;

function getStationsAround(allStations, nowPos, needPos, goingSpeed, heuristicBestTransportSpeed) {
    var result = [];
    const fullDistance = distance(nowPos, needPos);
    for (var i = 0, n = allStations.length, s = allStations[0]; i < n; s = allStations[++i]) {
        if (s != null && fullDistance > distance(nowPos, s.coords) + goingSpeed * distance(s.coords, needPos) / heuristicBestTransportSpeed) {
            result.push(s);
        }
    }
    return result;
}

class OptimalRoutesCollection extends Array {
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
    constructor(allStations, nowPos, needPos, time, types, speed, dopTimeMinutes, oneWayOnly) {
        super();
        //dopTimeMinutes = -2;
        //console.log("TEST_111111111111111111111111111111111111111111111111111111111111111");/////////////////////////////////!!!!!!!!!!!!!!!!!!!!!!!
        this.getOptimalWays = function() {
            var result = [];
            for (var i = 0, n = this.length, r = this[0]; i < n; r = this[++i]) {
                result.push(new OptimalWay(r));
            }
            return result;
        }
        this.selectOptimalRouteWithMinimalMark = function() {
            var p = null;
            for (var i = 0, n = this.length, t = this[0]; i < n; t = this[++i]) {
                if (!(t.isVisited)) {
                    p = t;
                    for (t = this[++i]; i < n; t = this[++i]) {
                        if (!(t.isVisited) && t.oldTotalTimeSeconds < p.oldTotalTimeSeconds) {
                            p = t;
                        }
                    }
                    return p;
                }
            }
            return null;
        }

        var myPoints = new Points(nowPos, needPos);
        // Получим "начальный" список станций:
        var stationsList = getStationsAround(allStations, nowPos, needPos, speed, heuristicBestTransportSpeed);

        this.push(new OptimalRoute(myPoints, stationsList, /*nowPos, needPos,*/ time, types, speed, dopTimeMinutes));

        var ignoringRoutes = [];

        //var ignoringFragments = new IgnoringFragments();
        
        var tmpAllCount = 1, tmpRealCount = 1;
        

        //oneWayOnly = true;//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        var maxCount = 200, totalCount = 0;
        if (!oneWayOnly){
        
            //TODO: use solutions tree
            for (var selectedOptimalRoute = this[0]; selectedOptimalRoute != null && totalCount < maxCount; selectedOptimalRoute.setVisited(), selectedOptimalRoute = this.selectOptimalRouteWithMinimalMark(), totalCount++) {
                var ddd = 0.85;

                ignoringRoutes = [];
                // Проходим по всем ребрам выбранного пути и строим новые маршруты при удалении ребер:
                for (var tmpP = selectedOptimalRoute.myPoints.finalPoint; tmpP.previousPoint != null; tmpP = tmpP.previousPoint) {
                    if(tmpP == null) console.log("err in optimalRoutesCollection.js");
                    if (/*tmpP.fromWhichRoute != null &&*/ !ignoringRoutes.includes(tmpP.fromWhichRoute)) ignoringRoutes.push(tmpP.fromWhichRoute);
                }
                for (var i = 0, n = ignoringRoutes.length, r = ignoringRoutes[0]; i < n; r = ignoringRoutes[++i]) {
                    if (selectedOptimalRoute.ignoringRoutes.includes(r)) continue;
                    var ignoringRoutesAdd = [];
                    ignoringRoutesAdd = ignoringRoutesAdd.concat(selectedOptimalRoute.ignoringRoutes);
                    ignoringRoutesAdd.push(r);

                    clearStations(allStations);//stationsList);

                    myPoints = new Points(nowPos, needPos);
                    var tmpOptimalRoute = new OptimalRoute(myPoints, stationsList, /*nowPos, needPos,*/ time, types, speed, dopTimeMinutes, ignoringRoutesAdd);
                    
                    tmpAllCount++;

                    if (tmpOptimalRoute.oldTotalTimeSeconds <= this[0].oldTotalTimeSeconds / ddd + 1200) {
                        tmpOptimalRoute.hash = JSON.stringify(tmpOptimalRoute.points);
                        var ok = false;
                        for (var j = 0, m = this.length, opt = this[0]; j < m; opt = this[++j]) {
                            if (opt.hash == null) opt.hash = JSON.stringify(opt.points);
                            if (opt.hash === tmpOptimalRoute.hash) {
                                ok = true;
                                break;
                            }
                        }
                        if (ok) continue;
                        this.push(tmpOptimalRoute);
                        tmpRealCount++;
                        //console.log(tmpOptimalRoute);//!!!!!!!!!!!
                    }
                }
            }
        }

        //for(var i = 0, n = this.length; i < n; i++){
        //    this[i].optimizeAroundFinalPoint();
        //}
        console.log("All: "+ tmpAllCount + ", real: " + tmpRealCount);
        //console.log(this);
    }
}

export default OptimalRoutesCollection;

function clearStations(stations){
    //var j = 0;
    for(let i = 0, n = stations.length; i < n; i++){
        //if(stations[i].point) j++;
        stations[i].point = null;
    }
    //console.log("Cleared: "+j+" stations.");
}