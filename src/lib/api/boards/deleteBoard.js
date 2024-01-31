import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '~/firebase-config';
import deleteColumnsByBoardId from './deleteColumnsByBoardId';
import { deleteTasksByBoardId } from '../tasks';
import { deleteCommentsByBoardId } from '../comments';
import { deleteAssignees } from '../assignees';

const deleteBoard = async (boardId) => {
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

export default deleteBoard;
