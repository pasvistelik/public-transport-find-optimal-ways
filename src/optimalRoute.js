 //import Points from './points';
//import IgnoringFragments from './ignoringFragments';

class OptimalRoute {
    constructor(myPoints, stationsList, /*nowPos, needPos,*/ time, types, goingSpeed, dopTimeMinutes, ignoringRoutesAdd, ignoringList) {
        if (ignoringRoutesAdd != null) this.ignoringRoutes = ignoringRoutesAdd;
        else this.ignoringRoutes = [];

        this.points = [];

        //this.needPos = needPos;
        //this.nowPos = nowPos;
        this.goingSpeed = goingSpeed;
        this.time = time;
        var reservedTimeSeconds = 60 * dopTimeMinutes;

        this.types = types;

        this.myIgnoringFragments = null;
        //if (ignoringList != null) this.myIgnoringFragments = new IgnoringFragments(ignoringList);
        //else this.myIgnoringFragments = new IgnoringFragments();

        //var myPoints = new Points(nowPos, needPos);
        
        myPoints.fillStartData(stationsList, goingSpeed, reservedTimeSeconds, this.myIgnoringFragments, this.ignoringRoutes);

        // Находим кратчайшие пути до всех вершин:
        myPoints.countShortWay(this.ignoringRoutes, this.myIgnoringFragments, time, types, goingSpeed, reservedTimeSeconds);

        var tmpP = myPoints.finalPoint;
        this.points.push(tmpP.toString());////
        while (tmpP.previousPoint != null) {
            tmpP = tmpP.previousPoint;//
            this.points.push(tmpP.toString());
            if (tmpP.previousPoint == null && tmpP.coords !== myPoints.startPoint.coords)
                throw new Error("Где-то удалилась часть маршрута...");
        }

        this.totalTimeSeconds = myPoints.finalPoint.totalTimeSeconds;
        this.totalGoingTime = myPoints.finalPoint.getTotalGoingTime();
        this.totalTransportChangingCount = myPoints.finalPoint.getTotalTransportChangingCount();
        this.totalWaitingTime = myPoints.finalPoint.getTotalWaitingTime();
        this.minimalWaitingTime = myPoints.finalPoint.getMinimalWaitingTime();
     
        this.riskEffectivity = myPoints.finalPoint.getRiskEffectivity();

        this.myPoints = myPoints;


        this.isVisited = false;
    }

    setVisited() {
        this.isVisited = true;
    }

}

export default OptimalRoute;