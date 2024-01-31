import { doc, setDoc } from 'firebase/firestore';
import { db } from '~/firebase-config';

const createColumn = async (data) => {
    try {
        const columnRef = doc(db, 'columns', data.id);
        await setDoc(columnRef, data);
    } catch (error) {
        console.error(error.message + ' error create column');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};

export default createColumn;
