import { Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityAuth } from '~/contexts/ActivityContext';
import { UserAuth } from '~/contexts/AuthContext';
import { deleteBoard, saveBoard } from '~/lib/actions';
import { actions, useStore } from '~/store';
import Spacer from '../Spacer';
import Button from '../Button';

const ClosedBoard = ({ setBoard, board, setToast }) => {
    const [, dispatch] = useStore();
    const { user } = UserAuth();
    const { saveAction } = ActivityAuth();
    const [timeoutId, setTimeoutId] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [openConfirmDel, setOpenConfirmDel] = useState(false);
    const navigate = useNavigate();

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

    const handleDeleteBoard = async (e) => {
        e.stopPropagation();
        setIsLoading(true);
        try {
            const delResult = await deleteBoard(board.id);
            dispatch(actions.deleteBoardById(board.id));
            if (delResult.status === 200) {
                await saveAction({
                    userId: user?.uid,
                    action: 'deleted',
                    message: board.title,
                    date: new Date(),
                });
                setToast({
                    show: true,
                    body: {
                        message: delResult.message,
                        status: 'success',
                    },
                });
                setOpenConfirmDel(false);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setTimeoutId(
                setTimeout(() => {
                    setToast((prev) => ({ ...prev, show: false }));
                    navigate('/workspaces');
                }, 1000),
            );
        }
    };

    useEffect(() => {
        return () => clearTimeout(timeoutId);
    }, [timeoutId]);

    return (
        <div className="relative flexCenter flex-col rounded-xl w-[24rem] p-12 shadow-md gap-6 bg-white">
            <h1 className="text-2xl font-semibold">{board.title} is closed</h1>
            <button
                onClick={handleReopenBoard}
                type="button"
                className="p-2 rounded-md bg-blue-500 hover:bg-blue-500/80 text-white ease duration-100"
            >
                Reopen board
            </button>
            <div className="relative">
                <button
                    onClick={() => setOpenConfirmDel((prev) => !prev)}
                    type="button"
                    className="relative text-description hover:text-blue-500 hover:underline ease duration-100"
                >
                    Permanently delete board
                </button>
                <Transition
                    show={openConfirmDel}
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <div
                        onClick={handleDeleteBoard}
                        className="min-w-[20rem] bg-slate-600 rounded-md absolute top-full text-white p-4 flexCenter flex-col gap-2"
                    >
                        <h4>Permanently delete?</h4>
                        <Spacer />
                        <p>
                            All lists, cards and actions will be deleted, and you won't be able to re-open the board.
                            There is no undo.
                        </p>
                        <Button
                            size="small"
                            className="rounded-sm w-full p-2 bg-red-400 text-white hover:bg-red-400/80 ease duration-100"
                        >
                            {isLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </Transition>
            </div>
        </div>
    );
};

export default ClosedBoard;
