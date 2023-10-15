import { Transition } from '@headlessui/react';

import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Fragment, useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button, UserAvatar, UserMenu } from '~/components';
import { UserAuth } from '~/contexts/AuthContext';
import TabPopper from './TabPopper';

function Header() {
    const { user } = UserAuth();
    const navigate = useNavigate();
    const headerRef = useRef();
    const tabPopper = useRef();
    const [currentTab, setCurrentTab] = useState('');
    const [openTab, setOpenTab] = useState(false);

    const getStarted = () => {
        if (user) {
            navigate('/workspaces');
        } else {
            navigate('/signin');
        }
    };

    useEffect(() => {
        const handleWindowScroll = (e) => {
            if (window.scrollY > 20) {
                headerRef.current.classList.add('shadow-lg');
            } else {
                headerRef.current.classList.remove('shadow-lg');
            }
        };

        const handleOnClickOutside = (e) => {
            if (!headerRef.current?.contains(e.target)) {
                setOpenTab(false);
            }
        };

        window.addEventListener('scroll', handleWindowScroll);
        window.addEventListener('click', handleOnClickOutside);
        return () => {
            window.removeEventListener('scroll', handleWindowScroll);
            window.removeEventListener('click', handleOnClickOutside);
        };
    }, []);

    const handleOnClickTab = (key) => {
        if (openTab && key.localeCompare(currentTab) !== 0) {
            // tab is open
            setCurrentTab(key); // tab still open, content changed
        } else if (openTab && key.localeCompare(currentTab) === 0) {
            setOpenTab(false);
        } else {
            setCurrentTab(key);
            setOpenTab(true);
        }
    };

    const tabIsActive = (tabName) => {
        return openTab && currentTab.localeCompare(tabName) === 0;
    };

    return (
        <header
            ref={headerRef}
            className="ease-in-out z-[10000] duration-300 bg-white fixed top-0 inset-x-0 border-b border-slate-200 h-20 col-span-12 px-12 flex items-center justify-between"
        >
            <div className="flex items-center">
                <Button size="small" href="/" className="flex mr-2">
                    <span className="font-semibold text-4xl text-blue-600">T</span>
                    <p className="text-xl">askbox</p>
                </Button>
                {/* Tabs */}
                <div className="hidden lg:flex items-center">
                    <Button
                        size="small"
                        className={
                            tabIsActive('features')
                                ? 'text-blue-500'
                                : 'text-slate-500 hover:text-blue-500 ease duration-200'
                        }
                        rightIcon={
                            <ChevronDownIcon
                                className={
                                    tabIsActive('features') ? 'w-4 h-4 rotate-180 ease-out duration-100' : 'w-4 h-4'
                                }
                            />
                        }
                        onMouseDown={() => handleOnClickTab('features')}
                    >
                        Features
                    </Button>
                    <Button
                        size="small"
                        className={
                            tabIsActive('solutions')
                                ? `text-blue-500`
                                : `text-slate-500 hover:text-blue-500 ease duration-200`
                        }
                        rightIcon={
                            <ChevronDownIcon
                                className={
                                    tabIsActive('solutions') ? 'w-4 h-4 rotate-180 ease-out duration-100' : 'w-4 h-4'
                                }
                            />
                        }
                        onMouseDown={() => handleOnClickTab('solutions')}
                    >
                        Solutions
                    </Button>
                    <Button
                        size="small"
                        className={
                            tabIsActive('resources')
                                ? 'text-blue-500'
                                : 'text-slate-500 hover:text-blue-500 ease duration-200'
                        }
                        rightIcon={
                            <ChevronDownIcon
                                className={
                                    tabIsActive('resources') ? 'w-4 h-4 rotate-180 ease-out duration-100' : 'w-4 h-4'
                                }
                            />
                        }
                        onMouseDown={() => handleOnClickTab('resources')}
                    >
                        Resources
                    </Button>
                    <Button size="small" onMouseDown={() => setOpenTab(false)}>
                        <NavLink
                            className={({ isActive }) =>
                                isActive ? 'text-blue-500' : 'text-slate-500 hover:text-blue-500 ease duration-200'
                            }
                            to="/pricing"
                        >
                            Pricing
                        </NavLink>
                    </Button>
                </div>
            </div>
            <div className="flex items-center">
                {user ? (
                    <>
                        <h4 className="text-slate-700 mr-2 font-semibold hidden lg:block">
                            Hi, {user?.displayName || 'taskboxer'}
                        </h4>
                        <UserMenu>
                            <UserAvatar width="w-10" />
                        </UserMenu>
                    </>
                ) : (
                    <>
                        <Button
                            to="/signin"
                            className="text-slate-700 hover:text-blue-500 font-semibold ease-in-out duration-200"
                            size="small"
                        >
                            Login
                        </Button>
                        <Button
                            size="medium"
                            type="button"
                            onClick={getStarted}
                            className="bg-blue-500 font-semibold text-white hover:bg-blue-400 ease-in-out duration-200"
                        >
                            Get Started
                        </Button>
                    </>
                )}
            </div>
            <Transition
                show={openTab}
                as={Fragment}
                enter="transition ease duration-200"
                enterFrom="transform opacity-0"
                enterTo="transform opacity-100"
                leave="transition ease duration-200"
                leaveFrom="transform opacity-100"
                leaveTo="transform opacity-0"
            >
                <TabPopper ref={tabPopper} currentTab={currentTab} />
            </Transition>
        </header>
    );
}

export default Header;
