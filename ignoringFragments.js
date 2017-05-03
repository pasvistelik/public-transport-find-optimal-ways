class IgnoringFragments extends Array {
    constructor() {
        super();
        this.abc = 1;
        if (arguments[0] != null && arguments[0].length !== 0) {
            try {
                for (var i = 0, n = arguments[0].length, item = arguments[0][0]; i < n; item = arguments[0][++i])
                    this.push(item);
            }
            catch (ex) {
                console.log(ex.message);
            }
        }
    }
    contains(stationCode, routeCode, fromStationCode) {
        for (var i = 0, n = this.length, r = this[0]; i < n; r = this[++i]) {
            if (r.routeCode === routeCode && r.stationCode === stationCode && r.fromStationCode === fromStationCode) return true;
        }
        return false;
    }
}

export default IgnoringFragments;