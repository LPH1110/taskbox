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
        <section className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Landing content */}
            <section className="flex flex-col items-center md:items-start gap-6 p-12 h-full justify-center text-center md:text-left">
                <div className="flex items-center text-blue-500 py-2 px-3 rounded-full bg-blue-100/50">
                    <span className="mr-1">
                        <BoltIcon className="w-4 h-4" />
                    </span>
                    <p className="font-semibold text-sm">CREATE FOR FAST</p>
                </div>
                <h1 className="font-bold text-6xl">
                    A simple, efficient <br />
                    and easy way to collaborate
                </h1>
                <p className="text-description text-lg">
                    We help to connect, manage and organize your work with everyone <br />
                    so the team can deliver a better product - accompish it all with Taskbox.
                </p>
                <div className="w-full flex items-center justify-center md:justify-start">
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
            <div
                style={{
                    backgroundImage:
                        'url(https://res.cloudinary.com/dzzv49yec/image/upload/v1698082215/20224730_6272293_bo1tji.svg)',
                }}
                className="image-contain-full"
            ></div>
        </section>
    );
}

export default Home;
