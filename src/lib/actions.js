import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore';
import { db } from '~/firebase-config';
/* 
    Firebase Note: addDoc
    - If document not found in db first, then create a new one
    - If document has been already in db, then update
    -> never fire error
*/

// Helpers
const ifBoardExists = async (email, title) => {
    console.log(title);
    const boards = collection(db, 'boards');
    const q = query(boards, where('creator', '==', email), where('title', '==', title));
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0;
};

// Users
export const fetchUserInfo = async (email) => {
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
export const fetchUsers = async () => {
    try {
        const userRef = collection(db, 'users');
        const snapshot = await getDocs(userRef);
        const data = snapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data() }], []);
        console.log(data);
    } catch (error) {
        console.error(error, 'error saving user');
    }
};

// Boards
export const createBoard = async (data, user) => {
    try {
        const res = await ifBoardExists(data.creator, data.title);
        if (res) {
            return { status: 502, message: `This board has already been created.` };
        } else {
            const boards = collection(db, 'boards');
            const result = await addDoc(boards, data);
            const doc = await getDoc(result);
            await createAssignee({
                user: {
                    email: user.email,
                    photoURL: user.photoURL,
                    displayName: user.displayName,
                },
                boardId: doc.id,
                role: 'admin',
            });
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

export const fetchBoards = async (email) => {
    console.log(email);
    const q = query(collection(db, 'boards'), where('creator', '==', email));
    const querySnapshot = await getDocs(q);
    const list = querySnapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data(), id: doc.id }], []);
    return list;
};

export const fetchSharedBoards = async (email) => {
    console.info('Fetch shared boards: ', email);
    try {
        const assigneesRef = collection(db, 'assignees');
        const q = query(assigneesRef, where('user.email', '==', email));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.reduce(async (acc, document) => {
            let { boardId } = document.data();
            let boardRef = doc(db, 'boards', boardId);
            let boardData = await getDoc(boardRef);
            let newDoc = {
                id: boardData.id,
                ...boardData.data(),
            };
            return [...acc, newDoc];
        }, []);

        return list;
    } catch (error) {
        console.error(error, 'error fetching shared boards');
    }
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
        deleteAssignees(boardId);
        return { status: 200, message: 'Board has been deleted successfully.' };
    } catch (error) {
        return { status: 501, error };
    }
};

export const leavingBoard = async ({ email, boardId }) => {
    console.info(`Leaving the board: [user: ${email}, board: ${boardId}]`);
    try {
        const q = query(collection(db, 'assignees'), where('boardId', '==', boardId), where('user.email', '==', email));
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(async (doc) => {
            if (doc.exists()) {
                await deleteDoc(doc.ref);
            }
        });
    } catch (error) {
        console.error(error, 'error leaving board');
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
export const fetchComments = async (boardId) => {
    try {
        console.log(boardId);
        const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'), where('boardId', '==', boardId));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data(), id: doc.id }], []);
        return data;
    } catch (error) {
        console.error(error.message, 'error fetching comment');
    }
};

// Assignees
export const ifAssigneeExists = async (data) => {
    try {
        const q = query(
            collection(db, 'assignees'),
            where('user.email', '==', data.user.email),
            where('boardId', '==', data.boardId),
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.length > 0;
    } catch (error) {
        console.error(error);
    }
};
export const fetchAssignees = async (boardId) => {
    console.log(boardId);
    try {
        const q = query(collection(db, 'assignees'), where('boardId', '==', boardId));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.reduce((acc, doc) => [...acc, { ...doc.data(), id: doc.id }], []);
        return data;
    } catch (error) {
        console.error(error, 'error fetching assignees');
    }
};
export const createAssignee = async (data) => {
    try {
        if (!ifAssigneeExists(data)) {
            const assigneeRef = collection(db, 'assignees');
            await addDoc(assigneeRef, data);
            return { status: 200 };
        } else {
            return { error: 'The user has been shared!' };
        }
    } catch (error) {
        console.error(error, 'error creating assignee');
    }
};
export const updateAssignee = async () => {};

export const deleteAssignees = async (boardId) => {
    try {
        const q = query(collection(db, 'assignees'), where('boardId', '==', boardId));
        const snapshot = await getDocs(q);
        Promise.all(snapshot.docs.map((doc) => deleteDoc(doc.ref)));
    } catch (error) {
        console.error(error, 'error deleting assignee');
    }
};
