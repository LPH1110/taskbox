import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '~/firebase-config';

const ifBoardExists = async (email, title) => {
    console.log(title);
    const boards = collection(db, 'boards');
    const q = query(boards, where('creator', '==', email), where('title', '==', title));
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0;
};

export default ifBoardExists;
