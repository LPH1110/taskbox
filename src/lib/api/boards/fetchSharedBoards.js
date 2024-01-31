import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '~/firebase-config';

const fetchSharedBoards = async (email) => {
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

export default fetchSharedBoards;
