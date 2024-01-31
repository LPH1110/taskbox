import { addDoc, collection } from 'firebase/firestore';
import { db } from '~/firebase-config';

const createComment = async (data) => {
    try {
        const commentRef = collection(db, 'comments');
        await addDoc(commentRef, data);
        return { status: 200, message: `Create comment successfully!` };
    } catch (error) {
        console.error(error.message + ' error creating task');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};

export default createComment;
