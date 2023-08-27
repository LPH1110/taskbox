import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from '@firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: `${process.env.REACT_APP_FIREBASE_API_KEY}`,
    authDomain: 'taskbox-c75f7.firebaseapp.com',
    projectId: 'taskbox-c75f7',
    storageBucket: 'taskbox-c75f7.appspot.com',
    messagingSenderId: '823322952420',
    appId: '1:823322952420:web:76473e549d52be374222f1',
    measurementId: 'G-XD9ZC3R081',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);
export const storage = getStorage(app);
