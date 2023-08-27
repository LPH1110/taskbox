import React from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Button from '../Button';
import Comments from './Comments';
import classNames from 'classnames/bind';
import styles from './TaskDetail.module.scss';
import WritingSection from './WritingSection';
import { useStore } from '~/store';

const cx = classNames.bind(styles);

const avatars = [
    {
        id: uuidv4(),
        thumbnail: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar2_fssdbw.jpg',
    },
    {
        id: uuidv4(),
        thumbnail: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar4_n1nbbs.jpg',
    },
    {
        id: uuidv4(),
        thumbnail: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar3_clufwp.jpg',
    },
    {
        id: uuidv4(),
        thumbnail: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1670050964/taskbox-assets/avatar1_ilyzbz.jpg',
    },
];

function TaskDetail({ data }) {
    const [taskTitle, setTaskTitle] = useState(data.title);
    const [state, dispatch] = useStore();
    const { comments } = state;

    return (
        <div>
            <input type="checkbox" id={`task_${data.id}`} className="modal-toggle" />
            <label htmlFor={`task_${data.id}`} className="modal">
                <div
                    onClick={(e) => e.preventDefault()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="modal-box w-11/12 overflow-y-hidden max-w-5xl h-[80%] relative z-[10000]"
                >
                    <div className="h-full grid grid-cols-2 gap-x-4">
                        {/* Left col */}
                        <section className="flex flex-col justify-between">
                            {/* Heading */}
                            <section className="flex items-center">
                                <input
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    className="caret-blue-500 ease duration-200 outline-none ring ring-transparent rounded-md p-1 -m-1 hover:ring-blue-400 focus:ring-blue-400 font-semibold text-xl"
                                    value={taskTitle}
                                />
                            </section>
                            {/* Table */}
                            <section>
                                <table className="w-full">
                                    <tbody>
                                        <tr>
                                            <th className="py-2 text-left font-normal">Due Date</th>
                                            <td className="py-2 flex items-center font-semibold">
                                                <span className="mr-2 text-red-300">
                                                    <CalendarIcon className="w-5 h-5" />
                                                </span>
                                                <p className="text-red-400">13 Jun - 15 Auguest</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="py-2 text-left font-normal">Status</th>
                                            <td className="py-2">
                                                <Button
                                                    rightIcon={<ChevronDownIcon className="w-4 h-4" />}
                                                    size="small"
                                                    className="rounded-full font-semibold bg-blue-100/50 text-blue-500"
                                                >
                                                    On Review
                                                </Button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="py-2 text-left font-normal">Priority</th>
                                            <td className="py-2">
                                                <Button
                                                    rightIcon={<ChevronDownIcon className="w-4 h-4" />}
                                                    size="small"
                                                    className="rounded-full font-semibold bg-yellow-300/50 text-slate-700"
                                                >
                                                    Normal
                                                </Button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="py-2 text-left font-normal">Collaborators</th>
                                            <td className="py-2">
                                                <Button type="button" className="mr-3">
                                                    <div className="avatar-group -space-x-4">
                                                        {avatars.map((avatar) => (
                                                            <div key={avatar.id} className="avatar">
                                                                <div className="w-9">
                                                                    <img src={avatar.thumbnail} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="avatar placeholder">
                                                            <div className="w-9 bg-blue-100 text-blue-600 font-semibold">
                                                                <span>+99</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </section>
                            {/* Description */}
                            <section>
                                <label htmlFor="task-description" className="py-2">
                                    Description
                                </label>
                                <textarea
                                    id="task-description"
                                    className="caret-blue-500 p-2 resize-none w-full outline-none border border-slate-200 rounded-lg"
                                    rows={5}
                                    placeholder="How do you describe this task?"
                                >
                                    {data.description}
                                </textarea>
                            </section>
                        </section>
                        {/* Right col */}
                        <section className="p-4 border-l border-slate-200 max-h-full overflow-y-auto">
                            {/* Writing section */}
                            <WritingSection />
                            {/* Comments section*/}
                            <section className="">
                                <Comments data={comments} />
                            </section>
                        </section>
                    </div>
                </div>
            </label>
        </div>
    );
}

export default TaskDetail;
