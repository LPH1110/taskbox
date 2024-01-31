import { addDoc, collection, getDoc } from 'firebase/firestore';
import ifBoardExists from './ifBoardExists';
import { db } from '~/firebase-config';
import createAssignee from '../assignees/createAssignee';

const createBoard = async (data, user) => {
    console.log(data);
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
            return {
                status: 200,
                message: `Successfully created board (${data.title})`,
                data: { id: doc.id, ...doc.data() },
            };
        }
    } catch (error) {
        console.error(error.message + ' error saving board');
        return { status: 501, message: `Something went wrong. Please try again` };
    }
};

export default createBoard;
