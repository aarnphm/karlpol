import { People } from '../../src/_types/people';
import axios from 'axios';

export interface Location {
    latitude: number;
    longtitude: number;
}

export class DistanceMatrix {
    people: People[];

    data: CustomMap<CustomMap<number>> = new CustomMap(); //number here is distance

    constructor(people: People[]) {
        this.people = people;
    }

    async init() {
        const apiData = await this.grabMatrixDataFromRadar(this.people);
        const origins = apiData.origins;
        const destinations = apiData.destinations;
        const matrix = apiData.matrix;

        for (let i = 0; i < origins.length; i++) {
            const distances: CustomMap<number> = new CustomMap();

            const startLoc: Location = {
                latitude: this.people[i].location.latlng.lat,
                longtitude: this.people[i].location.latlng.lng,
            };

            for (let j = 0; j < destinations.length; j++) {
                const endLoc: Location = {
                    latitude: this.people[j].location.latlng.lat,
                    longtitude: this.people[j].location.latlng.lng,
                };
                distances.set(endLoc, matrix[i][j].distances.value);
            }
            this.data.set(startLoc, distances);
        }
    }

    async grabMatrixDataFromRadar(people: People[]): Promise<any> {
        const locations: string[] = people.map((person) => {
            return `${person.location.latlng.lat},${person.location.latlng.lng}`;
        });
        const res = await axios.get('https://api.radar.io/v1/route/matrix', {
            headers: {
                Authorization: `prj_live_pk_5b485a9ad0fbe62daec3954c50f3b08525130b92`,
            },
            params: {
                origins: locations.join('|'),
                destinations: locations.join('|'),
                mode: 'car',
                units: 'metrics',
            },
        });

        return res.data;
    }
}

export class CustomMap<B> {
    keys: Array<Location> = [];
    values: Array<B> = [];

    set(key: Location, value: B) {
        const idx = this.findIndex(key);
        if (idx === -1) {
            this.keys.push(key);
            this.values.push(value);
        } else {
            this.values[idx] = value;
        }
    }

    get(key: Location) {
        return this.values[this.findIndex(key)];
    }

    findIndex(key: Location): number {
        for (let i = 0; i < this.keys.length; i++) {
            const item = this.keys[i];
            if (item.latitude === key.latitude && item.longtitude === key.longtitude) {
                return i;
            }
        }
        return -1;
    }
}
