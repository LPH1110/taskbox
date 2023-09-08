import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '~/firebase-config';
/* 
    Firebase Note: addDoc
    - If document not found in db first, then create a new one
    - If document has been already in db, then update
    -> never fire error
*/

export const saveBoard = async (data) => {
    try {
        const boardRef = doc(db, 'boards', data.title);
        let boardSnap = await getDoc(boardRef);
        if (boardSnap.exists()) {
            return { status: 502, message: `Board name has already existed` };
        } else {
            await setDoc(boardRef, data);
            return { status: 200, message: `Create board (${data.title}) successfully` };
        }
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
