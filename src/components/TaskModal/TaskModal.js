import { Dialog, Transition } from '@headlessui/react';
import {
    Bars3BottomLeftIcon,
    ClockIcon,
    EllipsisHorizontalIcon,
    PaperClipIcon,
    PencilIcon,
    ShareIcon,
    TagIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Fragment, useEffect, useRef, useState } from 'react';
import { UserAuth } from '~/contexts/AuthContext';
import { createComment, fetchComments, saveTask } from '~/lib/actions';
import { actions, useStore } from '~/store';
import Comment from '../Comment';
import RichTextEditor from '../RichTextEditor';
import UserAvatar from '../UserAvatar';

const Description = ({ setOpenCommentEditor, description, setOpenDescEditor }) => {
    const descriptionRef = useRef();

    useEffect(() => {
        const descElement = descriptionRef.current;
        if (descElement && description) {
            descElement.innerHTML = description;
        } else {
            descElement.innerText = 'Click to edit the description for this task';
        }
    }, []);

    return (
        <div
            ref={descriptionRef}
            onClick={(e) => {
                setOpenDescEditor(true);
                setOpenCommentEditor(false);
            }}
            className="text-description bg-slate-50 rounded-md w-full p-4 hover:bg-slate-100 ease duration-200"
        ></div>
    );
};

const TaskModal = ({ setToast, openTaskModal, setOpenTaskModal }) => {
    const { user } = UserAuth();
    const [comments, setComments] = useState([]);
    const [timeoutId, setTimeoutId] = useState();
    const [openDescEditor, setOpenDescEditor] = useState(false);
    const [openCommentEditor, setOpenCommentEditor] = useState(false);
    const [, dispatch] = useStore();

    const descRef = useRef();

    const handleSaveDesc = async (data) => {
        const newTask = {
            ...openTaskModal.task,
            description: data,
        };

        // insert description to placeholder

        if (descRef?.current) {
            descRef.current.innerHTML = data;
        }

        setOpenDescEditor(false);
        setOpenTaskModal((prev) => ({ ...prev, task: newTask }));
        dispatch(actions.updateTaskById(newTask));
        //Saved to state -> re-render
        // Saved to db
        const savedResult = await saveTask(newTask);
        if (savedResult.status === 200) {
            setToast({
                show: true,
                body: {
                    message: savedResult.message,
                    status: 'success',
                },
            });
        } else {
            setToast({
                show: true,
                body: {
                    message: savedResult.message,
                    status: 'error',
                },
            });
        }
        setTimeoutId(
            setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
            }, 2000),
        );
    };

    const handleSaveComment = async (data) => {
        console.log(data);
        const comment = {
            content: data,
            userId: user?.uid,
            photoURL: user?.photoURL,
            displayName: user?.displayName,
            taskId: openTaskModal.task.id,
            createdAt: new Date(),
        };

        const result = await createComment(comment);
        if (result.status === 200) {
            setToast({
                show: true,
                body: {
                    message: result.message,
                    status: 'success',
                },
            });

            const res = await fetchComments(openTaskModal.task.id);
            setComments(res || []);

            setOpenCommentEditor(false);
            setTimeoutId(
                setTimeout(() => {
                    setToast((prev) => ({ ...prev, show: false }));
                }, 2000),
            );
        }
    };

    useEffect(() => {
        if (openTaskModal.task.id) {
            const getComments = async () => {
                const result = await fetchComments(openTaskModal.task.id);
                setComments(result || []);
            };

            getComments();
        }
    }, [openTaskModal.task]);

    useEffect(() => {
        return () => clearTimeout(timeoutId);
    }, [timeoutId]);

    return (
        <Transition show={openTaskModal.show} as={Fragment}>
            <Dialog onClose={() => setOpenTaskModal({ show: false, task: {} })} as="div" className="relative z-10">
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
                            <Dialog.Panel className="w-full max-w-3xl transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all space-y-6">
                                <div className="flexBetween">
                                    <Dialog.Title as="h3" className="modal-label">
                                        {openTaskModal.task?.title}
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
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenTaskModal({
                                                    show: false,
                                                    task: {},
                                                })
                                            }
                                        >
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
                                    <div className="space-y-3 w-full">
                                        <h4 className="modal-label">Description</h4>

                                        {openDescEditor ? (
                                            <RichTextEditor
                                                initial={openTaskModal.task.description}
                                                openDescEditor={openDescEditor}
                                                onSave={handleSaveDesc}
                                                onClose={(e) => setOpenDescEditor(false)}
                                            />
                                        ) : (
                                            <Description
                                                description={openTaskModal.task.description}
                                                setOpenDescEditor={setOpenDescEditor}
                                                setOpenCommentEditor={setOpenCommentEditor}
                                            />
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
                                <div className="space-y-6">
                                    <div className="flex gap-2">
                                        <div>
                                            <UserAvatar />
                                        </div>
                                        {openCommentEditor ? (
                                            <RichTextEditor
                                                openCommentEditor={openCommentEditor}
                                                onSave={handleSaveComment}
                                                onClose={(e) => setOpenCommentEditor(false)}
                                            />
                                        ) : (
                                            <div
                                                onClick={() => {
                                                    setOpenCommentEditor(true);
                                                    setOpenDescEditor(false);
                                                }}
                                                className="flex items-center justify-start px-4 rounded-md bg-slate-50 w-full hover:bg-slate-100 ease duration-200"
                                            >
                                                <p className="text-description">Add a comments...</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {comments.map((comment) => (
                                            <Comment setComments={setComments} key={comment.id} comment={comment} />
                                        ))}
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default TaskModal;
