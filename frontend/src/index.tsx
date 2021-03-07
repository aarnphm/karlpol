import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker'
import * as firebase from 'firebase'
import 'firebase/firestore'
import reportWebVitals from './reportWebVitals';


const firebaseConfig = {
  apiKey: "AIzaSyAD8Lu6YDSUWmvGoiQNHR8prlowqcDtmTw",
  authDomain: "karlpol-backend.firebaseapp.com",
  projectId: "karlpol-backend",
  storageBucket: "karlpol-backend.appspot.com",
  messagingSenderId: "745924531105",
  appId: "1:745924531105:web:f33d574e4dcaf1031a71e0",
  measurementId: "G-5SEMD4G3KD"
};

firebase.initializeApp(firebaseConfig);
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
serviceWorker.unregister();
