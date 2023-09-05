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
import { Board, BoardMenu, Button, Tooltip } from '~/components';
import { ActivityAuth } from '~/contexts/ActivityContext';
import { UserAuth } from '~/contexts/AuthContext';
import { actions, useStore } from '~/store';
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

    const [boardTitle, setBoardTitle] = useState(board?.title);
    const [searchKeys, setSearchKeys] = useState('');
    const inputRef = useRef();

    useEffect(() => {
        const getBoard = async () => {
            const result = fetchBoard(id);
            setBoard(result);
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
        <section className="w-full h-screen overflow-y-auto">
            {/* Header */}
            <section className="p-6 min-h-[5rem] flex items-center justify-between">
                {/* Left heading */}
                <div>
                    <div className="mb-2">
                        <input
                            onChange={(e) => setBoardTitle(e.target.value)}
                            className="caret-blue-500 ease duration-200 outline-none ring ring-transparent rounded-md p-1 -m-1 hover:ring-blue-400 focus:ring-blue-400 text-2xl font-semibold"
                            value={boardTitle}
                        />
                    </div>
                    <div className="flex items-center text-slate-500">
                        <p>Description of your project what do want to do</p>
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
            {/* Navigations */}
            <section className="p-6 mb-6 relative">
                <Tab.Group>
                    <Tab.List className="mb-3 py-2 border-y border-slate-100">
                        {/* Tabs */}
                        <div className="flex items-center justify-between">
                            <div className="inline-block relative">
                                {tabs.map((tab) => (
                                    <Tab
                                        className={cx(
                                            'tab',
                                            'ui-selected:text-slate-700 relative text-slate-300 py-2 px-3 outline-none font-semibold ease duration-200',
                                        )}
                                        key={tab.id}
                                    >
                                        {({ selected }) =>
                                            selected ? (
                                                <>
                                                    <h4>{tab.title}</h4>
                                                    <div className="animate-span-from-left h-1 left-0 -bottom-[5%] right-0 absolute bg-blue-500 rounded-xl"></div>
                                                </>
                                            ) : (
                                                <h4>{tab.title}</h4>
                                            )
                                        }
                                    </Tab>
                                ))}
                            </div>
                            {/* View by */}
                            <div className="flex items-center">
                                <span className="mr-4 text-slate-500">View By</span>
                                <div className="p-0.5 bg-slate-100 rounded-md flex items-center text-slate-500">
                                    <button type="button" className="p-1 rounded-l-md bg-white">
                                        <span>
                                            <Squares2X2Icon className="w-5 h-5" />
                                        </span>
                                    </button>
                                    <button type="button" className="ml-0.5 p-1 rounded-r-md bg-transparent">
                                        <span>
                                            <Bars2Icon className="w-5 h-5" />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel className="absolute left-0 right-0">
                            {/* Filters */}
                            <div className="mb-2 px-6 pb-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <Button
                                        className="text-slate-300 hover:text-slate-500 rounded-md hover:bg-slate-100 ease-in-out duration-200"
                                        leftIcon={<UserIcon className="w-5 h-5" />}
                                        size="small"
                                        type="button"
                                    >
                                        Person
                                    </Button>
                                    <Button
                                        className="text-slate-300 hover:text-slate-500 rounded-md hover:bg-slate-100 ease-in-out duration-200"
                                        leftIcon={<FunnelIcon className="w-5 h-5" />}
                                        size="small"
                                        type="button"
                                    >
                                        Filters
                                    </Button>
                                    <Button
                                        className="text-slate-300 hover:text-slate-500 rounded-md hover:bg-slate-100 ease-in-out duration-200"
                                        leftIcon={<Bars3BottomRightIcon className="w-5 h-5" />}
                                        size="small"
                                        type="button"
                                    >
                                        Sort
                                    </Button>
                                </div>
                                <div className="flex items-center">
                                    {/* Search bar */}
                                    <div className="ease duration-200 focus-within:ring-blue-500 ring ring-slate-100 flex items-center p-1.5 bg-slate-100 rounded-md">
                                        <Button
                                            type="button"
                                            className={
                                                searchKeys.length > 0 ? 'text-slate-600 mr-2' : 'text-slate-400 mr-2'
                                            }
                                        >
                                            <MagnifyingGlassIcon className="w-5 h-5" />
                                        </Button>
                                        <input
                                            ref={inputRef}
                                            value={searchKeys}
                                            onChange={(e) => handleInputChange(e)}
                                            placeholder="Search tasks..."
                                            className="text-slate-600 bg-transparent outline-none"
                                        />
                                        {searchKeys.length > 0 ? (
                                            <span onClick={handleClearSearchKeys}>
                                                <XMarkIcon className="w-4 h-4 ml-2" />
                                            </span>
                                        ) : (
                                            <span className="w-4 h-4 ml-2"></span>
                                        )}
                                    </div>
                                    {/* Add task btn */}
                                    <Button
                                        size="medium"
                                        className="h-full ml-4 rounded-md bg-blue-100 text-blue-500 font-semibold hover:bg-blue-100/70 hover:text-blue-500/70 ease-in-out duration-200"
                                        leftIcon={<PlusIcon className="w-5 h-5" />}
                                    >
                                        Add task
                                    </Button>
                                </div>
                            </div>
                            {/* Board */}
                            <Board />
                        </Tab.Panel>
                        <Tab.Panel>
                            <div>Timeline panel</div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div>Calendar panel</div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </section>
        </section>
    );
}

export default BoardDetail;
