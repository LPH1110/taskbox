import { collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '~/firebase-config';

const leavingBoard = async ({ email, boardId }) => {
    console.info(`Leaving the board: [user: ${email}, board: ${boardId}]`);
    try {
        const q = query(collection(db, 'assignees'), where('boardId', '==', boardId), where('user.email', '==', email));
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(async (doc) => {
            if (doc.exists()) {
                await deleteDoc(doc.ref);
            }
        });
    } catch (error) {
        console.error(error, 'error leaving board');
    }
};

export default leavingBoard;
