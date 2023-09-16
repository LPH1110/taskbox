import React, { useEffect, useState } from 'react';
import { ActivityAuth } from '~/contexts/ActivityContext';
import { UserAuth } from '~/contexts/AuthContext';
import { saveBoard } from '~/lib/actions';
import { actions, useStore } from '~/store';

const ClosedBoard = ({ setBoard, board, setToast }) => {
    const [, dispatch] = useStore();
    const { user } = UserAuth();
    const { saveAction } = ActivityAuth();
    const [timeoutId, setTimeoutId] = useState();

    const handleReopenBoard = () => {
        const newBoard = { ...board, deletedAt: null };
        dispatch(actions.updateBoardById(board.id, { deletedAt: null }));

        saveBoard(board.id, newBoard);

        setBoard(newBoard);

        saveAction({
            userId: user.uid,
            action: 'reopened',
            message: board.title,
            date: new Date(),
        });

        setToast({
            show: true,
            body: {
                message: `Reopen board (${board.title}) successfully.`,
                status: 'success',
            },
        });

        setTimeoutId(
            setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
            }, 3000),
        );
    };

    useEffect(() => {
        return () => clearTimeout(timeoutId);
    }, [timeoutId]);

    const handleDeleteBoard = () => {};

    return (
        <div className="flexCenter flex-col rounded-xl w-[24rem] p-12 shadow-md gap-6 bg-white">
            <h1 className="text-2xl font-semibold">{board.title} is closed</h1>
            <button
                onClick={handleReopenBoard}
                type="button"
                className="p-2 rounded-md bg-blue-500 hover:bg-blue-500/80 text-white ease duration-100"
            >
                Reopen board
            </button>
            <button type="button" className="text-description hover:text-blue-500 hover:underline ease duration-100">
                Permanently delete board
            </button>
        </div>
    );
};

export default ClosedBoard;
