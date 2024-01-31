import { collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '~/firebase-config';

const deleteAssignees = async (boardId) => {
    try {
        const q = query(collection(db, 'assignees'), where('boardId', '==', boardId));
        const snapshot = await getDocs(q);
        Promise.all(snapshot.docs.map((doc) => deleteDoc(doc.ref)));
    } catch (error) {
        console.error(error, 'error deleting assignee');
    }
};
export default deleteAssignees;
