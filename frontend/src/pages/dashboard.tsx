import React, { useState } from 'react';
import * as firebase from 'firebase';
import { Event } from '../_types/event';
import { useParams, useHistory } from 'react-router-dom';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import Map from '../components/Map';
import ListView from '../components/PeopleList';
import useEventPeople from '../hooks/UseEventPeople';
import Header from '../components/Header';
import { Hidden, Drawer } from '@material-ui/core';

//eslint-disable-next-line
const globalAny: any = global;

const Dashboard = () => {
    const { eventId } = useParams();
    const history = useHistory();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [event, loading] = useDocumentData<Event>(firebase.firestore().collection('events').doc(eventId), {
        snapshotListenOptions: {
            includeMetadataChanges: true,
        },
    });

    const people = useEventPeople(event);

    if (!loading && !event) {
        globalAny.setNotification('error', 'Event not found.');
        history.push('/');
    }

    return (
        <>
            <Header setSidebarOpen={setSidebarOpen} />
            <div style={{ display: 'flex' }}>
                <Drawer
                    variant="persistent"
                    anchor="left"
                    open={sidebarOpen}
                    onClose={() => {
                        setSidebarOpen(false);
                    }}
                >
                    <ListView setSidebarOpen={setSidebarOpen} members={people} />
                </Drawer>
                {/* <Hidden mdDown></Hidden> */}
                <Map center={event ? event.destination.latlng : { lat: 0, lng: 0 }} />
            </div>
        </>
    );
};

export default Dashboard;
