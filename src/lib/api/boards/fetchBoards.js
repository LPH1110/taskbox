import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '~/firebase-config';

const fetchBoards = async (email) => {
    console.log(email);
    const q = query(collection(db, 'boards'), where('creator', '==', email));
    const querySnapshot = await getDocs(q);
    const list = querySnapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data(), id: doc.id }], []);
    return list;
};

export default fetchBoards;
