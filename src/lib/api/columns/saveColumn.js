import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '~/firebase-config';

const saveColumn = async (data) => {
    try {
        const columnRef = doc(db, 'columns', data.id);
        const columnSnap = await getDoc(columnRef);
        if (columnSnap.exists()) {
            await setDoc(columnRef, data);
        }
        return;
    } catch (error) {
        console.error(error.message + ' error saving column');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};

export default saveColumn;
