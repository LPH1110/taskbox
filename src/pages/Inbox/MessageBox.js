import React, { useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Inbox.module.scss';
import { TagIcon as TagOutlineIcon } from '@heroicons/react/24/outline';
import { TagIcon as TagSolidIcon } from '@heroicons/react/24/solid';

import { UserAuth } from '~/contexts/AuthContext';
import { useState } from 'react';
import { LazyLoad } from '~/components';
import { fetchUserInfo } from '~/lib/api/users';

const cx = classNames.bind(styles);

function MessageBox({ data, onClick }) {
    const { user } = UserAuth();
    const [tagged, setTagged] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [receiver, setReceiver] = useState();

    const { emails } = data;
    const filteredEmails = emails.filter((email) => email !== user?.email);
    const lastMessage = data.messages[data.messages.length - 1];

    const handleTagged = (e) => {
        setTagged(!tagged);
    };

    const getTimeElapsed = () => {
        const now = new Date();
        let diff;
        if (lastMessage?.createdAt instanceof Date) {
            diff = now - lastMessage?.createdAt;
        } else {
            diff = now - lastMessage?.createdAt.toDate();
        }
        // convert to seconds
        let seconds = Math.floor(diff / 1000);

        // convert to minutes
        let minutes = Math.floor(seconds / 60);

        // convert to hours
        let hours = Math.floor(minutes / 60);

        // convert to days
        let days = Math.floor(hours / 24);

        if (seconds < 60) {
            return `just now`;
        } else if (minutes < 60) {
            return `${minutes} minutes`;
        } else if (hours < 24) {
            return `${hours} hours`;
        } else {
            return `${days} days`;
        }
    };

    useEffect(() => {
        const getReceiverInfo = async () => {
            const res = await fetchUserInfo(filteredEmails[0]);
            if (res.error) {
                console.log(res.error);
            } else {
                setReceiver(res);
                setIsLoading(false);
            }
        };

        getReceiverInfo();
    }, []);

    return (
        <div onClick={() => onClick(data)} className={cx('cell')}>
            <div className="flex items-start px-2 py-4">
                {/* Avatar */}
                <LazyLoad isLoading={isLoading}>
                    <div className="avatar rounded-full cursor-pointer mr-3">
                        <div className="w-9 rounded-full">
                            <img src={receiver?.photoURL} alt="user avatar" />
                        </div>
                    </div>
                </LazyLoad>
                {/* Box description */}
                <div className="space-y-2 w-full">
                    <div className="flex justify-between">
                        <h4 className="text-slate-700 font-semibold">{receiver?.displayName}</h4>
                        <div className="flex items-center">
                            <button
                                onClick={handleTagged}
                                className={cx('cell-tag', `mr-1 ease duration-200 ${tagged && '!inline-block'}`)}
                            >
                                {tagged ? <TagSolidIcon className="w-4 h-4" /> : <TagOutlineIcon className="w-4 h-4" />}
                            </button>
                            <p className="text-slate-500 text-sm">{getTimeElapsed()}</p>
                        </div>
                    </div>

                    <p className={cx('cell-desc', 'text-slate-500, text-sm')}>
                        {lastMessage?.senderEmail === user?.email ? 'You: ' : 'Other: '}{' '}
                        {data.messages[data.messages.length - 1].text}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default MessageBox;
