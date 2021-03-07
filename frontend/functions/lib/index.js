"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.solve = exports.directions = void 0;
const functions = __importStar(require("firebase-functions"));
const DistanceMatrix_1 = require("./DistanceMatrix");
const app_1 = __importDefault(require("firebase/app"));
const admin = __importStar(require("firebase-admin"));
const priorityqueue_1 = __importDefault(require("priorityqueue"));
require("firebase/firestore");
const axios_1 = __importDefault(require("axios"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors')();
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyAD8Lu6YDSUWmvGoiQNHR8prlowqcDtmTw',
    authDomain: 'karlpol-backend.firebaseapp.com',
    projectId: 'karlpol-backend',
    storageBucket: 'karlpol-backend.appspot.com',
    messagingSenderId: '745924531105',
    appId: '1:745924531105:web:f33d574e4dcaf1031a71e0',
    measurementId: 'G-5SEMD4G3KD',
};
app_1.default.initializeApp(firebaseConfig);
admin.initializeApp(firebaseConfig);
exports.directions = functions.https.onRequest(async (request, response) => {
    cors(request, response, async () => {
        response.set('Access-Control-Allow-Origin', '*');
        const key = functions.config().directions.keys;
        if (request.method !== 'POST') {
            response.status(405).json({ message: 'Method Not Allowed.' });
            return;
        }
        else if (!request.get('Access-Token')) {
            response.status(401).json({ meassage: 'Unauthorized.' });
            return;
        }
        else if (!key) {
            response.status(403).json({ meassage: 'Service Unavailable' });
            return;
        }
        else {
            try {
                const verify = await admin.auth().verifyIdToken(request.get('Access-Token'));
                if (!verify.uid) {
                    response.status(403).json({ message: 'Service Unavailable' });
                    return;
                }
                else {
                    console.log(request.body);
                    const axiosRes = await axios_1.default({
                        method: 'GET',
                        url: `https://maps.googleapis.com/maps/api/directions/json?destination=${request.body.destination}&key=${request.body.origin}${request.body.waypoints && `&waypoints=${request.body.waypoints}`}`,
                    });
                    response.json(axiosRes.data);
                    return;
                }
            }
            catch (err) {
                response.status(401).json({ message: err.message });
                return;
            }
        }
    });
});
exports.solve = functions.https.onRequest(async (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    functions.logger.info('Logger Pog', { structuredData: true });
    const result = await app_1.default.firestore().collection('events').doc(request.query.eventId).get();
    // will get events before hand
    const event = result.data();
    if (!event) {
        response.json('error couldnt find event');
        return;
    }
    const people = await Promise.all(event.people.map(async (person) => {
        const personRef = await person.get();
        return {
            id: person.id,
            ...personRef.data(),
        };
    }));
    event.people = people;
    response.json(await solveCarpoolProblem(event));
});
async function solveCarpoolProblem(event) {
    const people = event.people;
    let remainDrivers = getDrivers(people);
    let remainPassengers = getPassengers(people);
    const distanceMatrix = new DistanceMatrix_1.DistanceMatrix(people);
    await distanceMatrix.init();
    const sol = new Map();
    while (!isDone(remainDrivers, remainPassengers)) {
        if (remainPassengers.length > 0 && remainDrivers.length === 0)
            break;
        if (remainPassengers.length > 0) {
            const closestDriverToPassengers = new Map();
            for (const passenger of remainPassengers) {
                let minDriverDistance = Infinity;
                let minDriverId = '';
                for (const driver of remainDrivers) {
                    // calc distance between driver and passenger
                    console.log('this shit ran');
                    console.log(distanceMatrix.data.keys, distanceMatrix.data.values);
                    console.log('this is the key were trying to get', {
                        latitude: driver.location.latlng.lat,
                        longitude: driver.location.latlng.lng,
                    });
                    const distanceMap = distanceMatrix.data.get({
                        latitude: driver.location.latlng.lat,
                        longtitude: driver.location.latlng.lng,
                    });
                    const distance = distanceMap.get({
                        latitude: passenger.location.latlng.lat,
                        longtitude: passenger.location.latlng.lng,
                    });
                    console.log(distance, ' from ', passenger.name, driver.name);
                    if (distance < minDriverDistance) {
                        minDriverDistance = distance;
                        minDriverId = driver.id;
                    }
                }
                closestDriverToPassengers.set(passenger.id, [minDriverId, minDriverDistance]);
            }
            const numericCompare = (a, b) => (a < b ? 1 : a > b ? -1 : 0);
            const comparator = (a, b) => {
                return numericCompare(a.minDriverDistance, b.minDriverDistance);
            };
            const pq = new priorityqueue_1.default({ comparator });
            for (const passenger of remainPassengers) {
                const arr = closestDriverToPassengers.get(passenger.id);
                if (!arr)
                    continue;
                const [minDriverId, minDriverDistance] = arr;
                const node = {
                    passengerId: passenger.id,
                    minDriverId,
                    minDriverDistance,
                };
                pq.enqueue(node);
            }
            const nextPassengerNode = pq.dequeue();
            if (!nextPassengerNode)
                continue;
            const nextPassenger = getPersonById(people, nextPassengerNode.passengerId);
            const minDriver = getPersonById(people, nextPassengerNode.minDriverId);
            if (!nextPassenger || !minDriver)
                continue;
            minDriver.location.latlng = {
                lat: nextPassenger === null || nextPassenger === void 0 ? void 0 : nextPassenger.location.latlng.lat,
                lng: nextPassenger === null || nextPassenger === void 0 ? void 0 : nextPassenger.location.latlng.lng,
            };
            const passengerIds = sol.get(minDriver.id) || [];
            passengerIds.push(nextPassenger.id);
            sol.set(minDriver.id, passengerIds);
            minDriver.seats--;
            if (minDriver.seats === 0) {
                remainDrivers = removePerson(remainDrivers, minDriver.id);
            }
            remainPassengers = removePerson(remainPassengers, nextPassenger.id);
            // connect with backend GraphQL
        }
        if (remainDrivers.length === 1 && remainPassengers.length === 0) {
            if (!sol.has(remainDrivers[0].id))
                sol.set(remainDrivers[0].id, []);
            remainDrivers = removePerson(remainDrivers, remainDrivers[0].id);
        }
        if (remainPassengers.length === 0) {
            const driverToBeConverted = getSomeoneDrivingNoOne(remainDrivers, sol);
            if (driverToBeConverted) {
                remainPassengers.push(driverToBeConverted);
                removePerson(remainDrivers, driverToBeConverted.id);
            }
            else {
                break;
            }
        }
    }
    return strMapToObj(sol);
}
function strMapToObj(strMap) {
    const obj = Object.create(null);
    for (const [k, v] of strMap) {
        // We don’t escape the key '__proto__'
        // which can cause problems on older engines
        obj[k] = v;
    }
    return obj;
}
function getSomeoneDrivingNoOne(drivers, solution) {
    for (const driver of drivers) {
        if (!solution.has(driver.id)) {
            return driver;
        }
    }
    return undefined;
}
function removePerson(people, id) {
    for (let i = 0; i < people.length; i++) {
        const driver = people[i];
        if (driver.id === id) {
            people.splice(i, 1);
        }
    }
    return people;
}
function getPersonById(people, id) {
    for (const person of people) {
        if (person.id === id) {
            return person;
        }
    }
    return undefined;
}
/**
 * returns whether the solution contains all the people in an event
 *
 * @param  {People} people
 * @param  { Map<string, Array<string>>} solution
 * @returns boolean
 */
function isDone(drivers, passengers) {
    return drivers.length === 0 && passengers.length === 0;
}
/**
 * Return all drivers from a list of people
 *
 * @param  {People[]} people
 * @returns People[]
 */
function getDrivers(people) {
    return people.filter((person) => {
        return person.canDrive;
    });
}
/**
 * Return all passengers from a list of people
 *
 * @param  {People[]} people
 * @returns People[]
 */
function getPassengers(people) {
    return people.filter((person) => {
        return !person.canDrive;
    });
}
//# sourceMappingURL=index.js.map