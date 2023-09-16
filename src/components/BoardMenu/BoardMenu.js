import { Menu, Transition } from '@headlessui/react';
import {
    ArchiveBoxIcon,
    ChevronLeftIcon,
    Cog6ToothIcon,
    DocumentDuplicateIcon,
    EnvelopeIcon,
    ExclamationCircleIcon,
    EyeIcon,
    MinusIcon,
    QueueListIcon,
    ShareIcon,
    TagIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import { Fragment, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Toast } from '~/components';
import { saveBoard } from '~/lib/actions';
import Spacer from '../Spacer/Spacer';
import AboutMenu from './AboutMenu';
import ActivityMenu from './ActivityMenu';
import ArchivedMenu from './ArchivedMenu';
import styles from './BoardMenu.module.scss';
import ChangeBackgroundMenu from './ChangeBackgroundMenu';
import SettingsMenu from './SettingsMenu';

const cx = classNames.bind(styles);

const MenuList = ({ data, setCurrentMenu }) => {
    const handleClick = (item) => {
        if (item?.path) {
            setCurrentMenu((prev) => [...prev, { title: item?.title, path: item?.path }]);
        } else if (item?.onClick) {
            item.onClick();
        }
    };
    return (
        <>
            {data.map((item) => (
                <Fragment key={item?.id}>
                    <Menu.Item className={cx('board_menu-item')}>
                        <button className="items-start w-full" onClick={() => handleClick(item)}>
                            {item?.thumbnailURL ? (
                                <div
                                    style={{ backgroundImage: `url(${item.thumbnailURL})` }}
                                    className="w-5 h-5 image rounded-sm"
                                />
                            ) : (
                                <span>{item?.icon}</span>
                            )}
                            <div className="text-left">
                                <h4>{item.title}</h4>
                                {item?.description && <p className="text-sm text-description">{item.description}</p>}
                            </div>
                        </button>
                    </Menu.Item>
                    {item?.bottomSpacer && <Spacer />}
                </Fragment>
            ))}
        </>
    );
};

const BoardMenu = ({ setToast, setBoard, children, setBoards }) => {
    const [openModal, setOpenModal] = useState(false);
    const [timeoutId, setTimeoutId] = useState();
    const [currentMenu, setCurrentMenu] = useState([
        {
            title: 'Menu',
            path: '/',
        },
    ]);

    const [boardMenu] = useState([
        {
            id: uuidv4(),
            title: 'About this board',
            path: '/about',
            description: 'Add description to your board',
            icon: <ExclamationCircleIcon className="w-5 h-5" />,
        },

        {
            id: uuidv4(),
            title: 'Activity',
            path: '/activities',
            icon: <QueueListIcon className="w-5 h-5" />,
        },
        {
            id: uuidv4(),
            title: 'Archived items',
            path: '/archived',
            icon: <ArchiveBoxIcon className="w-5 h-5" />,
            bottomSpacer: true,
        },
        {
            id: uuidv4(),
            title: 'Settings',
            path: '/settings',
            icon: <Cog6ToothIcon className="w-5 h-5" />,
        },
        {
            id: uuidv4(),
            title: 'Labels',
            icon: <TagIcon className="w-5 h-5" />,
            bottomSpacer: true,
        },
        {
            id: uuidv4(),
            title: 'Watch',
            icon: <EyeIcon className="w-5 h-5" />,
        },
        {
            id: uuidv4(),
            title: 'Copy board',
            icon: <DocumentDuplicateIcon className="w-5 h-5" />,
        },
        {
            id: uuidv4(),
            title: 'Email-to-board',
            icon: <EnvelopeIcon className="w-5 h-5" />,
        },
        {
            id: uuidv4(),
            title: 'Print, export, and share',
            icon: <ShareIcon className="w-5 h-5" />,
        },
        {
            id: uuidv4(),
            title: 'Close board',
            icon: <MinusIcon className="w-5 h-5" />,
            onClick() {
                setBoard((prev) => {
                    const newBoard = {
                        ...prev,
                        deletedAt: new Date().toString(),
                    };
                    const boardId = prev.id;
                    saveBoard(boardId, newBoard);
                    return newBoard;
                });
                setToast({
                    show: true,
                    body: {
                        message: 'This board has been temporarily deleted.',
                        status: 'error',
                    },
                });
                setTimeoutId(
                    setTimeout(() => {
                        setToast((prev) => ({ ...prev, show: false }));
                    }, 3000),
                );
            },
        },
    ]);

    const [toast] = useState({
        body: {
            message: '',
            status: '',
        },
        show: false,
    });

    const renderMenu = () => {
        switch (currentMenu[currentMenu.length - 1]?.path) {
            case '/about':
                return <AboutMenu setCurrentMenu={setCurrentMenu} />;
            case '/settings':
                return <SettingsMenu />;
            case '/activities':
                return <ActivityMenu />;
            case '/archived':
                return <ArchivedMenu />;
            case '/change-background':
                return <ChangeBackgroundMenu />;
            default:
                return <MenuList data={boardMenu} setCurrentMenu={setCurrentMenu} />;
        }
    };

    const handleBackMenu = () => {
        setCurrentMenu((prev) => {
            if (prev.length > 1) {
                const last = prev[prev.length - 1];
                const newState = prev.filter((menu) => menu?.path !== last?.path);
                return newState;
            } else {
                return prev;
            }
        });
    };

    useEffect(() => {
        return () => {
            clearTimeout(timeoutId);
        };
    }, [timeoutId]);

    return (
        <div className="flex items-center justify-center relative z-10 flex-col">
            <Menu as="div" className="">
                <Menu.Button onClick={() => setOpenModal((prev) => !prev)}>{children}</Menu.Button>
                <Transition
                    show={openModal}
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className={cx('board_menu-items')}>
                        {currentMenu[currentMenu.length - 1].path !== '/' && (
                            <button
                                onClick={handleBackMenu}
                                type="button"
                                className="absolute left-4 hover:text-slate-500 ease duration-100"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={() => setOpenModal(false)}
                            type="button"
                            className="absolute right-4 hover:text-slate-500 ease duration-100"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                        <h4 className="font-semibold w-full text-center">
                            {currentMenu[currentMenu.length - 1].title}
                        </h4>
                        <Spacer />
                        <div className="flex flex-col items-start w-full">{renderMenu()}</div>
                    </Menu.Items>
                </Transition>
            </Menu>
            {toast.show && <Toast message={toast.body.message} status={toast.body.status} />}
        </div>
    );
};

export default BoardMenu;
