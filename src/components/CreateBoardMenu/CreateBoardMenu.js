import React, { Fragment, useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import styles from './CreateBoardMenu.module.scss';
import CreateBoardForm from '../CreateBoardForm/';

const cx = classNames.bind(styles);

const CreateBoardMenu = () => {
    const [openModal, setOpenModal] = useState(false);
    const [menuHeight, setMenuHeight] = useState(0);
    const handleWindowResize = (e) => {
        setMenuHeight(window.innerHeight - 100);
    };
    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    return (
        <div className="flex items-center justify-center relative z-10 flex-col">
            <Menu as="div">
                <Menu.Button
                    onClick={() => setOpenModal((prev) => !prev)}
                    className="flex items-center gap-2 border border-sky-400 bg-sky-400/20 text-sky-400 font-semibold hover:text-sky-300 hover:border-sky-300 hover:bg-sky-400/10 ease-in-out duration-200 border-dashed cursor-pointer py-2 px-3 rounded-lg h-24 shadow-xl image-full"
                >
                    <span>
                        <PlusIcon className="w-5 h-5" />
                    </span>
                    Create new board
                </Menu.Button>
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
                    <Menu.Items style={{ maxHeight: `${menuHeight}px` }} className={cx('board_menu-items')}>
                        <CreateBoardForm setOpenModal={setOpenModal} />
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
};

export default CreateBoardMenu;
