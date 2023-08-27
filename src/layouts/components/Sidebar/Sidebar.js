import {
    ArrowPathRoundedSquareIcon,
    Bars3Icon,
    CalendarDaysIcon,
    ChatBubbleOvalLeftIcon,
    ClipboardDocumentIcon,
    Squares2X2Icon,
    XMarkIcon,
    ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from './Sidebar.module.scss';

import { Tooltip } from '~/components';

const cx = classNames.bind(styles);

const menuItems = [
    {
        id: uuidv4(),
        title: 'Overview',
        icon: <Squares2X2Icon className="w-5 h-5" />,
        path: '/overview',
    },
    {
        id: uuidv4(),
        title: 'Workspaces',
        icon: <ClipboardDocumentIcon className="w-5 h-5" />,
        path: '/workspaces',
    },
    {
        id: uuidv4(),
        title: 'Inbox',
        icon: <ChatBubbleOvalLeftIcon className="w-5 h-5" />,
        path: '/inbox',
    },
    {
        id: uuidv4(),
        title: 'Meeting',
        icon: <CalendarDaysIcon className="w-5 h-5" />,
        path: '/meeting',
    },
    {
        id: uuidv4(),
        title: 'Issues',
        icon: <ArrowPathRoundedSquareIcon className="w-5 h-5" />,
        path: '/issues',
    },
];

function Sidebar() {
    const [menu, setMenu] = useState(menuItems);
    const [openMenu, setOpenMenu] = useState(false);

    const handleOpenMenu = () => {
        setOpenMenu((prev) => !prev);
    };

    return (
        <section className={`gap-6 h-full flex flex-col justify-start ${!openMenu ? 'items-center' : 'items-start'}`}>
            <div className="py-2 px-6 flex items-center justify-between w-full">
                <button
                    className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-200 bg-slate-100 ease-in-out duration-200"
                    type="button"
                    onClick={handleOpenMenu}
                >
                    {openMenu ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
                </button>
                {openMenu && (
                    <Tooltip placement="right-end" message={'Back to homepage'}>
                        <NavLink
                            className="flex items-center justify-end text-slate-300 hover:text-slate-600 ease duration-200"
                            to="/"
                        >
                            <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                        </NavLink>
                    </Tooltip>
                )}
            </div>
            <div className="flex flex-col items-center justify-center">
                {menu.map((item) => (
                    <Tooltip placement="right-end" message={item.title} key={item.id}>
                        <NavLink
                            className={({ isActive }) => {
                                const classes = isActive
                                    ? cx('menuItem', 'relative py-4 px-6 text-blue-600 bg-blue-50')
                                    : cx(
                                          'menuItem',
                                          'relative py-4 px-6 hover:bg-blue-50 ease duration-200 hover:after:block',
                                      );
                                return classes + ' outline-0 flex gap-3 items-center justify-start w-full rounded-lg';
                            }}
                            to={item.path}
                        >
                            {item.icon}
                            {item.path === '/inbox' && (
                                <span
                                    className={`absolute ${
                                        openMenu ? 'top-1/2 -translate-y-1/2 right-1' : 'top-0 right-0'
                                    } rounded-full py-0.5 px-2 bg-red-500 text-sm text-white`}
                                >
                                    39
                                </span>
                            )}
                            {openMenu && item?.title}
                        </NavLink>
                    </Tooltip>
                ))}
            </div>
        </section>
    );
}

export default Sidebar;
