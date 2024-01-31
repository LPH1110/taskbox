import { collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '~/firebase-config';

const deleteColumnsByBoardId = async (boardId) => {
    try {
        const q = query(collection(db, 'columns'), where('reference', '==', boardId));
        const colSnap = await getDocs(q);
        Promise.all(colSnap.docs.map((doc) => deleteDoc(doc.ref)));
    } catch (error) {
        console.error(error.message + ' error deleting columns');
    }
};

export default deleteColumnsByBoardId;
