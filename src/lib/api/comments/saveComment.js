import { doc, setDoc } from 'firebase/firestore';
import { db } from '~/firebase-config';

const saveComment = async (data) => {
    console.log(data);
    try {
        const commentRef = doc(db, 'comments', data.id);
        await setDoc(commentRef, data);
        return { status: 200, message: 'Saved comment...' };
    } catch (error) {
        console.error(error.message + ' error saving comment');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};

export default saveComment;
