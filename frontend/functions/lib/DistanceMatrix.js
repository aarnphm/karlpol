"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomMap = exports.DistanceMatrix = void 0;
const axios_1 = __importDefault(require("axios"));
class DistanceMatrix {
    constructor(people) {
        this.data = new CustomMap(); //number here is distance
        this.people = people;
    }
    async init() {
        const apiData = await this.grabMatrixDataFromRadar(this.people);
        const origins = apiData.origins;
        const destinations = apiData.destinations;
        const matrix = apiData.matrix;
        for (let i = 0; i < origins.length; i++) {
            const distances = new CustomMap();
            const startLoc = {
                latitude: this.people[i].location.latlng.lat,
                longtitude: this.people[i].location.latlng.lng,
            };
            for (let j = 0; j < destinations.length; j++) {
                const endLoc = {
                    latitude: this.people[j].location.latlng.lat,
                    longtitude: this.people[j].location.latlng.lng,
                };
                distances.set(endLoc, matrix[i][j].distances.value);
            }
            this.data.set(startLoc, distances);
        }
    }
    async grabMatrixDataFromRadar(people) {
        const locations = people.map((person) => {
            return `${person.location.latlng.lat},${person.location.latlng.lng}`;
        });
        const res = await axios_1.default.get('https://api.radar.io/v1/route/matrix', {
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
exports.DistanceMatrix = DistanceMatrix;
class CustomMap {
    constructor() {
        this.keys = [];
        this.values = [];
    }
    set(key, value) {
        const idx = this.findIndex(key);
        if (idx === -1) {
            this.keys.push(key);
            this.values.push(value);
        }
        else {
            this.values[idx] = value;
        }
    }
    get(key) {
        return this.values[this.findIndex(key)];
    }
    findIndex(key) {
        for (let i = 0; i < this.keys.length; i++) {
            const item = this.keys[i];
            if (item.latitude === key.latitude && item.longtitude === key.longtitude) {
                return i;
            }
        }
        return -1;
    }
}
exports.CustomMap = CustomMap;
//# sourceMappingURL=DistanceMatrix.js.map