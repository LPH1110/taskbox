import { Bars3Icon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React, { Fragment, useState } from 'react';
import UserMenu from '../UserMenu';
import UserAvatar from '../UserAvatar';
import classNames from 'classnames/bind';
import styles from './MobileHeadBar.module.scss';
import { Transition } from '@headlessui/react';
const cx = classNames.bind(styles);

const MobileHeadBar = () => {
    const [isShowing, setIsShowing] = useState(false);
    return (
        <div className="relative bg-white px-6 flex md:hidden items-center justify-between gap-5 w-full">
            <button onClick={(e) => setIsShowing((prev) => !prev)} type="button" className={cx('head_action')}>
                <Bars3Icon className="w-6 h-6" />
            </button>
            <button type="button" className={cx('head_action')}>
                <MagnifyingGlassIcon className="w-6 h-6" />
            </button>
            <button type="button" className={cx('head_action')}>
                <BellIcon className="w-6 h-6" />
            </button>
            {/* Avatar menu */}
            <UserMenu>
                <div className="hover:bg-slate-100 p-1 ease-in-out duration-200 rounded-full flex items-center">
                    <UserAvatar width="w-9" />
                </div>
            </UserMenu>
            <Transition
                as={Fragment}
                show={isShowing}
                enter="all ease duration-75"
                enterFrom="-left-full opacity-0"
                enterTo="left-0 opacity-100"
                leave="all ease duration-150"
                leaveFrom="left-0 opacity-100"
                leaveTo="-left-full opacity-0"
            >
                <div className="h-46 bg-blue-100 rounded-md absolute">Menu</div>
            </Transition>
        </div>
    );
};

export default MobileHeadBar;
