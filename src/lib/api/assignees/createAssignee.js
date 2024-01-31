import { addDoc, collection } from 'firebase/firestore';
import { db } from '~/firebase-config';
import ifAssigneeExists from './ifAssigneeExists';

const createAssignee = async (data) => {
    try {
        if (!ifAssigneeExists(data)) {
            const assigneeRef = collection(db, 'assignees');
            await addDoc(assigneeRef, data);
            return { status: 200 };
        } else {
            return { error: 'The user has been shared!' };
        }
    } catch (error) {
        console.error(error, 'error creating assignee');
    }
};

export default createAssignee;
