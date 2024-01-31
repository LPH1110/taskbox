import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '~/firebase-config';

const fetchBoard = async (title) => {
    try {
        console.log(title);
        const q = query(collection(db, 'boards'), where('title', '==', title));
        const snapshot = await getDocs(q);
        const doc = snapshot.docs.find((doc) => doc.data().title === title);
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error(error, 'error fetching board');
    }
};

export default fetchBoard;
