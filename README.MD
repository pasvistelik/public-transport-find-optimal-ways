##### Using example:
```javascript
import initialize from 'public-transport-initialize-data';
import OptimalRoutesCollection from 'public-transport-find-optimal-ways/lib/optimalRoutesCollection';

initialize(allStations, allRoutes, allTimetables); // You are need to initialize data before using this module.

var res = new OptimalRoutesCollection(
    allStations, 
    {lat: 53.6834599, lng:23.8342648}, // fromPosition
    {lat: 53.92720535, lng: 27.5255677338375}, // toPosition
    45300, // startTime (in seconds: hours*3600+minutes*60+seconds)
    ["bus", "trolleybus"], // transportTypes
    5, // goingSpeed
    2 // dopTimeMinutes
);

var findedOptimalWays = res.getOptimalWays();
```
