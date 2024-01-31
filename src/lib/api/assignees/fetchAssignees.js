import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '~/firebase-config';

const fetchAssignees = async (boardId) => {
    console.log(boardId);
    try {
        const q = query(collection(db, 'assignees'), where('boardId', '==', boardId));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data(), id: doc.id }], []);
        return data;
    } catch (error) {
        console.error(error, 'error fetching assignees');
    }
};

export default fetchAssignees;
