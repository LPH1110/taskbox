import { doc, setDoc } from 'firebase/firestore';
import { db } from '~/firebase-config';

export const saveUser = async (data) => {
    try {
        const userRef = doc(db, 'users', data.email);
        let dataObj = Object.assign({}, data);
        await setDoc(userRef, {
            email: dataObj.email,
            displayName: dataObj.displayName,
            photoURL: dataObj.photoURL,
        });
    } catch (error) {
        console.error(error, 'error saving user');
    }
};

export default saveUser;
