import React, { Fragment, useEffect, useRef, useState } from 'react';
import UserAvatar from '../UserAvatar';
import classNames from 'classnames/bind';
import styles from './Comment.module.scss';
import Spacer from '../Spacer';
import { Transition } from '@headlessui/react';
import Button from '../Button';
import { deleteComment, fetchComments, saveComment } from '~/lib/actions';
import RichTextEditor from '../RichTextEditor';
import { actions, useStore } from '~/store';
import { UserAuth } from '~/contexts/AuthContext';
const cx = classNames.bind(styles);

const Comment = ({ comment, admin }) => {
    const commentRef = useRef();
    const { user } = UserAuth();
    const [openConfirmDel, setOpenConfirmDel] = useState(false);
    const [openEditor, setOpenEditor] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [, dispatch] = useStore();

    useEffect(() => {
        const element = commentRef.current;
        if (element) {
            element.innerHTML = comment?.content;
        }
    }, [openEditor]);

    const handleDeleteComment = async (e) => {
        await deleteComment(comment.id);
        dispatch(actions.deleteCommentById(comment.id));
    };

    const handleReply = () => {
        console.log('Replying comment: ', comment?.email);
    };

    const getTimeElapsed = () => {
        const now = new Date();
        let diff;
        if (comment?.createdAt instanceof Date) {
            diff = now - comment?.createdAt;
        } else {
            diff = now - comment?.createdAt.toDate();
        }
        // convert to seconds
        let seconds = Math.floor(diff / 1000);

        // convert to minutes
        let minutes = Math.floor(seconds / 60);

        // convert to hours
        let hours = Math.floor(minutes / 60);

        if (seconds < 60) {
            return 'a few seconds ago';
        } else if (minutes < 60) {
            return `${minutes} minutes ago`;
        } else if (hours < 2) {
            return 'an hour ago';
        } else {
            return `${hours} hours ago`;
        }
    };

    const handleOnSave = async (data) => {
        console.log(data);
        const newComment = {
            ...comment,
            content: data,
        };
        await saveComment(newComment);
        dispatch(actions.addNewCommentToTask(newComment));
        setOpenEditor(false);
    };

    return (
        <div className="flex items-start gap-2">
            <UserAvatar photoURL={comment?.photoURL} />
            <div className="flex flex-col items-start w-full">
                <div className="flexStart gap-2">
                    <h4 className="font-semibold">{comment?.displayName}</h4>
                    <span className="text-sm text-description">{getTimeElapsed()}</span>
                </div>
                {openEditor ? (
                    <RichTextEditor
                        initial={comment?.content}
                        onSave={handleOnSave}
                        onClose={(e) => setOpenEditor(false)}
                    />
                ) : (
                    <>
                        <div ref={commentRef} className="rounded-md bg-slate-100 w-full py-2 px-4"></div>
                        <div className="flexStart gap-2">
                            {user?.email === comment?.email ? (
                                <button
                                    onClick={(e) => setOpenEditor(true)}
                                    className={cx('comment_action')}
                                    type="button"
                                >
                                    Edit
                                </button>
                            ) : (
                                <button onClick={handleReply} className={cx('comment_action')} type="button">
                                    Reply
                                </button>
                            )}
                            {admin && (
                                <div>
                                    <button
                                        onClick={() => {
                                            setOpenConfirmDel((prev) => !prev);
                                        }}
                                        type="button"
                                        className={cx('comment_action')}
                                    >
                                        Delete
                                    </button>
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
                                        <div className="w-[20rem] bg-slate-600 rounded-md fixed text-white p-4 flexCenter flex-col gap-2">
                                            <h4>Permanently delete?</h4>
                                            <Spacer />
                                            <p>
                                                All lists, cards and actions will be deleted, and you won't be able to
                                                re-open the board. There is no undo.
                                            </p>
                                            <Button
                                                size="small"
                                                onClick={handleDeleteComment}
                                                className="rounded-sm w-full p-2 bg-red-400 text-white hover:bg-red-400/80 ease duration-100"
                                            >
                                                {isLoading ? 'Deleting...' : 'Delete'}
                                            </Button>
                                        </div>
                                    </Transition>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Comment;
