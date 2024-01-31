import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '~/firebase-config';

const countCommentsByTaskId = async (taskId) => {
    try {
        console.log(taskId);
        const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'), where('taskId', '==', taskId));
        const querySnapshot = await getDocs(q);
        const size = querySnapshot.size;
        return size;
    } catch (error) {
        console.error(error.message, 'error counting comments');
    }
};

export default countCommentsByTaskId;
