import {
    ADD_NEW_BOARD,
    ADD_NEW_COMMENT_TO_TASK,
    DELETE_BOARD,
    DELETE_COMMENT,
    ONCHANGE_BOARD_TITLE,
    SET_OTP_CODE,
    SET_USER_SESSION,
    UPDATE_BOARDS,
    UPDATE_BOARD_ID,
    UPDATE_COLUMNS,
    UPDATE_COLUMN_ID,
    UPDATE_COMMENTS,
    UPDATE_TASKS,
    UPDATE_TASK_ID,
    UPDATE_SHARED_BOARDS,
    DELETE_SHARED_BOARD,
    UPDATE_ASSIGNEES,
} from './constants';

export const updateAssignees = (payload) => ({
    type: UPDATE_ASSIGNEES,
    payload,
});

export const deleteSharedBoard = (id) => ({
    type: DELETE_SHARED_BOARD,
    payload: { id },
});

export const deleteCommentById = (payload) => ({
    type: DELETE_COMMENT,
    payload,
});

export const updateComments = (payload) => ({
    type: UPDATE_COMMENTS,
    payload,
});

export const updateBoards = (payload) => ({
    type: UPDATE_BOARDS,
    payload,
});

export const updateTaskById = (payload) => ({
    type: UPDATE_TASK_ID,
    payload,
});

export const updateBoardById = (id, opt) => ({
    type: UPDATE_BOARD_ID,
    payload: { id, opt },
});

export const updateColumnById = (payload) => ({
    type: UPDATE_COLUMN_ID,
    payload,
});

export const updateTasks = (payload) => ({
    type: UPDATE_TASKS,
    payload,
});

export const updateColumns = (payload) => ({
    type: UPDATE_COLUMNS,
    payload,
});

export const setOTPcode = (payload) => ({
    type: SET_OTP_CODE,
    payload,
});

export const setUserSession = (payload) => ({
    type: SET_USER_SESSION,
    payload,
});

export const addNewBoard = (payload) => ({
    type: ADD_NEW_BOARD,
    payload,
});

export const deleteBoardById = (id) => ({
    type: DELETE_BOARD,
    payload: { id },
});

export const onChangeBoardTitle = (payload) => ({
    type: ONCHANGE_BOARD_TITLE,
    payload,
});

export const addNewCommentToTask = (payload) => ({
    type: ADD_NEW_COMMENT_TO_TASK,
    payload,
});

export const updateSharedBoards = (payload) => ({
    type: UPDATE_SHARED_BOARDS,
    payload,
});
