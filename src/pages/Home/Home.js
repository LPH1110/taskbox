import { useNavigate } from 'react-router-dom';
import images from '~/assets';
import { Button } from '~/components';

import { ArrowDownCircleIcon, ArrowUpOnSquareIcon, PlusIcon, Square2StackIcon } from '@heroicons/react/24/outline';
import {
    ArrowSmallRightIcon,
    BoltIcon,
    CheckCircleIcon,
    LockClosedIcon,
    Square3Stack3DIcon,
    UsersIcon,
} from '@heroicons/react/24/solid';
import classNames from 'classnames/bind';
import { UserAuth } from '~/contexts/AuthContext';
import styles from './Home.module.scss';
import SlidePlatforms from './SlidePlatforms';

const cx = classNames.bind(styles);

function Home() {
    const { user } = UserAuth();
    const navigate = useNavigate();

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
            <section className="mt-10 flex flex-col items-center max-w-[80%] lg:max-w-[50%] text-center">
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

            {/* Join us */}
            <section className="py-12 w-full hidden lg:flex items-center justify-center">
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
