import { doc, updateDoc } from 'firebase/firestore';
import { db } from '~/firebase-config';

const updateActiveStatus = async ({ email, online }) => {
    console.log(email);
    try {
        const userRef = doc(db, 'users', email);
        await updateDoc(userRef, { is_online: online });
    } catch (error) {
        console.error('Failed to update user status: ', error);
    }
};

export default updateActiveStatus;
