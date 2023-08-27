import React, { useState, useRef } from 'react';
import {
    Cog6ToothIcon,
    QuestionMarkCircleIcon,
    ArchiveBoxIcon,
    StarIcon,
    PrinterIcon,
    ArrowRightOnRectangleIcon,
    ArrowLeftIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    ChevronDoubleLeftIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames/bind';
import styles from './Inbox.module.scss';

import { Button, UserAvatar } from '~/components';
import MessageBox from './MessageBox';
import { IconButton } from '~/components';

const cx = classNames.bind(styles);

function Inbox() {
    const [searchKeys, setSearchKeys] = useState('');
    const inputRef = useRef();

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
        <section className="grid grid-cols-3 h-full">
            <section className="border-r border-slate-200">
                <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center justify-end">
                        <button type="button" className="text-slate-300 hover:text-slate-600 ease-in-out duration-200">
                            <ChevronDoubleLeftIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-end justify-between my-4">
                        <h1 className="text-3xl font-semibold">Inbox</h1>
                        <Button type="button" size="small" rightIcon={<ChevronDownIcon className="w-4 h-4" />}>
                            Recent
                        </Button>
                    </div>
                    {/* Search bar */}
                    <div className="ease duration-200 focus-within:ring-blue-500 ring ring-slate-100/70 flex items-center p-1.5 bg-slate-100/70 rounded-md">
                        <Button
                            type="button"
                            className={searchKeys.length > 0 ? 'text-slate-600 mr-2' : 'text-slate-400 mr-2'}
                        >
                            <MagnifyingGlassIcon className="w-5 h-5" />
                        </Button>
                        <input
                            ref={inputRef}
                            value={searchKeys}
                            onChange={(e) => handleInputChange(e)}
                            placeholder="Search messages..."
                            className="text-slate-600 bg-transparent outline-none flex-1"
                        />
                        {searchKeys.length > 0 && (
                            <span onClick={handleClearSearchKeys}>
                                <XMarkIcon className="w-4 h-4 ml-2" />
                            </span>
                        )}
                    </div>
                </div>
                {/* Message Boxes */}
                <div>
                    <MessageBox />
                    <MessageBox />
                    <MessageBox />
                    <MessageBox />
                    <MessageBox />
                    <MessageBox />
                </div>
            </section>
            <section className="col-span-2">
                {/* Header */}
                <div className="flex items-center justify-end py-2 px-4 border-b border-slate-200">
                    <IconButton>
                        <QuestionMarkCircleIcon className="w-5 h-5" />
                    </IconButton>
                    <IconButton>
                        <Cog6ToothIcon className="w-5 h-5" />
                    </IconButton>
                    <div className="w-0.5 mx-4 h-5 bg-slate-200"></div>
                    <UserAvatar width={9} />
                </div>
                <div className="flex">
                    <div className="flex-1 border-r border-slate-200">
                        {/* Actions */}
                        <div className="flex items-center justify-between p-3 border-b border-slate-200">
                            <div>
                                <IconButton>
                                    <ArrowLeftIcon className="w-5 h-5" />
                                </IconButton>
                                <IconButton>
                                    <ArchiveBoxIcon className="w-5 h-5" />
                                </IconButton>
                                <IconButton>
                                    <ExclamationTriangleIcon className="w-5 h-5" />
                                </IconButton>
                            </div>
                            <div className="flex items-center">
                                <IconButton>
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </IconButton>
                                <span className="mx-1">1 of 140</span>
                                <IconButton>
                                    <ChevronRightIcon className="w-5 h-5" />
                                </IconButton>
                            </div>
                            <div>
                                <IconButton>
                                    <ArrowUturnLeftIcon className="w-5 h-5" />
                                </IconButton>
                                <IconButton>
                                    <EllipsisVerticalIcon className="w-5 h-5" />
                                </IconButton>
                            </div>
                        </div>
                        {/* Footer Actions */}
                        <div className="p-2 flex items-center justify-between">
                            <div className="flex items-center">
                                <Button
                                    className="hover:bg-slate-100 ease-in-out duration-200 rounded-md"
                                    size="small"
                                    type="button"
                                    leftIcon={<ArrowUturnLeftIcon className="w-5 h-5" />}
                                >
                                    Reply
                                </Button>
                                <Button
                                    className="hover:bg-slate-100 ease-in-out duration-200 rounded-md"
                                    size="small"
                                    type="button"
                                    leftIcon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
                                >
                                    Forward
                                </Button>
                                <Button
                                    className="hover:bg-slate-100 ease-in-out duration-200 rounded-md"
                                    size="small"
                                    type="button"
                                    leftIcon={<PrinterIcon className="w-5 h-5" />}
                                >
                                    Print
                                </Button>
                            </div>
                            <div className="flex items-center">
                                <Button
                                    className="hover:bg-slate-100 ease-in-out duration-200 rounded-md"
                                    size="small"
                                    type="button"
                                    leftIcon={<StarIcon className="w-5 h-5" />}
                                >
                                    Starred
                                </Button>
                                <Button
                                    className="hover:bg-slate-100 ease-in-out duration-200 rounded-md"
                                    size="small"
                                    type="button"
                                    leftIcon={<TrashIcon className="w-5 h-5" />}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                    {/* Right Sidebar */}
                    <div className="px-4 py-2 flex flex-col items-center">
                        <button className={cx('user-avatar', 'avatar p-1 rounded-full')}>
                            <div className="w-9 rounded-full bg-slate-100 hover:bg-slate-200 ease-in-out duration-200 !flex items-center justify-center">
                                <PlusIcon className="w-5 h-5" />
                            </div>
                        </button>
                        <UserAvatar width={9} className={cx('user-avatar')} />
                        <UserAvatar width={9} className={cx('user-avatar')} />
                        <UserAvatar width={9} className={cx('user-avatar')} />
                        <UserAvatar width={9} className={cx('user-avatar')} />
                        <UserAvatar width={9} className={cx('user-avatar')} />
                        <UserAvatar width={9} className={cx('user-avatar')} />
                        <UserAvatar width={9} className={cx('user-avatar')} />
                        <UserAvatar width={9} className={cx('user-avatar')} />
                        <UserAvatar width={9} className={cx('user-avatar')} />
                        <UserAvatar width={9} className={cx('user-avatar')} />
                    </div>
                </div>
            </section>
        </section>
    );
}

export default Inbox;
