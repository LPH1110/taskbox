import {
    CHANGE_BOARD_STATUS,
    CHANGE_BOARD_FAVOR,
    ADD_NEW_BOARD,
    DELETE_BOARD,
    ONCHANGE_BOARD_TITLE,
    ADD_NEW_COMMENT_TO_TASK,
    DELETE_COMMENT_BY_ID,
    SET_USER_SESSION,
    SET_OTP_CODE,
    UPDATE_COLUMN_ID,
    UPDATE_COLUMNS,
    UPDATE_TASKS,
    UPDATE_BOARD,
    UPDATE_TASK_ID,
} from './constants';

export const updateTaskById = (payload) => ({
    type: UPDATE_TASK_ID,
    payload,
});

export const updateBoardById = (payload) => ({
    type: UPDATE_BOARD,
    payload,
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

export const changeBoardFavor = (payload) => ({
    type: CHANGE_BOARD_FAVOR,
    payload,
});

export const changeBoardStatus = (payload) => ({
    type: CHANGE_BOARD_STATUS,
    payload,
});

export const addNewBoard = (payload) => ({
    type: ADD_NEW_BOARD,
    payload,
});

export const deleteBoard = (payload) => ({
    type: DELETE_BOARD,
    payload,
});

export const onChangeBoardTitle = (payload) => ({
    type: ONCHANGE_BOARD_TITLE,
    payload,
});

export const addNewCommentToTask = (payload) => ({
    type: ADD_NEW_COMMENT_TO_TASK,
    payload,
});

export const deleteCommentById = (payload) => ({
    type: DELETE_COMMENT_BY_ID,
    payload,
});
