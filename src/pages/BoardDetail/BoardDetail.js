import {
    AdjustmentsHorizontalIcon,
    ArrowsUpDownIcon,
    BellIcon,
    CheckCircleIcon,
    EllipsisVerticalIcon,
    QuestionMarkCircleIcon,
    ShareIcon,
    Squares2X2Icon,
    StarIcon as StarIconOutline,
} from '@heroicons/react/24/outline';
import { Bars3Icon, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import classNames from 'classnames/bind';
import { useParams } from 'react-router-dom';
import styles from './BoardDetail.module.scss';

import { useEffect, useRef, useState } from 'react';
import { Board, BoardMenu, Button, LazyLoad, ShareModal, Toast, Tooltip, UserAvatar } from '~/components';
import FilterButton from '~/components/Board/FilterButton';
import ClosedBoard from '~/components/ClosedBoard';
import TaskModal from '~/components/TaskModal';
import { fetchBoard, saveBoard } from '~/lib/actions';

const cx = classNames.bind(styles);

const ViewBy = ({ viewBy, setViewBy }) => {
    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                className={`${viewBy === 'stack' ? 'text-blue-500' : 'text-slate-500'} p-2 rounded-md bg-white`}
                onClick={() => setViewBy('stack')}
            >
                <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
                type="button"
                onClick={() => setViewBy('list')}
                className={`${viewBy === 'list' ? 'text-blue-500' : 'text-slate-500'} p-2 rounded-md bg-white`}
            >
                <Bars3Icon className="w-5 h-5" />
            </button>
        </div>
    );
};

