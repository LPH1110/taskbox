import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '~/firebase-config';

const fetchConversations = async ({ email }) => {
    try {
        // fetch
        console.log('fetch conversations: ', email);
        const roomRef = collection(db, 'rooms');
        const q = query(roomRef, where('emails', 'array-contains', email));
        const snapshot = await getDocs(q);
        const result = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return result;
    } catch (error) {
        console.error('failed to fetch conversations: ', error);
    }
};

export default fetchConversations;
