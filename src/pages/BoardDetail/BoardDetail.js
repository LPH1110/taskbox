import { Tab } from '@headlessui/react';
import {
    Bars2Icon,
    Bars3BottomRightIcon,
    BellIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    QuestionMarkCircleIcon,
    ShareIcon,
    Squares2X2Icon,
    StarIcon as StarIconOutline,
    UserIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, XMarkIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames/bind';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from './BoardDetail.module.scss';

import { useEffect, useRef, useState } from 'react';
import { Board, BoardMenu, Button, LazyLoad, Toast, Tooltip } from '~/components';
import { fetchBoard } from '~/lib/actions';

const cx = classNames.bind(styles);

const tabs = [
    {
        id: uuidv4(),
        title: 'Canban',
    },
    {
        id: uuidv4(),
        title: 'Timeline',
    },
    {
        id: uuidv4(),
        title: 'Calendar',
    },
];

function BoardDetail() {
    const { id } = useParams();

    const [board, setBoard] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const [boardTitle, setBoardTitle] = useState('');
    const [searchKeys, setSearchKeys] = useState('');
    const [toast, setToast] = useState({
        show: false,
        body: {
            message: '',
            status: '',
        },
    });
    const inputRef = useRef();

    useEffect(() => {
        setIsLoading(true);
        const getBoard = async () => {
            const result = await fetchBoard(id);
            setBoard(result);
            setBoardTitle(result?.title);
            console.log(result);
            setIsLoading(false);
        };
        getBoard();
    }, [id]);

    const handleInputChange = (e) => {
        const searchKeys = e.target.value;
        if (!searchKeys.startsWith(' ')) {
            setSearchKeys(searchKeys);
        }
    };

    const handleClearSearchKeys = () => {
        setSearchKeys('');
        inputRef.current.focus();
    };

    return (
        <section className="px-6 flex flex-col h-full w-full bg-slate-100">
            {/* Header */}
            <section className="py-6 min-h-[5rem] flex items-center justify-between">
                {/* Left heading */}
                <div className="space-y-2">
                    <LazyLoad isLoading={isLoading}>
                        <input
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
                        <Button type="button">
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
                            leftIcon={<ShareIcon className="w-4 h-4" />}
                        >
                            Share
                        </Button>
                    </div>
                    {/* Notify */}
                    <Button
                        type="button"
                        className="mx-5 relative hover:bg-slate-100 hover:text-slate-500 ease-in-out duration-200 p-2 rounded-full border border-slate-100 text-slate-400"
                    >
                        <BellIcon className="w-5 h-5" />
                        <span className="px-2 rounded-full bg-red-400 font-semibold text-slate-100 absolute -top-[30%] -right-[30%]">
                            3
                        </span>
                    </Button>
                    {/* Avatar menu */}
                    <BoardMenu data={board} />
                </div>
            </section>
            <section style={{ overflow: 'overlay' }} className="h-full container relative">
                <Board
                    board={board}
                    setBoard={setBoard}
                    setToast={setToast}
                    boardId={id}
                    columnOrder={board?.columnOrder}
                />
            </section>
            {toast.show && <Toast placement="bottom-end" message={toast.body.message} status={toast.body.status} />}
        </section>
    );
}

export default BoardDetail;
