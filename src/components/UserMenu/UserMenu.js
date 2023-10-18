import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Button, Spacer } from '~/components';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './UserMenu.module.scss';
import { UserAuth } from '~/contexts/AuthContext';
import { ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
const cx = classNames.bind(styles);

const UserMenu = ({ children }) => {
    const [openMenu, setOpenMenu] = useState(false);
    const menuRef = useRef();
    const { logOut, googleSignIn } = UserAuth();

    const handleClickOutside = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
            setOpenMenu(false);
        }
    };

    const handleSwitchAccount = async () => {
        try {
            await googleSignIn();
        } catch (error) {
            console.log(error);
        } finally {
            setOpenMenu(false);
            window.location.reload(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <Menu as="div" className="relative text-left inline-block">
            <Menu.Button onClick={() => setOpenMenu((prev) => !prev)}>{children}</Menu.Button>
            <Transition
                show={openMenu}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items
                    ref={menuRef}
                    className="min-w-[12rem] z-50 absolute right-0 mt-2 bg-white shadow-md rounded-xl p-4 flex flex-col"
                >
                    <Menu.Item>
                        <Link to="/profile" className={cx('menu-item')}>
                            My profile
                        </Link>
                    </Menu.Item>
                    <Menu.Item>
                        <Link className={cx('menu-item')} to="#">
                            Preferences
                        </Link>
                    </Menu.Item>
                    <Menu.Item>
                        <Link className={cx('menu-item')} to="#">
                            Settings
                        </Link>
                    </Menu.Item>
                    <Menu.Item>
                        <button onClick={handleSwitchAccount} className={cx('menu-item')} type="button">
                            Switch account
                        </button>
                    </Menu.Item>
                    <Spacer />
                    <Menu.Item>
                        <button onClick={logOut} className={cx('menu-item')} type="button">
                            <span>
                                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                            </span>
                            Sign out
                        </button>
                    </Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export default UserMenu;
