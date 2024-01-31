import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '~/firebase-config';

const saveBoard = async (boardId, data) => {
    try {
        const boardRef = doc(db, 'boards', boardId);
        const boardSnap = await getDoc(boardRef);
        if (boardSnap.exists()) {
            await setDoc(boardRef, data);
        }
        return { status: 200, message: `Saved board successfully` };
    } catch (error) {
        console.error(error.message + ' error saving column');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};

export default saveBoard;
