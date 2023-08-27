import React from 'react';
import { useState, useCallback } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';
import { Button, Toast } from '~/components';
import { useStore } from '~/store';
import ClosedBoardRow from './ClosedBoardRow';
import './Modal-overrides.scss';

function ClosedBoards() {
    const [state, dispatch] = useStore();
    const { boards } = state;
    const [toast, setToast] = useState({
        body: {
            message: '',
            status: 'default',
        },
        show: false,
    });

    return (
        <div>
            <label
                htmlFor="closed-board-modal"
                className="cursor-pointer rounded-md py-2 px-3 bg-slate-200 text-slate-700 hover:bg-slate-200/70"
            >
                Closed boards
                <span className="ml-1">
                    (
                    {Object.entries(boards).reduce((acc, [id, board]) => {
                        if (board.closed) {
                            return acc + 1;
                        }
                        return acc;
                    }, 0)}
                    )
                </span>
            </label>

            <input type="checkbox" id="closed-board-modal" className="modal-toggle" />
            <label htmlFor="closed-board-modal" className="modal">
                <div className="modal-box w-11/12 max-w-5xl relative" onClick={(e) => e.preventDefault()}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">
                            Closed boards (
                            {Object.entries(boards).reduce((acc, [id, board]) => {
                                if (board.closed) {
                                    return acc + 1;
                                }
                                return acc;
                            }, 0)}
                            )
                        </h2>
                        <label
                            onClick={(e) => e.stopPropagation()}
                            htmlFor="closed-board-modal"
                            className="cursor-pointer hover:text-slate-600 text-slate-700"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </label>
                    </div>
                    <div>
                        {Object.entries(boards).map(([id, board]) =>
                            board.closed ? <ClosedBoardRow setToast={setToast} key={id} data={{ ...board, id }} /> : '',
                        )}
                    </div>
                </div>
            </label>
            {toast.show && <Toast placement="bottom-end" message={toast.body.message} status={toast.body.status} />}
        </div>
    );
}

export default ClosedBoards;
