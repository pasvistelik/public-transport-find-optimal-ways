"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IgnoringFragments = function (_Array) {
    _inherits(IgnoringFragments, _Array);

    function IgnoringFragments() {
        _classCallCheck(this, IgnoringFragments);

        var _this = _possibleConstructorReturn(this, (IgnoringFragments.__proto__ || Object.getPrototypeOf(IgnoringFragments)).call(this));

        _this.abc = 1;
        if (arguments[0] != null && arguments[0].length !== 0) {
            try {
                for (var i = 0, n = arguments[0].length, item = arguments[0][0]; i < n; item = arguments[0][++i]) {
                    _this.push(item);
                }
            } catch (ex) {
                console.log(ex.message);
            }
        }
        return _this;
    }

    _createClass(IgnoringFragments, [{
        key: "contains",
        value: function contains(stationCode, routeCode, fromStationCode) {
            for (var i = 0, n = this.length, r = this[0]; i < n; r = this[++i]) {
                if (r.routeCode === routeCode && r.stationCode === stationCode && r.fromStationCode === fromStationCode) return true;
            }
            return false;
        }
    }]);

    return IgnoringFragments;
}(Array);

exports.default = IgnoringFragments;