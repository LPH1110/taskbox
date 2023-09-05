import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db } from '~/firebase-config';

export const saveBoard = async (data) => {
    try {
        let boardRef = collection(db, 'boards');
        await addDoc(boardRef, data);
        return { status: 200, message: `Created board ${data.title} successfully` };
    } catch (error) {
        console.error(error.message + ' error saving board');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};

export const fetchBoards = async (userId) => {
    const q = query(collection(db, 'boards'), where('creatorId', '==', userId));
    const querySnapshot = await getDocs(q);
    const list = querySnapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data(), id: doc.id }], []);
    console.log('Fetchboards: ', list);
    return list;
};

export const fetchBoard = async (boardId) => {
    const boardRef = doc(db, 'boards', boardId);
    const docSnap = await getDoc(boardRef);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.error('Nothing found!');
    }
};
