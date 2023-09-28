import { Draggable } from 'react-beautiful-dnd';
import React, { useEffect, useRef, useState } from 'react';
import { ChatBubbleLeftEllipsisIcon, PaperClipIcon, PencilIcon, PlusSmallIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import styles from './TaskListItem.module.scss';
import { v4 as uuidv4 } from 'uuid';
import { countCommentsByTaskId } from '~/lib/actions';
import { useStore } from '~/store';
import { countComments } from '~/lib/helpers';

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

const TaskListItem = ({ onClick, task, index }) => {
    const [state] = useStore();
    const { comments } = state;
    const descRef = useRef();

    useEffect(() => {
        const descElement = descRef.current;
        if (descElement) {
            descElement.innerHTML = task?.description;
        }
    }, []);

    return (
        <Draggable key={task?.id} draggableId={task?.id} index={index}>
            {(provided, snapshot) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    onClick={onClick}
                    className="shadow-md px-4 py-6 rounded-lg border border-nav-border bg-white ease duration-100 space-y-4"
                >
                    <div className="flexAround gap-4">
                        {/* Task title */}
                        <h4 className={cx('task_title')}>{task?.title}</h4>
                        {/* Task description */}
                        <p ref={descRef} className={cx('task_description')}>
                            {task?.description}
                        </p>
                        {/* Task members */}
                        <div className="flexCenter">
                            <div className="avatar-group -space-x-3">
                                {members?.map((mem) => (
                                    <div className="avatar">
                                        <div key={mem?.id} className="w-6">
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
                        <div className="flex items-center gap-12">
                            <button type="button" className={cx('task_action')}>
                                <p>
                                    {countComments({ list: comments, opt: { key: 'taskId', value: task.id } })} comments
                                </p>
                            </button>
                            <button type="button" className={cx('task_action')}>
                                <p>5 files</p>
                            </button>
                        </div>
                        {/* Edit Task */}
                        <button type="button" className={cx('task_edit-btn')}>
                            <PencilIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default TaskListItem;
