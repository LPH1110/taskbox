import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '~/firebase-config';

const fetchTasks = async (boardId) => {
    try {
        console.log(boardId);

        const q = query(collection(db, 'tasks'), where('boardId', '==', boardId));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data(), id: doc.id }], []);
        return data;
    } catch (error) {
        console.error(error.message, 'error fetching tasks');
    }
};

export default fetchTasks;
