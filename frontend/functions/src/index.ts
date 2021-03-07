import * as functions from 'firebase-functions';
import { Event } from '../../src/_types/event';
import { People } from '../../src/_types/people';

import { DistanceMatrix } from './DistanceMatrix';
import firebase from 'firebase/app';
import * as admin from 'firebase-admin';
import PriorityQueue from 'priorityqueue';
import 'firebase/firestore';
import axios from 'axios';

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

firebase.initializeApp(firebaseConfig);
admin.initializeApp(firebaseConfig);

export const directions = functions.https.onRequest(async (request: any, response: any) => {
    cors(request, response, async () => {
        response.set('Access-Control-Allow-Origin', '*');
        const key = functions.config().directions.keys;
        if (request.method !== 'POST') {
            response.status(405).json({ message: 'Method Not Allowed.' });
            return;
        } else if (!request.get('Access-Token')) {
            response.status(401).json({ meassage: 'Unauthorized.' });
            return;
        } else if (!key) {
            response.status(403).json({ meassage: 'Service Unavailable' });
            return;
        } else {
            try {
                const verify = await admin.auth().verifyIdToken(request.get('Access-Token'));
                if (!verify.uid) {
                    response.status(403).json({ message: 'Service Unavailable' });
                    return;
                } else {
                    console.log(request.body);
                    const axiosRes = await axios({
                        method: 'GET',
                        url: `https://maps.googleapis.com/maps/api/directions/json?destination=${
                            request.body.destination
                        }&key=${request.body.origin}${
                            request.body.waypoints && `&waypoints=${request.body.waypoints}`
                        }`,
                    });
                    response.json(axiosRes.data);
                    return;
                }
            } catch (err) {
                response.status(401).json({ message: err.message });
                return;
            }
        }
    });
});

export const solve = functions.https.onRequest(async (request: any, response: any) => {
    response.set('Access-Control-Allow-Origin', '*');
    functions.logger.info('Logger Pog', { structuredData: true });

    const result = await firebase.firestore().collection('events').doc(request.query.eventId).get();

    // will get events before hand
    const event = result.data();

    if (!event) {
        response.json('error couldnt find event');
        return;
    }

    const people = await Promise.all(
        event.people.map(async (person: firebase.firestore.DocumentReference) => {
            const personRef = await person.get();
            return {
                id: person.id,
                ...personRef.data(),
            };
        }),
    );

    event.people = people;
    response.json(await solveCarpoolProblem(event as Event));
});

async function solveCarpoolProblem(event: Event): Promise<Map<string, Array<string>>> {
    const people = event.people;
    let remainDrivers = getDrivers(people as People[]);
    let remainPassengers = getPassengers(people as People[]);
    const distanceMatrix: DistanceMatrix = new DistanceMatrix(people as People[]);
    await distanceMatrix.init();

    const sol = new Map<string, Array<string>>();

    while (!isDone(remainDrivers, remainPassengers)) {
        if (remainPassengers.length > 0 && remainDrivers.length === 0) break;

        if (remainPassengers.length > 0) {
            const closestDriverToPassengers = new Map<string, [string, number]>();
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

            const numericCompare = (a: number, b: number) => (a < b ? 1 : a > b ? -1 : 0);

            const comparator = (a: any, b: any) => {
                return numericCompare(a.minDriverDistance, b.minDriverDistance);
            };

            const pq = new PriorityQueue({ comparator });
            for (const passenger of remainPassengers) {
                const arr = closestDriverToPassengers.get(passenger.id);
                if (!arr) continue;
                const [minDriverId, minDriverDistance] = arr;
                const node = {
                    passengerId: passenger.id,
                    minDriverId,
                    minDriverDistance,
                };

                pq.enqueue(node);
            }

            const nextPassengerNode: any = pq.dequeue();
            if (!nextPassengerNode) continue;
            const nextPassenger = getPersonById(people as People[], nextPassengerNode.passengerId);
            const minDriver = getPersonById(people as People[], nextPassengerNode.minDriverId);

            if (!nextPassenger || !minDriver) continue;
            minDriver.location.latlng = {
                lat: nextPassenger?.location.latlng.lat,
                lng: nextPassenger?.location.latlng.lng,
            };

            const passengerIds: string[] = sol.get(minDriver.id) || [];
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
            if (!sol.has(remainDrivers[0].id)) sol.set(remainDrivers[0].id, []);
            remainDrivers = removePerson(remainDrivers, remainDrivers[0].id);
        }

        if (remainPassengers.length === 0) {
            const driverToBeConverted = getSomeoneDrivingNoOne(remainDrivers, sol);
            if (driverToBeConverted) {
                remainPassengers.push(driverToBeConverted);
                removePerson(remainDrivers, driverToBeConverted.id);
            } else {
                break;
            }
        }
    }
    return strMapToObj(sol);
}

function strMapToObj(strMap: any): any {
    const obj = Object.create(null);
    for (const [k, v] of strMap) {
        // We don’t escape the key '__proto__'
        // which can cause problems on older engines
        obj[k] = v;
    }
    return obj;
}

function getSomeoneDrivingNoOne(drivers: People[], solution: Map<string, Array<string>>): People | undefined {
    for (const driver of drivers) {
        if (!solution.has(driver.id)) {
            return driver;
        }
    }
    return undefined;
}

function removePerson(people: People[], id: string): People[] {
    for (let i = 0; i < people.length; i++) {
        const driver = people[i];
        if (driver.id === id) {
            people.splice(i, 1);
        }
    }
    return people;
}

function getPersonById(people: People[], id: string): People | undefined {
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
function isDone(drivers: People[], passengers: People[]): boolean {
    return drivers.length === 0 && passengers.length === 0;
}

/**
 * Return all drivers from a list of people
 *
 * @param  {People[]} people
 * @returns People[]
 */
function getDrivers(people: People[]): People[] {
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
function getPassengers(people: People[]): People[] {
    return people.filter((person) => {
        return !person.canDrive;
    });
}
