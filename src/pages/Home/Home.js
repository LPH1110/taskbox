import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '~/components';
import images from '~/assets';

import {
    BoltIcon,
    LockClosedIcon,
    Square3Stack3DIcon,
    ArrowSmallRightIcon,
    CheckCircleIcon,
    UsersIcon,
} from '@heroicons/react/24/solid';
import { ArrowDownCircleIcon, ArrowUpOnSquareIcon, PlusIcon, Square2StackIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import styles from './Home.module.scss';
import SlidePlatforms from './SlidePlatforms';
import { useStore } from '~/store';
import { UserAuth } from '~/contexts/AuthContext';

const cx = classNames.bind(styles);

function Home() {
    const { user } = UserAuth();
    const navigate = useNavigate();
    const [state, dispatch] = useStore();

    const getStarted = () => {
        if (user) {
            navigate('/workspaces');
        } else {
            navigate('/signin');
        }
    };

    return (
        <section className="py-12 flex flex-col items-center">
            {/* Landing content */}
            <section className="mt-10 flex flex-col items-center max-w-[50%] text-center">
                <div className="flex items-center text-blue-500 py-2 px-3 rounded-full bg-blue-100/50">
                    <span className="mr-1">
                        <BoltIcon className="w-4 h-4" />
                    </span>
                    <p className="font-semibold text-sm">CREATE FOR FAST</p>
                </div>
                <h1 className="font-bold text-5xl mt-6">A simple, efficient and easy way to collaborate</h1>
                <p className="text-slate-600 p-8">
                    We help to connect, manage and organize your work with everyone so the team can deliver a better
                    product - accompish it all with Taskbox
                </p>
                <div className="flex items-center">
                    <Button
                        type="button"
                        size="large"
                        onClick={getStarted}
                        className="bg-blue-500 hover:bg-blue-400 border ease-in-out duration-200 text-white font-semibold"
                    >
                        Get Started
                    </Button>
                    <Button
                        type="button"
                        size="large"
                        className="text-blue-500 font-semibold border border-slate-200 hover:bg-blue-100/50 ease-in-out duration-200"
                    >
                        View Demo
                    </Button>
                </div>
            </section>
            {/* Landing wallpaper */}
            <section className="p-36">
                <div
                    className={cx(
                        'landing-frame-mac',
                        'select-none relative w-full border-t border-x rounded-xl border-slate-200',
                    )}
                >
                    <div className="grid grid-cols-3 gap-x-9 p-4 border-b border-slate-200">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                            <div className="w-3 h-3 mx-2 bg-yellow-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <div>
                            <span className="w-3 h-3">
                                <i className="fa-solid fa-shield-halved"></i>
                            </span>
                            <div className="w-full bg-slate-100 h-full p-1 rounded-lg">
                                <div className="flex items-center justify-between text-slate-500">
                                    <div className="flex items-center justify-center flex-1">
                                        <span className="mr-1">
                                            <LockClosedIcon className="w-3 h-3" />
                                        </span>
                                        <p>taskbox.com</p>
                                    </div>
                                    <span className="w-3 h-3 mr-1">
                                        <img src={images.redoIcon} alt="redo" />
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end">
                            <Button type="button" className="cursor-default text-slate-500 p-1">
                                <ArrowDownCircleIcon className="w-5 h-5" />
                            </Button>
                            <Button type="button" className="cursor-default text-slate-500 p-1">
                                <ArrowUpOnSquareIcon className="w-5 h-5" />
                            </Button>
                            <Button type="button" className="cursor-default text-slate-500 p-1">
                                <PlusIcon className="w-5 h-5" />
                            </Button>
                            <Button type="button" className="cursor-default text-slate-500 p-1">
                                <Square2StackIcon className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                    <div>
                        <img src={images.landingWallpaper} alt="landing-wallpaper" />
                    </div>
                    {/* Background overlay */}
                    <div className={cx('landing-overlay', 'absolute bottom-0 w-full h-1/2')}></div>
                </div>
            </section>

            {/* Stack Review */}
            <section className="py-12 px-36 grid grid-cols-2">
                <div className="py-24 max-w-[80%] flex flex-col justify-between items-start">
                    <div className="block p-2 rounded-xl bg-gray-900">
                        <Square3Stack3DIcon className="w-6 h-6 text-white" />
                    </div>

                    <div className="font-semibold text-3xl">
                        <h4>Easily visualize your tasks</h4>
                    </div>

                    <p className="text-slate-500 text-justify">
                        From here you can see the details of the task as you run. Additionally, you'll be able to see
                        the status, peoples, deadlines, etc.
                    </p>

                    <Button
                        type="button"
                        onClick={() => navigate('/workspaces')}
                        className="font-semibold text-blue-500 hover:text-blue-400 ease duration-200"
                        rightIcon={<ArrowSmallRightIcon className="w-5 h-5" />}
                    >
                        Explore now
                    </Button>
                </div>
                <div
                    className="opacity-80 shadow-2xl rounded-xl bg-no-repeat bg-cover pt-[80%]"
                    style={{
                        backgroundImage:
                            'url(https://res.cloudinary.com/dzzv49yec/image/upload/v1671255554/taskbox-assets/taskdetail_wewtrq.png)',
                    }}
                ></div>
            </section>
            <section className="py-12 px-36 grid grid-cols-2">
                <div
                    className="opacity-80 shadow-2xl rounded-xl bg-no-repeat bg-cover pt-[80%]"
                    style={{
                        backgroundImage:
                            'url(https://res.cloudinary.com/dzzv49yec/image/upload/v1671256270/taskbox-assets/landingWallpaper_laepbh.png)',
                    }}
                ></div>
                <div className="py-24 flex items-center justify-center">
                    <div className="h-full max-w-[80%] flex flex-col justify-between items-start">
                        <div className="block p-2 rounded-xl bg-gray-900">
                            <UsersIcon className="w-6 h-6 text-white" />
                        </div>

                        <div className="font-semibold text-3xl">
                            <h4>Set up your own meeting</h4>
                        </div>

                        <p className="text-slate-500 text-justify">
                            This page has been demonstrating all the meetings. Such as upcoming, pending, etc and you
                            can set dates from the calendar.
                        </p>

                        <Button
                            type="button"
                            onClick={() => navigate('/meeting')}
                            className="font-semibold text-blue-500 hover:text-blue-400 ease duration-200"
                            rightIcon={<ArrowSmallRightIcon className="w-5 h-5" />}
                        >
                            Set up a meeting
                        </Button>
                    </div>
                </div>
            </section>

            {/* Slide Platforms */}
            <SlidePlatforms className="bg-slate-100/70 pt-12 pb-24 w-full mt-12" />

            {/* Join us */}
            <section className="py-12 w-full flex items-center justify-center">
                <div className="rounded-xl shadow-lg pt-12 pb-8  w-4/6 flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-semibold mb-2">Join 20M+ users today</h1>
                    <p className="text-slate-500">Get started for free - upgrade anytime</p>
                    <Button
                        type="button"
                        size="large"
                        onClick={() => navigate('/workspaces')}
                        className="font-semibold my-6 bg-blue-500 text-white hover:bg-blue-400 ease-in-out duration-200"
                    >
                        Get Started
                    </Button>
                    <div className="flex items-center text-sm">
                        <div className="flex items-center">
                            <span className="mr-1">
                                <CheckCircleIcon className="w-5 h-5" />
                            </span>
                            <p>Simple and easy</p>
                        </div>
                        <div className="flex items-center mx-4">
                            <span className="mr-1">
                                <CheckCircleIcon className="w-5 h-5" />
                            </span>
                            <p>Powerful tools</p>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-1">
                                <CheckCircleIcon className="w-5 h-5" />
                            </span>
                            <p>Complete integrations</p>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
}

export default Home;
