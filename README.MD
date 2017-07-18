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
##### Result example:
```javascript
[
    {
        "totalTimeSeconds": 1091,
        "totalGoingTimeSeconds": 361,
        "totalTransportChangingCount": 1,
        "points": [
            {
                "time": 0,
                "station": null,
                "route": null,
                "coords": { "lat": 53.7082, "lng": 23.8029 }
            },
            {
                "time": 230,
                "station":
                    {
                        "hashcode": "S157A8E43A24",
                        "name": "улица Врублевского",
                        "routes": null,
                        "Coords": { "lat": 53.7092, "lng": 23.8045 }
                    },
                "route": null,
                "coords": { "lat": 53.7092, "lng": 23.8045 }
            },
            {
                "time": 491,
                "station":
                    {
                        "hashcode": "S157A8E088DD",
                        "name": "улица Домбровского",
                        "routes": null,
                        "Coords": { "lat": 53.7065, "lng": 23.7956 }
                    },
                "route": {
                    "vehicles": [],
                    "gpsTrack": null,
                    "hashcode": "R158542FE82C",
                    "number": "28",
                    "type": "bus",
                    "from": "Вишневец",
                    "to": "улица Белые Росы",
                    "owner": "",
                    "stations": null,
                    "timetables": null,
                    "stationsJSON": null
                }, "coords": { "lat": 53.7065, "lng": 23.7956 }
            },
            {
                "time": 629,
                "station":
                    {
                        "hashcode": "S157A8E06B65",
                        "name": "Гимназия № 5",
                        "routes": null,
                        "Coords": { "lat": 53.703, "lng": 23.7967 }
                    },
                "route": {
                    "vehicles": [],
                    "gpsTrack": null,
                    "hashcode": "R158542FE82C",
                    "number": "28", "type": "bus",
                    "from": "Вишневец",
                    "to": "улица Белые Росы",
                    "owner": "",
                    "stations": null,
                    "timetables": null,
                    "stationsJSON": null
                },
                "coords": { "lat": 53.703, "lng": 23.7967 }
            },
            {
                "time": 960,
                "station":
                    {
                        "hashcode": "S157A8E0ABC4",
                        "name": "Форты",
                        "routes": null,
                        "Coords": { "lat": 53.6956, "lng": 23.8007 }
                    },
                "route":
                    {
                        "vehicles": [],
                        "gpsTrack": null,
                        "hashcode": "R158542FE82C",
                        "number": "28",
                        "type": "bus",
                        "from": "Вишневец",
                        "to": "улица Белые Росы",
                        "owner": "",
                        "stations": null,
                        "timetables": null,
                        "stationsJSON": null
                    },
                "coords": { "lat": 53.6956, "lng": 23.8007 }
            },
            {
                "time": 1091,
                "station": null,
                "route": null,
                "coords": { "lat": 53.6968527, "lng": 23.802495 }
            }
        ]
    },
    {
        "totalTimeSeconds": 2708,
        "totalGoingTimeSeconds": 2708,
        "totalTransportChangingCount": 0,
        "points": [
            {
                "time": 0,
                "station": null,
                "route": null,
                "coords": { "lat": 53.7082, "lng": 23.8029 }
            },
            {
                "time": 2708,
                "station": null,
                "route": null,
                "coords": { "lat": 53.6968527, "lng": 23.802495 }
            }
        ]
    }]
```
