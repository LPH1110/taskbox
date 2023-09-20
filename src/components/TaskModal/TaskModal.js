import { Dialog, Transition } from '@headlessui/react';
import {
    Bars3BottomLeftIcon,
    ClockIcon,
    EllipsisHorizontalCircleIcon,
    EllipsisHorizontalIcon,
    PaperClipIcon,
    PencilIcon,
    ShareIcon,
    TagIcon,
    UserGroupIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import UserAvatar from '../UserAvatar';
import RichTextEditor from '../RichTextEditor';
import { saveTask } from '~/lib/actions';

const TaskModal = ({ setToast, openTaskModal, task, setOpenTaskModal, children }) => {
    const [description, setDescription] = useState('<p>Hello from CKEditor&nbsp;5!</p><br/><br/>');
    const [attachs, setAttachs] = useState([]);
    const [timeoutId, setTimeoutId] = useState();
    const [openDescEditor, setOpenDescEditor] = useState(false);

    console.log(description);

    const descRef = useRef();

    const handleSaveDesc = () => {
        const newTask = {
            ...task,
            description: description,
        };

        console.log('new task: ', newTask);
        console.log(descRef);
        // const savedResult = await saveTask(task.id, newTask);
        // if (savedResult.status === 200) {
        //     setToast({
        //         show: true,
        //         body: {
        //             message: savedResult.message,
        //             status: 'success',
        //         },
        //     });
        // } else {
        //     setToast({
        //         show: true,
        //         body: {
        //             message: savedResult.message,
        //             status: 'error',
        //         },
        //     });
        // }
        // setTimeoutId(
        //     setTimeout(() => {
        //         setToast((prev) => ({ ...prev, show: false }));
        //     }, 2000),
        // );
    };

    useEffect(() => {
        return () => clearTimeout(timeoutId);
    }, [timeoutId]);
    return (
        <>
            {children}
            <Transition appear show={openTaskModal} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setOpenTaskModal(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all space-y-6">
                                    <div className="flexBetween">
                                        <Dialog.Title as="h3" className="modal-label">
                                            {task?.title}
                                        </Dialog.Title>
                                        <div className="flexBetween gap-3">
                                            <button type="button">
                                                <ShareIcon className="w-4 h-4" />
                                            </button>
                                            <button type="button">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button type="button">
                                                <EllipsisHorizontalIcon className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => setOpenTaskModal(false)}>
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Status */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <TagIcon className="w-5 h-5" />
                                                <h4>Labels</h4>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-slate-700">Mobile App</p>
                                                <button
                                                    type="button"
                                                    className="flex gap-2 items-center py-1 px-2 hover:bg-blue-200 ease duration-200 bg-blue-100 text-blue-500 rounded-full"
                                                >
                                                    <span>
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </span>
                                                    <p>Labels</p>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <UsersIcon className="w-5 h-5" />
                                                <h4>Assignee</h4>
                                            </div>
                                            <p className="text-slate-700">Mobile App</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <ClockIcon className="w-5 h-5" />
                                                <h4>Timeline</h4>
                                            </div>
                                            <p className="text-slate-700">April 12, 2022</p>
                                        </div>
                                    </div>
                                    {/* Description */}
                                    <div className="flex gap-2">
                                        <span>
                                            <Bars3BottomLeftIcon className="w-5 h-5" />
                                        </span>
                                        <div className="space-y-3 w-full pr-6">
                                            <h4 className="modal-label">Description</h4>

                                            {openDescEditor ? (
                                                <div className="space-y-2">
                                                    <RichTextEditor value={description} setValue={setDescription} />

                                                    <div className="flexStart gap-1">
                                                        <button
                                                            onClick={handleSaveDesc}
                                                            type="button"
                                                            className="py-1 px-3 rounded-sm bg-blue-400 text-white hover:bg-blue-400/80 ease duration-200"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setOpenDescEditor(false)}
                                                            type="button"
                                                            className="py-1 px-3 rounded-sm hover:bg-slate-100 ease duration-200"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    ref={descRef}
                                                    onClick={(e) => setOpenDescEditor(true)}
                                                    className="text-description bg-slate-50 rounded-md w-full p-4 hover:bg-slate-100 ease duration-200"
                                                >
                                                    {task?.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Attachements */}
                                    <div className="flex gap-2 items-start">
                                        <span>
                                            <PaperClipIcon className="w-5 h-5" />
                                        </span>
                                        <div className="w-full">
                                            <div className="flexBetween w-full">
                                                <div className="relative w-full">
                                                    <h4 className="modal-label">Attachements</h4>
                                                    <button
                                                        type="button"
                                                        className="absolute right-0 top-0 py-1 px-3 rounded-md border border-slate-300 hover:bg-slate-100 ease duration-200"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                            <div>{/* <p>Attachs</p> */}</div>
                                        </div>
                                    </div>
                                    {/* Comments */}
                                    <div className="flex gap-1 pr-6">
                                        <UserAvatar />
                                        <input
                                            className="px-2 py-1 rounded-md bg-slate-50 w-full hover:bg-slate-100 ease duration-200 ring-2 ring-transparent focus:ring-blue-400 "
                                            name="task-comment"
                                            placeholder="Write a comment..."
                                        />
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default TaskModal;
