import WayPoint from './wayPoint';

class OptimalWay {
    constructor(optimalRoute) {
        this.totalTimeSeconds = optimalRoute.totalTimeSeconds;
        this.totalGoingTimeSeconds = optimalRoute.totalGoingTime;
        this.totalTransportChangingCount = optimalRoute.totalTransportChangingCount;
        this.totalWaitingTime = optimalRoute.totalWaitingTime;
        this.minimalWaitingTime = optimalRoute.minimalWaitingTime;
        //this.minimalWaitingTime = 0;
        this.points = [];

        for (var tmpP = optimalRoute.myPoints.finalPoint; tmpP != null; tmpP = tmpP.previousPoint) {
            this.points.push(new WayPoint(tmpP.totalTimeSeconds, tmpP.station, tmpP.fromWhichRoute, tmpP.coords, tmpP.arrivalTime, tmpP.dispatchTime));
        }
        this.points.reverse();
    }

}

export default OptimalWay;