import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import styles from './CreateBoardMenu.module.scss';
import CreateBoardForm from '../CreateBoardForm/';
import { set } from 'date-fns';

const cx = classNames.bind(styles);

const CreateBoardMenu = ({ setBoards, setToast }) => {
    const [openModal, setOpenModal] = useState(false);
    const [menuHeight, setMenuHeight] = useState(window.innerHeight - 20);

    const popperRef = useRef();

    const handleWindowResize = (e) => {
        setMenuHeight(window.innerHeight - 20);
    };

    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    return (
        <div className="flex items-center justify-center relative z-10 flex-col">
            <Menu as="div" className="w-full h-full">
                <Menu.Button
                    onClick={() => setOpenModal((prev) => !prev)}
                    className="w-full h-full min-h-[12rem] flexCenter gap-2 border border-dashed hover:bg-white/60 bg-white/20 ease duration-100 rounded-xl font-semibold"
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
                    <Menu.Items
                        ref={popperRef}
                        style={{
                            maxHeight: `${menuHeight}px`,
                        }}
                        className={cx('board_menu-items')}
                    >
                        <CreateBoardForm setToast={setToast} setOpenModal={setOpenModal} />
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
};

export default CreateBoardMenu;
