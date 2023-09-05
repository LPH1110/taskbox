import { initializeApp } from 'firebase/app';
import { getFirestore } from '@firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: `${process.env.REACT_APP_FIREBASE_API_KEY}`,
    authDomain: 'taskbox-53b0d.firebaseapp.com',
    projectId: 'taskbox-53b0d',
    storageBucket: 'taskbox-53b0d.appspot.com',
    messagingSenderId: '864430832721',
    appId: '1:864430832721:web:a5f882eab32a2567190c70',
    measurementId: 'G-7WEBKERDJX',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// npm install -g firebase-tools