function BoardDetail() {
    const { title } = useParams();
    const [boardTitle, setBoardTitle] = useState('');
    const [board, setBoard] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [openTaskModal, setOpenTaskModal] = useState({
        show: false,
        task: {},
    });
    const [openShareModal, setOpenShareModal] = useState(false);
    const [viewBy, setViewBy] = useState('stack');
    const [toast, setToast] = useState({
        show: false,
        body: {
            message: '',
            status: '',
        },
    });

    const boardTitleInputRef = useRef();

    useEffect(() => {
        const getBoard = async () => {
            const result = await fetchBoard(title);
            if (result) {
                setBoard(result);
                setBoardTitle(result?.title);
                setIsLoading(false);
            }
        };
        getBoard();
    }, []);

    const handleBoardTitleFocusout = (e) => {
        const newBoard = {
            ...board,
            title: e.target.value,
        };
        saveBoard(board?.id, newBoard);
        setBoard(newBoard);
    };

    return (
        <div className="h-full flex items-center justify-center">
            {board?.deletedAt ? (
                <ClosedBoard setBoard={setBoard} board={board} setToast={setToast} />
            ) : (
                <section className="px-6 flex flex-col gap-4 h-full w-full bg-slate-100">
                    {/* Header */}
                    <section className="pt-6 min-h-[5rem] flex items-center justify-between">
                        {/* Left heading */}
                        <div className="space-y-2">
                            <LazyLoad isLoading={isLoading}>
                                <input
                                    onBlur={handleBoardTitleFocusout}
                                    ref={boardTitleInputRef}
                                    onChange={(e) => setBoardTitle(e.target.value)}
                                    className="caret-blue-500 bg-transparent focus:bg-white ease duration-200 outline-none ring ring-transparent rounded-md p-1 -m-1 hover:ring-blue-400 focus:ring-blue-400 text-2xl font-semibold"
                                    value={boardTitle}
                                />
                            </LazyLoad>
                            <div className="flex items-center text-slate-500">
                                <p>
                                    Last updated on: <span className="text-slate-700 font-semibold">Mar 12, 2023</span>
                                </p>
                                <Tooltip message="You could modify the description later">
                                    <span className="mx-2">
                                        <QuestionMarkCircleIcon className="w-5 h-5" />
                                    </span>
                                </Tooltip>
                                <Button>
                                    <span>
                                        {board && !board.favor ? (
                                            <StarIconOutline className="w-5 h-5" />
                                        ) : (
                                            <StarIconSolid className="w-5 h-5 text-yellow-400" />
                                        )}
                                    </span>
                                </Button>
                            </div>
                        </div>

                        {/* Right heading */}
                        <div className="flex items-center">
                            {/* Avatar Group */}
                            <Button type="button" className="mr-3">
                                <div className="avatar-group -space-x-4">
                                    <div className="avatar">
                                        <div className="w-9">
                                            <img
                                                alt="member avatar"
                                                src="https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar4_n1nbbs.jpg"
                                            />
                                        </div>
                                    </div>
                                    <div className="avatar">
                                        <div className="w-9">
                                            <img
                                                alt="member avatar"
                                                src="https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar2_fssdbw.jpg"
                                            />
                                        </div>
                                    </div>
                                    <div className="avatar">
                                        <div className="w-9">
                                            <img
                                                alt="member avatar"
                                                src="https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar3_clufwp.jpg"
                                            />
                                        </div>
                                    </div>
                                    <div className="avatar placeholder">
                                        <div className="w-9 bg-blue-100 text-blue-600 font-semibold">
                                            <span>+99</span>
                                        </div>
                                    </div>
                                </div>
                            </Button>
                            {/* Sharing */}
                            <div>
                                <Button
                                    className="hover:bg-blue-100/30 py-2 hover:text-blue-500  ease-in-out duration-200 bg-blue-100/50 text-blue-600 font-semibold rounded-md"
                                    type="button"
                                    size="small"
                                    onClick={() => setOpenShareModal((prev) => !prev)}
                                    leftIcon={<ShareIcon className="w-4 h-4" />}
                                >
                                    Share
                                </Button>
                            </div>
                            {/* Notify */}
                            <Button
                                type="button"
                                className="mx-3 relative hover:bg-slate-100 hover:text-slate-500 ease-in-out duration-200 p-2 rounded-full border border-slate-100 text-slate-400"
                            >
                                <BellIcon className="w-5 h-5" />
                                <span className="px-2 rounded-full bg-red-400 font-semibold text-slate-100 absolute -top-[30%] -right-[30%]">
                                    3
                                </span>
                            </Button>
                            {/* Avatar menu */}
                            <div className="hover:bg-slate-100 p-1 ease-in-out duration-200 rounded-full flex items-center">
                                <UserAvatar width="w-9" />
                            </div>
                        </div>
                    </section>
                    {/* View by section */}
                    <section className="flexEnd">
                        <div className="flex items-center gap-2">
                            <h4>View by:</h4>
                            <ViewBy setViewBy={setViewBy} viewBy={viewBy} />
                        </div>
                    </section>
                    {/* Filters */}
                    <section className="flexEnd">
                        <div className="flex items-center gap-2">
                            <FilterButton leftIcon={<CheckCircleIcon />} title={'All task'} />
                            <FilterButton leftIcon={<Squares2X2Icon />} title={'Customize'} />
                            <FilterButton leftIcon={<ArrowsUpDownIcon />} title={'Sort'} />
                            <FilterButton leftIcon={<AdjustmentsHorizontalIcon />} title={'Filter'} />
                            <BoardMenu data={board} setBoard={setBoard} setToast={setToast}>
                                <FilterButton
                                    title={
                                        <span className="w-5 h-5">
                                            <EllipsisVerticalIcon />
                                        </span>
                                    }
                                />
                            </BoardMenu>
                        </div>
                    </section>
                    {/* Board section */}
                    <section style={{ overflowX: 'overlay', overflowY: 'hidden' }} className="h-full w-full relative">
                        {isLoading ? (
                            <div>Fetching your boards...</div>
                        ) : (
                            <Board
                                setOpenTaskModal={setOpenTaskModal}
                                direction={viewBy === 'stack' ? 'horizontal' : 'vertical'}
                                board={board}
                                setBoard={setBoard}
                                setToast={setToast}
                                columnOrder={board?.columnOrder}
                            />
                        )}
                    </section>
                </section>
            )}
            {toast.show && <Toast placement="bottom-end" message={toast.body.message} status={toast.body.status} />}
            <TaskModal
                board={board}
                setToast={setToast}
                openTaskModal={openTaskModal}
                setOpenTaskModal={setOpenTaskModal}
            />
            <ShareModal modalTitle="Share board" show={openShareModal} setShow={setOpenShareModal} />
        </div>
    );
}

export default BoardDetail;
