import { doc, setDoc } from 'firebase/firestore';
import { db } from '~/firebase-config';

const createTask = async (data) => {
    try {
        const taskRef = doc(db, 'tasks', data.id);
        await setDoc(taskRef, data);
    } catch (error) {
        console.error(error.message + ' error creating task');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};

export default createTask;
