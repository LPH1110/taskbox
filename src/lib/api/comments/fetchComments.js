import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '~/firebase-config';

const fetchComments = async (boardId) => {
    try {
        console.log(boardId);
        const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'), where('boardId', '==', boardId));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data(), id: doc.id }], []);
        return data;
    } catch (error) {
        console.error(error.message, 'error fetching comment');
    }
};

export default fetchComments;
