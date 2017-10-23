"use strict";

Object.defineProperty(exports, "__esModule", {
        value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//import Points from './points';
//import IgnoringFragments from './ignoringFragments';

var OptimalRoute = function () {
        function OptimalRoute(myPoints, stationsList, /*nowPos, needPos,*/time, types, goingSpeed, dopTimeMinutes, ignoringRoutesAdd, ignoringList) {
                _classCallCheck(this, OptimalRoute);

                if (ignoringRoutesAdd != null) this.ignoringRoutes = ignoringRoutesAdd;else this.ignoringRoutes = [];

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
                this.points.push(tmpP.toString()); ////
                while (tmpP.previousPoint != null) {
                        tmpP = tmpP.previousPoint; //
                        this.points.push(tmpP.toString());
                        if (tmpP.previousPoint == null && tmpP.coords !== myPoints.startPoint.coords) throw new Error("Где-то удалилась часть маршрута...");
                }

                this.totalTimeSeconds = myPoints.finalPoint.totalTimeSeconds;
                this.totalGoingTime = myPoints.finalPoint.getTotalGoingTime();
                this.totalTransportChangingCount = myPoints.finalPoint.getTotalTransportChangingCount();

                this.totalWaitingTime = myPoints.finalPoint.getTotalWaitingTime();
                this.minimalWaitingTime = myPoints.finalPoint.getMinimalWaitingTime();

                this.myPoints = myPoints;

                this.isVisited = false;
        }

        _createClass(OptimalRoute, [{
                key: "setVisited",
                value: function setVisited() {
                        this.isVisited = true;
                }
        }]);

        return OptimalRoute;
}();

exports.default = OptimalRoute;