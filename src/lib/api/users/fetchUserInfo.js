import { doc, getDoc } from 'firebase/firestore';
import { db } from '~/firebase-config';

const fetchUserInfo = async (email) => {
    try {
        const userRef = doc(db, 'users', email);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            return { error: "User doesn't exist" };
        }
    } catch (error) {
        console.error(error, 'error fetching user info');
    }
};

export default fetchUserInfo;
