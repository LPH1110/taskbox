import React, { Fragment, useState, useRef, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import styles from './CreateBoardMenu.module.scss';
import CreateBoardForm from '../CreateBoardForm/';

const cx = classNames.bind(styles);

const CreateBoardMenu = ({ setBoards, setToast }) => {
    const [openModal, setOpenModal] = useState(false);
    const handleAddNewBoard = () => {
        setOpenModal((prev) => !prev);
    };

    return (
        <div className="flex items-center justify-center relative flex-col">
            <Menu as="div">
                <Menu.Button
                    onClick={handleAddNewBoard}
                    className="flex items-center gap-2 border border-sky-400 bg-sky-400/20 text-sky-400 font-semibold hover:text-sky-300 hover:border-sky-300 hover:bg-sky-400/10 ease-in-out duration-200 border-dashed cursor-pointer py-2 px-3 rounded-lg h-28 w-48 shadow-xl image-full"
                >
                    <span>
                        <PlusIcon className="w-5 h-5" />
                    </span>
                    Create new board
                </Menu.Button>
                <Transition
                    show={openModal}
                    as={Fragment}
                    enter="transition ease-out duration-400"
                    enterFrom="transform opacity-0"
                    enterTo="transform opacity-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100"
                    leaveTo="transform opacity-0"
                >
                    <Menu.Items className={cx('board_menu-items')}>
                        <CreateBoardForm setToast={setToast} setBoards={setBoards} setOpenModal={setOpenModal} />
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
};

export default CreateBoardMenu;
