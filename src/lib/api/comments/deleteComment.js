import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '~/firebase-config';

const deleteComment = async (commentId) => {
    try {
        const commentRef = doc(db, 'comments', commentId);
        await deleteDoc(commentRef);
        return { status: 200, message: 'Comment has been deleted successfully.' };
    } catch (error) {
        return { status: 501, error };
    }
};

export default deleteComment;
