import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '~/firebase-config';
/* 
    Firebase Note: addDoc
    - If document not found in db first, then create a new one
    - If document has been already in db, then update
    -> never fire error
*/

// Boards
export const createBoard = async (data) => {
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

export const saveBoard = async (boardId, data) => {
    try {
        const boardRef = doc(db, 'boards', boardId);
        const boardSnap = await getDoc(boardRef);
        if (boardSnap.exists()) {
            await setDoc(boardRef, data);
        }
        return { status: 200, message: `Saved board successfully` };
    } catch (error) {
        console.error(error.message + ' error saving column');
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

// Columns
export const fetchColumns = async (boardId) => {
    const q = query(collection(db, 'columns'), where('reference', '==', boardId));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data(), id: doc.id }], []);
    return data;
};

export const saveColumn = async (data) => {
    try {
        console.log('Save column fired', data);
        const columnRef = doc(db, 'columns', data.id);
        const columnSnap = await getDoc(columnRef);
        if (columnSnap.exists()) {
            await setDoc(columnRef, data);
        }
        return;
    } catch (error) {
        console.error(error.message + ' error saving column');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};

export const createColumn = async (data) => {
    try {
        const columnRef = doc(db, 'columns', data.id);
        await setDoc(columnRef, data);
    } catch (error) {
        console.error(error.message + ' error saving board');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};

// Tasks
export const fetchTasks = async (boardId) => {
    const q = query(collection(db, 'tasks'), where('boardId', '==', boardId));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data(), id: doc.id }], []);
    return data;
};

export const saveTask = async (data) => {
    try {
        const taskRef = doc(db, 'tasks', data.id);
        const taskSnap = await getDoc(taskRef);
        if (taskSnap.exists()) {
            await setDoc(taskRef, data);
        }
        return;
    } catch (error) {
        console.error(error.message + ' error saving task');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};
