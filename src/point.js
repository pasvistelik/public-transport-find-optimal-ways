class Point {
    constructor(totalTimeSeconds, station_or_crds, fromWhichStation, fromWhichRoute) {
        if (station_or_crds.hashcode !== undefined) {
            this.station = station_or_crds;
            this.stationCode = station_or_crds.hashcode;
            station_or_crds.point = this;
            this.coords = station_or_crds.coords;
        }
        else {
            this.coords = station_or_crds;
            this.station = null;
            this.stationCode = null;
        }
        this.totalTimeSeconds = totalTimeSeconds;
        this.fromWhichStation = fromWhichStation;
        this.fromWhichRoute = fromWhichRoute;

        this.isVisited = false;

        this.previousPoint = null;

        this.arrivalTime = null;
        this.dispatchTime = null;
    }
    tryUpdate(totalTimeSeconds, previousPoint, fromWhichStation, fromWhichRoute, arrivalTime, dispatchTime) {
        if (totalTimeSeconds < this.totalTimeSeconds) {
            this.fromWhichRoute = fromWhichRoute;
            this.previousPoint = previousPoint;
            this.totalTimeSeconds = totalTimeSeconds;
            this.fromWhichStation = fromWhichStation;
            this.arrivalTime = arrivalTime;
            this.dispatchTime = dispatchTime;

            return true;
        }
        return false;
    }
    setVisited() {
        this.isVisited = true;
    }
    toString() {
        var to, tr; //, from, p;
        //if (this.fromWhichStation != null) from = this.fromWhichStation.name;
        //else from = "null";
        if (this.station != null) to = this.station.name;
        else to = "null";
        if (this.fromWhichRoute != null) tr = this.fromWhichRoute.type + " " + this.fromWhichRoute.number + " " + this.fromWhichRoute.from + " - " + this.fromWhichRoute.to;
        else tr = "пешком";
        //if (this.previousPoint != null) p = this.previousPoint.toString();
        //else p = "null";
        return /*p+" -->> */"(" + this.totalTimeSeconds + ") " + to + " (" + tr + ")"; // from " + from + " to
    }
    getTotalGoingTime() {
        var goingTime = 0;
        var tmpP = this;
        //this.points.Add(tmpP.ToString());
        while (tmpP.previousPoint != null) {
            if (tmpP.fromWhichRoute == null /*&& tmpP.fromWhichRoute.hashcode == null*/) goingTime += tmpP.totalTimeSeconds - tmpP.previousPoint.totalTimeSeconds;
            tmpP = tmpP.previousPoint;
        }
        return goingTime;
    }
    getTotalTransportChangingCount() {
        var result = 0;
        var tmpP = this;
        //this.points.Add(tmpP.ToString());
        while (tmpP.previousPoint != null) {
            if (tmpP.fromWhichRoute != null && tmpP.fromWhichRoute.hashcode != null && tmpP.fromWhichRoute !== tmpP.previousPoint.fromWhichRoute) result++;
            tmpP = tmpP.previousPoint;
        }
        return result;
    }
    getTotalWaitingTime() {
        var result = 0;
        var tmpP = this.previousPoint;
        while (tmpP.previousPoint != null) {
            result += tmpP.dispatchTime - tmpP.arrivalTime;
            tmpP = tmpP.previousPoint;
        }
        return result;
    }
    getMinimalWaitingTime() {
        var tmpP = this.previousPoint;
        var result = tmpP.dispatchTime - tmpP.arrivalTime;
        tmpP = tmpP.previousPoint;
        if(tmpP == null) return result;
        while (tmpP.previousPoint != null) {
            var temp = tmpP.dispatchTime - tmpP.arrivalTime;
            if(temp < result) result = temp;
            tmpP = tmpP.previousPoint;
        }
        return result;
    }
}

export default Point;