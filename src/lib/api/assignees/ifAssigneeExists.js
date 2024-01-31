import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '~/firebase-config';

const ifAssigneeExists = async (data) => {
    try {
        const q = query(
            collection(db, 'assignees'),
            where('user.email', '==', data.user.email),
            where('boardId', '==', data.boardId),
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.length > 0;
    } catch (error) {
        console.error(error);
    }
};

export default ifAssigneeExists;
