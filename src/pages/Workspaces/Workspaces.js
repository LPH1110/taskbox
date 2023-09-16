import { ClockIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Toast } from '~/components';
import CreateBoardMenu from '~/components/CreateBoardMenu/CreateBoardMenu';
import { UserAuth } from '~/contexts/AuthContext';
import { fetchBoards, fetchColumns } from '~/lib/actions';
import ClosedBoards from './ClosedBoards';
import styles from './Workspaces.module.scss';
import { actions, useStore } from '~/store';
import BoardItem from './BoardItem';

const cx = classNames.bind(styles);

const statusList = [
    {
        id: uuidv4(),
        columnTitle: 'Todo task',
        count: 52,
    },
    {
        id: uuidv4(),
        columnTitle: 'In Progress task',
        count: 42,
    },
    {
        id: uuidv4(),
        columnTitle: 'Ready for QA',
        count: 40,
    },
    {
        id: uuidv4(),
        columnTitle: 'Done',
        count: 32,
    },
];

const members = [
    {
        id: uuidv4(),
        avatarURL: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar2_fssdbw.jpg',
    },
    {
        id: uuidv4(),
        avatarURL: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar4_n1nbbs.jpg',
    },
    {
        id: uuidv4(),
        avatarURL: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1670050964/taskbox-assets/avatar1_ilyzbz.jpg',
    },
    {
        id: uuidv4(),
        avatarURL: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar3_clufwp.jpg',
    },
];

function Workspaces() {
    const { user } = UserAuth();
    const [state, dispatch] = useStore();
    const { boards } = state;
    const [toast, setToast] = useState({
        show: false,
        body: {
            message: '',
            status: '',
        },
    });

    console.log(boards);

    useEffect(() => {
        const getBoards = async () => {
            try {
                const boardsResult = await fetchBoards(user?.uid);
                dispatch(actions.updateBoards(boardsResult));
            } catch (error) {
                console.log(error);
            }
        };

        getBoards();
    }, [user?.uid, dispatch]);

    return (
        <section className="p-6">
            <div className="space-y-6">
                <h1 className="text-lg font-semibold text-slate-600 flex items-center gap-2 justify-start">
                    <ClockIcon className="w-5 h-5" /> Recently viewed
                </h1>
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {/* Boards */}
                    {boards.map((board) => {
                        return !board.deletedAt && <BoardItem key={board.id} board={board} members={members} />;
                    })}

                    {/* Create Boards Button */}
                    <CreateBoardMenu setToast={setToast} />
                </section>
            </div>
            <section className="mt-12">
                <ClosedBoards boards={boards} />
            </section>
            {toast.show && <Toast placement="bottom-end" message={toast.body.message} status={toast.body.status} />}
        </section>
    );
}

export default Workspaces;
