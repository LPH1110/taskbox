import React from 'react';
import { UserIcon, QueueListIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { UserAvatar } from '~/components';
import { UserAuth } from '~/contexts/AuthContext';
import Spacer from '../Spacer/Spacer';
import { Link } from 'react-router-dom';

const AboutMenu = ({ setCurrentMenu }) => {
    const { user } = UserAuth();
    console.log(user);
    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-start gap-2 font-semibold">
                <span>
                    <UserIcon className="w-5 h-5" />
                </span>
                <h4>Board admins</h4>
            </div>
            <div className="flex justify-start items-start gap-2">
                <UserAvatar />
                <div className="flex flex-col items-start">
                    <h4>{user?.displayName}</h4>
                    <p className="text-description text-sm">@lephuhao3</p>
                    <p className="text-description text-sm mt-2">Your bio description</p>
                    <Link to="/profile" className="text-slate-400 hover:text-blue-500 hover:underline">
                        Edit profile info
                    </Link>
                </div>
            </div>
            <div className="flex items-center justify-start gap-2 font-semibold">
                <span>
                    <QueueListIcon className="w-5 h-5" />
                </span>
                <h4>Description</h4>
            </div>
            <div className="mb-4">
                <textarea
                    id="task-description"
                    className="hover:bg-slate-100 ease duration-100 focus:bg-white caret-blue-500 p-2 resize-none w-full outline-none border border-slate-200 rounded-lg"
                    rows="5"
                    placeholder="Add a description to let your teammates know what this board is used for. You'll get bonus points if you add instructions for how to collaborate!"
                ></textarea>
            </div>
            <Spacer />
            <div className="flex flex-col gap-3 items-start justify-start">
                <p>Members can...</p>
                <p className="flex justify-start items-center gap-2 font-semibold text-sm">
                    <span>
                        <ChatBubbleLeftIcon className="w-5 h-5" />
                    </span>{' '}
                    Comment on cards
                </p>
                <button
                    className="py-2 px-3 rounded-sm bg-slate-100 hover:bg-slate-200 ease duration-100"
                    type="button"
                    onClick={() => setCurrentMenu((prev) => [...prev, { title: 'Settings', path: '/settings' }])}
                >
                    Change permissions...
                </button>
            </div>
        </div>
    );
};

export default AboutMenu;
