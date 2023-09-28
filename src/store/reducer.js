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
    UPDATE_COMMENTS,
    DELETE_COMMENT,
} from './constants';

const initState = {
    OTPcode: '',
    userSession: {
        loggedIn: false,
        info: {},
    },
    boards: [],
    columns: {
        'column-1': {
            id: 'column-1',
            title: 'Todo',
            taskIds: [],
        },
    },
    comments: {},
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
    let newComments;
    switch (action.type) {
        case ADD_NEW_COMMENT_TO_TASK:
            if (state.comments[action.payload.id]) {
                // update comment
                newComments = state.comments;
                newComments[action.payload.id] = {
                    ...action.payload,
                };
                return {
                    ...state,
                    comments: newComments,
                };
            } else {
                return {
                    ...state,
                    comments: {
                        [action.payload.id]: { ...action.payload },
                        ...state.comments,
                    },
                };
            }
        case DELETE_COMMENT:
            newComments = state.comments;
            delete newComments[action.payload];
            return {
                ...state,
                comments: newComments,
            };
        case UPDATE_COMMENTS:
            return {
                ...state,
                comments: action.payload,
            };
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

        default:
            throw new Error('Invalid actions...');
    }
}

export { initState };
export default reducer;
