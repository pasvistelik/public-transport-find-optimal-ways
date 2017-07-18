"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IgnoringFragments = function (_Array) {
    (0, _inherits3.default)(IgnoringFragments, _Array);

    function IgnoringFragments() {
        (0, _classCallCheck3.default)(this, IgnoringFragments);

        var _this = (0, _possibleConstructorReturn3.default)(this, (IgnoringFragments.__proto__ || Object.getPrototypeOf(IgnoringFragments)).call(this));

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

    (0, _createClass3.default)(IgnoringFragments, [{
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