import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '~/firebase-config';

const fetchColumns = async (boardId) => {
    console.log(boardId);
    const q = query(collection(db, 'columns'), where('reference', '==', boardId));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data(), id: doc.id }], []);
    return data;
};

export default fetchColumns;
