import { addDoc, collection } from 'firebase/firestore';
import { useContext } from 'react';
import { db } from '~/firebase-config';

const { createContext } = require('react');

const ActivityContext = createContext();

export const ActivityContextProvider = ({ children }) => {
    const activityRef = collection(db, 'activities');

    const saveAction = async (data) => {
        try {
            await addDoc(activityRef, data);
        } catch (e) {
            console.error(e.message + 'error saving activity');
        }
    };
    return <ActivityContext.Provider value={{ activityRef, saveAction }}>{children}</ActivityContext.Provider>;
};

export const ActivityAuth = () => {
    return useContext(ActivityContext);
};
