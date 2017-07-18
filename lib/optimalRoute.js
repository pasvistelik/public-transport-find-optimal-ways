"use strict";

Object.defineProperty(exports, "__esModule", {
        value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import Points from './points';
//import IgnoringFragments from './ignoringFragments';

var OptimalRoute = function () {
        function OptimalRoute(myPoints, stationsList, /*nowPos, needPos,*/time, types, goingSpeed, dopTimeMinutes, ignoringRoutesAdd, ignoringList) {
                (0, _classCallCheck3.default)(this, OptimalRoute);

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

                myPoints.fillStartData(stationsList, goingSpeed, reservedTimeSeconds, this.myIgnoringFragments);

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

                this.myPoints = myPoints;

                this.isVisited = false;
        }

        (0, _createClass3.default)(OptimalRoute, [{
                key: "setVisited",
                value: function setVisited() {
                        this.isVisited = true;
                }
        }]);
        return OptimalRoute;
}();

exports.default = OptimalRoute;