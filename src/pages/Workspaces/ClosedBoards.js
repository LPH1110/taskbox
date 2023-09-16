import { XMarkIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { Toast } from '~/components';
import { useStore } from '~/store';
import ClosedBoardRow from './ClosedBoardRow';
import './Modal-overrides.scss';

function ClosedBoards({ boards }) {
    const [state] = useStore();
    const [toast, setToast] = useState({
        body: {
            message: '',
            status: 'default',
        },
        show: false,
    });

    const deletedCount = () => {
        const count = boards.reduce((acc, board) => {
            if (board.deletedAt) {
                return acc + 1;
            }
            return acc;
        }, 0);
        return count;
    };

    return (
        <div>
            <label
                htmlFor="closed-board-modal"
                className="cursor-pointer rounded-md py-2 px-3 bg-slate-200 text-slate-700 hover:bg-slate-200/70"
            >
                Closed boards
                <span className="ml-1">({deletedCount()})</span>
            </label>

            <input type="checkbox" id="closed-board-modal" className="modal-toggle" />
            <label htmlFor="closed-board-modal" className="modal">
                <div className="modal-box w-11/12 max-w-5xl relative" onClick={(e) => e.preventDefault()}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Closed boards ({deletedCount()})</h2>
                        <label
                            onClick={(e) => e.stopPropagation()}
                            htmlFor="closed-board-modal"
                            className="cursor-pointer hover:text-slate-600 text-slate-700"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </label>
                    </div>
                    <div>
                        {boards.map((board) =>
                            board.deletedAt ? <ClosedBoardRow setToast={setToast} key={board.id} data={board} /> : '',
                        )}
                    </div>
                </div>
            </label>
            {toast.show && <Toast placement="bottom-end" message={toast.body.message} status={toast.body.status} />}
        </div>
    );
}

export default ClosedBoards;
