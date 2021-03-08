import React, { ReactElement, useState, useEffect } from 'react';
import { Map, GoogleApiWrapper, Marker, Polyline } from 'google-maps-react';
import theme from './theme';
import useEventPeople from '../../hooks/UseEventPeople';
import { useParams } from 'react-router-dom';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase';
import { People } from '../../_types/people';
import idToLatLngFunc from './id-to-lat-lng';
import { Event } from '../../_types/event';
import axios from 'axios';
import { Client } from '@googlemaps/google-maps-services-js';

const client = new Client({});

const MapContainer = ({ google, center }: { google: any; center: google.maps.LatLngLiteral }): ReactElement => {
    const { eventId } = useParams();
    const [eventData] = useDocumentData<Event>(firebase.firestore().collection('events').doc(eventId), {
        snapshotListenOptions: {
            includeMetadataChanges: true,
        },
    });
    const [solution, setSolution] = useState(undefined);
    useEffect(() => {
        const data = axios
            .get(`https://us-central1-karlpol-backend.cloudfunctions.net/solve?eventId=${eventId}`)
            .then((res) => {
                setSolution(res.data);
            });
    }, [eventData]);

    const members = useEventPeople(eventData);
    const idToLatLng = idToLatLngFunc(members);
    console.log(idToLatLngFunc, members);
    const answer: any = [];
    for (const driver in solution) {
        const path = [...solution[driver]];
        console.log(path);
        path.unshift(driver);
        const newPath = path.map((id) => idToLatLng[id]);
        answer.push(newPath);
    }
    console.log(answer, solution);
    /**
     * answer [[{lat, lng}, {lat, lng}], [{lat,lng},{lat,lng}]]
     * encodedPath [['String', 'String'],['String', 'String']]
     * newPath [{lat, lng}, {lat, lng} ... ], [{lat, lng}, {lat, lng} ... ]
     */

    const [newPath, setNewPath] = useState([]);

    const generatePath = async () => {
        const newPath2 = await Promise.all(
            answer.map(
                async (route: any): Promise<any> => {
                    const destination = eventData.destination.latlng.lat + ',' + eventData.destination.latlng.lng;
                    const begin = route[0].lat + ',' + route[0].lng;
                    let response;
                    if (route.length >= 2) {
                        let waypoint = '';
                        // , === %2C
                        // | seperate locations
                        for (let i = 1; i < route.length; i++) {
                            if (i == route.length - 1) {
                                waypoint = waypoint + route[i].lat + ',' + route[i].lng;
                            } else {
                                waypoint = waypoint + route[i].lat + ',' + route[i].lng + '|';
                            }
                        }
                        route.shift();

                        console.log(destination, begin, waypoint);

                        response = await axios.post(
                            'https://us-central1-karlpol-backend.cloudfunctions.net/directions',
                            {
                                destination,
                                origin: begin,
                                waypoints: waypoint,
                            },
                            {
                                headers: {
                                    'Access-Token': await firebase.auth().currentUser.getIdToken(),
                                },
                            },
                        );

                        // console.log(response);
                    } else {
                        console.log(begin, destination);
                        response = await axios.post(
                            'https://us-central1-karlpol-backend.cloudfunctions.net/directions',
                            {
                                destination,
                                origin: begin,
                                waypoint: '',
                            },
                            {
                                headers: {
                                    'Access-Token': await firebase.auth().currentUser.getIdToken(),
                                },
                            },
                        );
                        console.log(response);
                    }
                    console.log(response.data.routes[0].overview_polyline.points);
                    if (response.data.routes[0]) {
                        return google.maps.geometry.encoding.decodePath(
                            response.data.routes[0].overview_polyline.points,
                        );
                    }
                },
            ),
        );
        setNewPath(newPath2);
        console.log(newPath2);
    };

    console.log(newPath);

    useEffect(() => {
        if (google.maps.geometry) {
            // generate an encoded response per route
            generatePath();
        }
    }, [solution]);

    const colors: any = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FF00', '#FFFFFF', '#000000'];
    const idx = 0;

    return (
        <Map
            google={google}
            zoom={13}
            styles={theme}
            initialCenter={center}
            containerStyle={{ height: 'calc(100vh - 64px)', width: '100vw' }}
        >
            <Marker position={center}></Marker>
            {members.map((person: People) => {
                return (
                    <Marker
                        key={person?.name}
                        label={!person?.profilePicture && person.name}
                        position={person.location.latlng}
                        icon={{
                            url: person.profilePicture,
                            scaledSize: new google.maps.Size(32, 32),
                        }}
                    />
                );
            })}
            {newPath?.map((path: any) => {
                const randomColor = colors[idx];
                // idx++;
                return <Polyline key="" path={path} strokeColor={randomColor} strokeOpacity={1} strokeWeight={3} />;
            })}
        </Map>
    );
};

export default GoogleApiWrapper((props) => ({
    ...props,
    libraries: ['geometry'],
    apiKey: 'AIzaSyDeYxMI4VWDieaPheczUE8NQkc-HrLqiqI',
}))(MapContainer);
