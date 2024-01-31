import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '~/firebase-config';

const saveTask = async (data) => {
    console.log(data);
    try {
        const taskRef = doc(db, 'tasks', data.id);
        const taskSnap = await getDoc(taskRef);
        if (taskSnap.exists()) {
            await setDoc(taskRef, data);
        }
        return { status: 200, message: 'Saved task...' };
    } catch (error) {
        console.error(error.message + ' error saving task');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};

export default saveTask;
