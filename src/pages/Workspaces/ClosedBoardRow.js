import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames/bind';
import styles from './ClosedBoardRow.module.scss';

import { UserAuth } from '~/contexts/AuthContext';
import { ActivityAuth } from '~/contexts/ActivityContext';
import { Button } from '~/components';
import { useStore, actions } from '~/store';
import { saveBoard } from '~/lib/actions';
import { DelConfirmPopper } from '~/components';

const cx = classNames.bind(styles);

function ClosedBoardRow({ setBoards, data, setToast }) {
    const [, dispatch] = useStore();
    const { user } = UserAuth();
    const { saveAction } = ActivityAuth();
    const [timeoutId, setTimeoutId] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [openConfirmDel, setOpenConfirmDel] = useState(false);

    const handleReOpenBoard = (e) => {
        e.preventDefault();
        const newBoard = {
            ...data,
            deletedAt: null,
        };

        // update board in db
        saveBoard(data.id, newBoard);

        // update board in reducer store
        dispatch(actions.updateBoardById(data.id, { deletedAt: null }));

        // Saved yuser's activity
        saveAction({
            userId: user.uid,
            action: 'reopened',
            message: data.title,
            date: new Date(),
        });

        // Show toast message when succeed
        setToast({
            show: true,
            body: {
                message: `Reopened board (${data.title}) successfully.`,
                status: 'success',
            },
        });

        // timeout to hide toast
        setTimeoutId(
            setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
            }, 3000),
        );
    };

    const handleDeleteBoard = () => {
        console.log('board delete');
    };

    useEffect(() => {
        return () => {
            clearTimeout(timeoutId);
        };
    }, [timeoutId]);

    return (
        <div className="py-4">
            <div className="flex items-center justify-between">
                <h4 className={cx('title', 'text-lg')}>{data.title}</h4>
                <div className="flex items-center">
                    <DelConfirmPopper
                        handleDelete={handleDeleteBoard}
                        isLoading={isLoading}
                        openConfirmDel={openConfirmDel}
                        setOpenConfirmDel={setOpenConfirmDel}
                    >
                        <Button
                            type="button"
                            size="small"
                            onClick={() => setOpenConfirmDel((prev) => !prev)}
                            leftIcon={<XMarkIcon className="w-5 h-5" />}
                            className="rounded-sm bg-slate-200 text-slate-700 hover:bg-slate-200/80 ease-in-out duration-200"
                        >
                            Delete
                        </Button>
                    </DelConfirmPopper>
                    <Button
                        type="button"
                        size="small"
                        onClick={(e) => handleReOpenBoard(e)}
                        className="ml-2 rounded-sm font-semibold bg-blue-200 text-blue-600 hover:bg-blue-200/80 ease-in-out duration-200"
                    >
                        Reopen
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ClosedBoardRow;
