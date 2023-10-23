import { Bars3Icon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React, { Fragment, useState } from 'react';
import UserMenu from '../UserMenu';
import UserAvatar from '../UserAvatar';
import classNames from 'classnames/bind';
import styles from './MobileHeadBar.module.scss';
import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { menuItems } from '~/constants';
import { NavLink } from 'react-router-dom';
const cx = classNames.bind(styles);

const MobileHeadBar = () => {
    const [isShowing, setIsShowing] = useState(false);
    return (
        <header className="relative bg-white px-6 flex md:hidden items-center justify-between gap-5 w-full">
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
                enter="all ease duration-200"
                enterFrom="-left-full opacity-0"
                enterTo="left-0 opacity-100"
                leave="all ease duration-200"
                leaveFrom="left-0 opacity-100"
                leaveTo="-left-full opacity-0"
            >
                <div className="min-w-[12rem] shadow-lg h-screen z-50 bg-white rounded-md absolute py-4 px-2 top-0 space-y-4">
                    <div className="flex items-center justify-end">
                        <button type="button" onClick={() => setIsShowing(false)}>
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2">
                        {menuItems.map((item) => (
                            <NavLink
                                className={({ isActive }) => {
                                    const classes = isActive
                                        ? cx('menuItem', 'relative py-4 px-6 text-blue-600 bg-blue-50')
                                        : cx(
                                              'menuItem',
                                              'relative py-4 px-6 hover:bg-blue-50 ease duration-200 hover:after:block',
                                          );
                                    return (
                                        classes + ' outline-0 flex gap-3 items-center justify-start w-full rounded-lg'
                                    );
                                }}
                                to={item.path}
                            >
                                {item.icon}
                                {item.path === '/inbox' && (
                                    <span
                                        className={`absolute ${
                                            isShowing ? 'top-1/2 -translate-y-1/2 right-1' : 'top-0 right-0'
                                        } rounded-full py-0.5 px-2 bg-red-500 text-sm text-white`}
                                    >
                                        39
                                    </span>
                                )}
                                {isShowing && item?.title}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </Transition>
        </header>
    );
};

export default MobileHeadBar;
