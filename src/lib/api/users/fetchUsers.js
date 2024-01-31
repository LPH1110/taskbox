import { collection, getDocs } from 'firebase/firestore';
import { db } from '~/firebase-config';

const fetchUsers = async () => {
    try {
        const userRef = collection(db, 'users');
        const snapshot = await getDocs(userRef);
        const data = snapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data() }], []);
        console.log(data);
    } catch (error) {
        console.error(error, 'error saving user');
    }
};

export default fetchUsers;
