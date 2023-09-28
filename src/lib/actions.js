import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore';
import { db } from '~/firebase-config';
/* 
    Firebase Note: addDoc
    - If document not found in db first, then create a new one
    - If document has been already in db, then update
    -> never fire error
*/

// Helpers
const ifBoardExists = async (title) => {
    console.log(title);
    const boards = collection(db, 'boards');
    const q = query(boards, where('title', '==', title));
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0;
};

// Boards
export const createBoard = async (data) => {
    try {
        const res = await ifBoardExists(data.title);
        if (res) {
            return { status: 502, message: `This board has already been created.` };
        } else {
            const boards = collection(db, 'boards');
            await addDoc(boards, data);
            return { status: 200, message: `Successfully created board (${data.title})` };
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
    console.log(userId);
    const q = query(collection(db, 'boards'), where('creatorId', '==', userId));
    const querySnapshot = await getDocs(q);
    const list = querySnapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data(), id: doc.id }], []);
    return list;
};

export const fetchBoard = async (title) => {
    try {
        console.log(title);
        const q = query(collection(db, 'boards'), where('title', '==', title));
        const snapshot = await getDocs(q);
        const doc = snapshot.docs.find((doc) => doc.data().title === title);
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error(error, 'error fetching board');
    }
};

export const deleteBoard = async (boardId) => {
    console.log(boardId);
    try {
        const boardRef = doc(db, 'boards', boardId);
        deleteDoc(boardRef);
        deleteColumnsByBoardId(boardId);
        deleteTasksByBoardId(boardId);
        deleteCommentsByBoardId(boardId);
        return { status: 200, message: 'Board has been deleted successfully.' };
    } catch (error) {
        return { status: 501, error };
    }
};

// Columns
export const deleteColumnsByBoardId = async (boardId) => {
    try {
        const q = query(collection(db, 'columns'), where('reference', '==', boardId));
        const colSnap = await getDocs(q);
        Promise.all(colSnap.docs.map((doc) => deleteDoc(doc.ref)));
    } catch (error) {
        console.error(error.message + ' error deleting columns');
    }
};

export const fetchColumns = async (boardId) => {
    console.log(boardId);
    const q = query(collection(db, 'columns'), where('reference', '==', boardId));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data(), id: doc.id }], []);
    return data;
};

export const saveColumn = async (data) => {
    try {
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
        console.error(error.message + ' error create column');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};

// Tasks
export const deleteTasksByBoardId = async (boardId) => {
    try {
        const q = query(collection(db, 'tasks'), where('boardId', '==', boardId));
        const colSnap = await getDocs(q);
        Promise.all(colSnap.docs.map((doc) => deleteDoc(doc.ref)));
    } catch (error) {
        console.error(error.message + ' error deleting tasks');
    }
};

export const fetchTasks = async (boardId) => {
    try {
        console.log(boardId);

        const q = query(collection(db, 'tasks'), where('boardId', '==', boardId));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data(), id: doc.id }], []);
        return data;
    } catch (error) {
        console.error(error.message, 'error fetching tasks');
    }
};

export const saveTask = async (data) => {
    console.log(data);
    try {
        const taskRef = doc(db, 'tasks', data.id);
        const taskSnap = await getDoc(taskRef);
        if (taskSnap.exists()) {
            await setDoc(taskRef, data);
        }
        return { status: 200, message: 'Saved task...' };
    } catch (error) {
        console.error(error.message + ' error saving task');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};

export const createTask = async (data) => {
    try {
        const taskRef = doc(db, 'tasks', data.id);
        await setDoc(taskRef, data);
    } catch (error) {
        console.error(error.message + ' error creating task');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};

// Comments
export const deleteCommentsByBoardId = async (boardId) => {
    try {
        const q = query(collection(db, 'comments'), where('boardId', '==', boardId));
        const colSnap = await getDocs(q);
        Promise.all(colSnap.docs.map((doc) => deleteDoc(doc.ref)));
    } catch (error) {
        console.error(error.message + ' error deleting comments');
    }
};

export const countCommentsByTaskId = async (taskId) => {
    try {
        console.log(taskId);
        const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'), where('taskId', '==', taskId));
        const querySnapshot = await getDocs(q);
        const size = querySnapshot.size;
        return size;
    } catch (error) {
        console.error(error.message, 'error counting comments');
    }
};

export const deleteComment = async (commentId) => {
    try {
        const commentRef = doc(db, 'comments', commentId);
        await deleteDoc(commentRef);
        return { status: 200, message: 'Comment has been deleted successfully.' };
    } catch (error) {
        return { status: 501, error };
    }
};

export const createComment = async (data) => {
    try {
        const commentRef = collection(db, 'comments');
        await addDoc(commentRef, data);
        return { status: 200, message: `Create comment successfully!` };
    } catch (error) {
        console.error(error.message + ' error creating task');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};

export const saveComment = async (data) => {
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
export const fetchComments = async (userId) => {
    try {
        console.log(userId);
        const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data(), id: doc.id }], []);
        return data;
    } catch (error) {
        console.error(error.message, 'error fetching comment');
    }
};
