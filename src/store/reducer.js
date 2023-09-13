import { v4 as uuidv4 } from 'uuid';
import {
    ADD_NEW_BOARD,
    ADD_NEW_COMMENT_TO_TASK,
    CHANGE_BOARD_FAVOR,
    CHANGE_BOARD_STATUS,
    DELETE_BOARD,
    DELETE_COMMENT_BY_ID,
    ONCHANGE_BOARD_TITLE,
    SET_OTP_CODE,
    SET_USER_SESSION,
    UPDATE_COLUMN_ID,
    UPDATE_COLUMNS,
    UPDATE_TASKS,
    UPDATE_TASK_ID,
} from './constants';

const initState = {
    OTPcode: '',
    userSession: {
        loggedIn: false,
        info: {},
    },
    boards: {
        [uuidv4()]: {
            title: 'Board 1',
            favor: false,
            closed: false,
            thumbnail:
                'https://images.unsplash.com/32/Mc8kW4x9Q3aRR3RkP5Im_IMG_4417.jpg?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        },
        [uuidv4()]: {
            title: 'Board 2',
            favor: false,
            closed: false,
            thumbnail:
                'https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        },
        [uuidv4()]: {
            title: 'Board 3',
            favor: false,
            closed: false,
            thumbnail:
                'https://images.unsplash.com/photo-1503455637927-730bce8583c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        },
        [uuidv4()]: {
            title: 'Board 4',
            favor: false,
            closed: false,
            thumbnail:
                'https://images.unsplash.com/photo-1496715976403-7e36dc43f17b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        },
        [uuidv4()]: {
            title: 'Board 5',
            favor: false,
            closed: false,
            thumbnail:
                'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80',
        },
        [uuidv4()]: {
            title: 'Board 6',
            favor: false,
            closed: false,
            thumbnail:
                'https://images.unsplash.com/photo-1563874257547-d19fbb71b46c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        },
    },
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
    const { boards } = state;
    const { comments } = state;
    let board;
    switch (action.type) {
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
        case CHANGE_BOARD_STATUS:
            board = boards[action.payload.boardId];

            if (board.favor) {
                return {
                    ...state,
                    boards: {
                        ...boards,
                        [action.payload.boardId]: {
                            ...board,
                            closed: action.payload.closed,
                            favor: false,
                        },
                    },
                };
            } else {
                return {
                    ...state,
                    boards: {
                        ...boards,
                        [action.payload.boardId]: {
                            ...board,
                            closed: action.payload.closed,
                            favor: false,
                        },
                    },
                };
            }

        case CHANGE_BOARD_FAVOR:
            board = boards[action.payload.boardId];

            return {
                ...state,
                boards: {
                    ...boards,
                    [action.payload.boardId]: {
                        ...board,
                        favor: action.payload.favor,
                    },
                },
            };
        case ADD_NEW_BOARD:
            return {
                ...state,
                boards: {
                    ...boards,
                    [uuidv4()]: {
                        ...action.payload,
                    },
                },
            };
        case DELETE_BOARD:
            delete boards[action.payload.boardId];

            return {
                ...state,
                boards: {
                    ...boards,
                },
            };
        case ONCHANGE_BOARD_TITLE:
            board = boards[action.payload.boardId];

            return {
                ...state,
                boards: {
                    ...boards,
                    [action.payload.boardId]: {
                        ...board,
                        title: action.payload.value,
                    },
                },
            };

        default:
            throw new Error('Invalid actions...');
    }
}

export { initState };
export default reducer;
