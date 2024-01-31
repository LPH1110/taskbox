import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityAuth } from '~/contexts/ActivityContext';
import { UserAuth } from '~/contexts/AuthContext';
import { actions, useStore } from '~/store';
import DelConfirmPopper from '../DelConfirmPopper/DelConfirmPopper';
import { deleteBoard, saveBoard } from '~/lib/api/boards';

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
        <div className="h-full flex items-center justify-center">
            <div className="relative flexCenter flex-col rounded-xl w-[24rem] p-12 shadow-md gap-6 bg-white">
                <h1 className="text-2xl font-semibold">{board.title} is closed</h1>
                <button
                    onClick={handleReopenBoard}
                    type="button"
                    className="p-2 rounded-md bg-blue-500 hover:bg-blue-500/80 text-white ease duration-100"
                >
                    Reopen board
                </button>
                <DelConfirmPopper
                    handleDelete={handleDeleteBoard}
                    isLoading={isLoading}
                    openConfirmDel={openConfirmDel}
                    setOpenConfirmDel={setOpenConfirmDel}
                >
                    <button
                        onClick={() => setOpenConfirmDel((prev) => !prev)}
                        type="button"
                        className="relative text-description hover:text-blue-500 hover:underline ease duration-100"
                    >
                        Permanently delete board
                    </button>
                </DelConfirmPopper>
            </div>
        </div>
    );
};

export default ClosedBoard;
