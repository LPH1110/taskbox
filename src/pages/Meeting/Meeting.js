import React, { useRef, useState } from 'react';
import {
    ShareIcon,
    BellIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    Squares2X2Icon,
    Bars2Icon,
    CalendarIcon,
    PaperAirplaneIcon,
    ArchiveBoxXMarkIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline';
import { XMarkIcon, ArrowsUpDownIcon, PlusSmallIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import { Button, DatePicker, UserAvatar } from '~/components';
import MeetingCard from './MeetingCard';
import classNames from 'classnames/bind';
import styles from './Meeting.module.scss';
import { UserAuth } from '~/contexts/AuthContext';
import SearchInput from '~/components/SearchInput';

const cx = classNames.bind(styles);

function Meeting() {
    const [searchKeys, setSearchKeys] = useState('');
    const { user } = UserAuth();

    return (
        <section className="h-full">
            <section className="px-4">
                {/* Header */}
                <section className="min-h-[5rem] py-4 flex items-center justify-between">
                    {/* Left heading */}
                    <div className="mb-2">
                        <h1 className="text-slate-600 text-2xl font-semibold">Meetings</h1>
                    </div>

                    {/* Right heading */}
                    <div className="flex items-center">
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
                        <button
                            type="button"
                            className="hover:bg-slate-100 p-1 ease-in-out duration-200 rounded-full flex items-center"
                        >
                            <UserAvatar width={9} />
                            <span className="ml-2">
                                <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                            </span>
                        </button>
                    </div>
                </section>
                {/* Filter section */}
                <section className="border-t boder-slate-100/10 py-4 flex items-center justify-between">
                    <SearchInput value={searchKeys} setValue={setSearchKeys} />
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
                </section>
            </section>
            {/* Main board */}
            <section className="p-8 bg-slate-100">
                {/* Board header */}
                <h1 className="py-3 text-xl font-semibold text-slate-600">Overview</h1>
                {/* Statistic */}
                <section className="grid grid-cols-3 gap-x-12">
                    {/* Meeting conducted */}
                    <div className="flex select-none items-center bg-white p-3 rounded-xl">
                        <div className="mr-4 p-3 rounded-full bg-emerald-100/70">
                            <span className="text-emerald-500 font-bold">
                                <CalendarIcon className="w-6 h-6" />
                            </span>
                        </div>
                        <div>
                            <h4 className="text-2xl font-semibold text-slate-600">45</h4>
                            <p className="text-slate-500 text-md">Meeting Conducted</p>
                        </div>
                    </div>
                    {/* Scheduled Meeting */}
                    <div className="flex select-none items-center bg-white p-3 rounded-xl">
                        <div className="mr-4 p-3 rounded-full bg-purple-100/70">
                            <span className="text-purple-500 font-bold">
                                <PaperAirplaneIcon className="w-6 h-6" />
                            </span>
                        </div>
                        <div>
                            <h4 className="text-2xl font-semibold text-slate-600">67</h4>
                            <p className="text-slate-400 text-md">Schedule Meeting</p>
                        </div>
                    </div>
                    {/* Canceled Meeting */}
                    <div className="flex select-none items-center bg-white p-3 rounded-xl">
                        <div className="mr-4 p-3 rounded-full bg-orange-100/70">
                            <span className="text-orange-400 font-bold">
                                <ArchiveBoxXMarkIcon className="w-6 h-6" />
                            </span>
                        </div>
                        <div>
                            <h4 className="text-2xl font-semibold text-slate-600">23</h4>
                            <p className="text-slate-400 text-md">Canceled Meeting</p>
                        </div>
                    </div>
                </section>
                {/* Meeting boards */}
                <section className="h-full">
                    {/* Headers */}
                    <div className="grid grid-cols-3 gap-x-5">
                        <div className="col-span-2 flex items-center justify-between">
                            <h1 className="py-6 text-xl font-semibold text-slate-600">Upcomming</h1>
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    className="text-slate-600 hover:text-slate-500 ease duration-200 mr-2"
                                >
                                    <span>
                                        <PlusSmallIcon className="w-6 h-6" />
                                    </span>
                                </button>
                                <button type="button" className="text-slate-600 hover:text-slate-500 ease duration-200">
                                    <span>
                                        <EllipsisHorizontalIcon className="w-6 h-6" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Boards */}
                    <div className="grid grid-cols-3 gap-x-5">
                        <div className="shadow-lg h-full overflow-y-auto rounded-lg bg-white col-span-2">
                            <MeetingCard />
                            <MeetingCard />
                            <MeetingCard />
                            <MeetingCard />
                            <MeetingCard />
                        </div>
                        <div className="shadow-lg rounded-lg bg-white">
                            <DatePicker />
                        </div>
                    </div>
                </section>
            </section>
        </section>
    );
}

export default Meeting;
