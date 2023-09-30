import { Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useRef } from 'react';
import Spacer from '../Spacer';
import Button from '../Button';

const DelConfirmPopper = ({ children, handleDelete, isLoading, openConfirmDel, setOpenConfirmDel }) => {
    const popperRef = useRef();

    const handleClickOutside = (e) => {
        console.log('click');
        if (popperRef.current && !popperRef.current.contains(e.target)) {
            setOpenConfirmDel(false);
        }
    };

    useEffect(() => {
        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative">
            {children}
            <Transition
                show={openConfirmDel}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <div
                    ref={popperRef}
                    className="min-w-[20rem] bg-slate-600 rounded-md absolute top-[120%] text-white p-4 flexCenter flex-col gap-2"
                >
                    <h4>Permanently delete?</h4>
                    <Spacer />
                    <p>
                        All lists, cards and actions will be deleted, and you won't be able to re-open the board. There
                        is no undo.
                    </p>
                    <Button
                        size="small"
                        onClick={handleDelete}
                        className="rounded-sm w-full p-2 bg-red-400 text-white hover:bg-red-400/80 ease duration-100"
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </Transition>
        </div>
    );
};

export default DelConfirmPopper;
