import { Draggable } from 'react-beautiful-dnd';
import React from 'react';
import { ChatBubbleLeftEllipsisIcon, PaperClipIcon, PencilIcon, PlusSmallIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import styles from './Task.module.scss';
import { v4 as uuidv4 } from 'uuid';

const cx = classNames.bind(styles);

const members = [
    {
        id: uuidv4(),
        avatarURL: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar2_fssdbw.jpg',
    },
    {
        id: uuidv4(),
        avatarURL: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar4_n1nbbs.jpg',
    },
    {
        id: uuidv4(),
        avatarURL: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1670050964/taskbox-assets/avatar1_ilyzbz.jpg',
    },
    {
        id: uuidv4(),
        avatarURL: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar3_clufwp.jpg',
    },
];

const Task = ({ onClick, task, index }) => {
    return (
        <Draggable key={task?.id} draggableId={task?.id} index={index}>
            {(provided, snapshot) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    onClick={onClick}
                    className="shadow-md px-3 py-4 rounded-lg border border-nav-border bg-white ease duration-100 space-y-4"
                >
                    <div className="flexBetween">
                        <h4 className={cx('task_title')}>{task?.title}</h4>
                        <button type="button" className={cx('task_edit-btn')}>
                            <PencilIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <p className={cx('task_description')}>{task?.description}</p>
                    <div className="flexBetween">
                        {/* Members */}
                        <div className="flexStart">
                            <div className="avatar-group -space-x-3">
                                {members?.map((mem) => (
                                    <div className="avatar">
                                        <div key={mem?.id} className="w-5">
                                            <img src={mem?.avatarURL} alt="mem-avatar" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="hover:bg-slate-100/80 bg-slate-100 text-blue-500 rounded-full p-1"
                            >
                                <PlusSmallIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Task actions */}
                        <div className="flex items-center gap-2">
                            <button type="button" className={cx('task_action')}>
                                <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                                <p>25 comments</p>
                            </button>
                            <button type="button" className={cx('task_action')}>
                                <PaperClipIcon className="w-5 h-5" />
                                <p>5 files</p>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default Task;
