import { v4 as uuidv4 } from 'uuid';
import {
    ADD_NEW_COMMENT_TO_TASK,
    DELETE_COMMENT_BY_ID,
    SET_OTP_CODE,
    SET_USER_SESSION,
    UPDATE_BOARDS,
    UPDATE_COLUMNS,
    UPDATE_COLUMN_ID,
    UPDATE_TASKS,
    UPDATE_TASK_ID,
    UPDATE_BOARD_ID,
    DELETE_BOARD,
} from './constants';

const initState = {
    OTPcode: '',
    userSession: {
        loggedIn: false,
        info: {},
    },
    boards: [],
    comments: {
        [uuidv4()]: {
            userId: 0,
            userName: '@TrungNguyen',
            content: 'Tui thấy nó lạ lắm á mọi người =))',
            reported: false,
            userThumbnail:
                'https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar2_fssdbw.jpg',
        },
        [uuidv4()]: {
            userId: 1,
            userName: '@HanhKhung',
            content: 'Thật là một task thú vị',
            reported: false,
            userThumbnail:
                'https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar4_n1nbbs.jpg',
        },
        [uuidv4()]: {
            userId: 2,
            userName: '@HongNgoc',
            content: 'Xi xi ba bla pa ra pẻng',
            reported: false,
            userThumbnail:
                'https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar3_clufwp.jpg',
        },
        [uuidv4()]: {
            userId: 3,
            userName: '@PhamHue',
            content: 'Siu nhân xanh biến hìnhhhh',
            reported: false,
            userThumbnail:
                'https://res.cloudinary.com/dzzv49yec/image/upload/v1670050964/taskbox-assets/avatar1_ilyzbz.jpg',
        },
    },
    columns: {
        'column-1': {
            id: 'column-1',
            title: 'Todo',
            taskIds: [],
        },
    },
    tasks: {
        'task-1': {
            id: 'task-1',
            content: 'Doing homework',
            reference: 'Todo',
        },
    },
    columnOrder: [],
};

function reducer(state, action) {
    const { comments } = state;
    switch (action.type) {
        case DELETE_BOARD:
            const deletedBoards = state.boards.filter((board) => board.id !== action.payload.id);
            return {
                ...state,
                boards: deletedBoards,
            };
        case UPDATE_BOARD_ID:
            const newBoards = state.boards.map((board) => {
                if (board.id === action.payload.id) {
                    return {
                        ...board,
                        ...action.payload.opt,
                    };
                } else {
                    return board;
                }
            });
            console.log(newBoards);
            return {
                ...state,
                boards: newBoards,
            };
        case UPDATE_BOARDS:
            return {
                ...state,
                boards: [...action.payload],
            };
        case UPDATE_TASK_ID:
            console.log('update task id fired');
            return {
                ...state,
                tasks: {
                    ...state.tasks,
                    [action.payload.id]: action.payload,
                },
            };
        case UPDATE_TASKS:
            return {
                ...state,
                tasks: {
                    ...action.payload,
                },
            };
        case UPDATE_COLUMNS:
            return {
                ...state,
                columns: {
                    ...action.payload,
                },
            };
        case UPDATE_COLUMN_ID:
            return {
                ...state,
                columns: {
                    ...state.columns,
                    [action.payload.id]: action.payload,
                },
            };
        case SET_OTP_CODE:
            return {
                ...state,
                OTPcode: action.payload,
            };
        case SET_USER_SESSION:
            return {
                ...state,
                userSession: {
                    loggedIn: action.payload.loggedIn,
                    info: {
                        ...action.payload.info,
                    },
                },
            };
        case DELETE_COMMENT_BY_ID:
            delete comments[action.payload.commentId];

            return {
                ...state,
                comments: {
                    ...comments,
                },
            };
        case ADD_NEW_COMMENT_TO_TASK:
            let newComments = Object.entries(comments);
            const { userId, userName, userThumbnail, content } = action.payload;

            newComments.splice(0, 0, [
                uuidv4(),
                {
                    userId,
                    userName,
                    userThumbnail,
                    content,
                    reported: false,
                },
            ]);

            newComments = newComments.reduce(
                (acc, [id, comment]) => ({
                    ...acc,
                    [id]: comment,
                }),
                {},
            );

            return {
                ...state,
                comments: newComments,
            };

        default:
            throw new Error('Invalid actions...');
    }
}

export { initState };
export default reducer;
