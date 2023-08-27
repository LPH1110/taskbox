import React from 'react';
import classNames from 'classnames/bind';
import styles from './Inbox.module.scss';
import { TagIcon as TagOutlineIcon } from '@heroicons/react/24/outline';
import { TagIcon as TagSolidIcon } from '@heroicons/react/24/solid';

import { UserAuth } from '~/contexts/AuthContext';
import { useState } from 'react';

const cx = classNames.bind(styles);

function MessageBox() {
    const { user } = UserAuth();
    const [tagged, setTagged] = useState(false);

    const handleTagged = (e) => {
        setTagged(!tagged);
    };

    return (
        <div className={cx('cell', 'px-2 bg-slate-50 cursor-pointer ease duration-200')}>
            <div className="flex items-start px-2 py-3">
                {/* Avatar */}
                <div className="avatar rounded-full cursor-pointer mr-3">
                    <div className="w-9 rounded-full">
                        <img src={user?.photoURL} />
                    </div>
                </div>
                {/* Box description */}
                <div>
                    <div className="flex justify-between">
                        <h4 className="text-slate-700">Andrew Cano</h4>
                        <div className="flex items-center">
                            <button
                                onClick={handleTagged}
                                className={cx('cell-tag', `mr-1 ease duration-200 ${tagged && '!inline-block'}`)}
                            >
                                {tagged ? <TagSolidIcon className="w-4 h-4" /> : <TagOutlineIcon className="w-4 h-4" />}
                            </button>
                            <p className="text-slate-500">Jul 10, 10:32 AM</p>
                        </div>
                    </div>
                    <h3 className="font-semibold py-1 text-md">Report - Chatto project</h3>
                    <p className={cx('cell-desc', 'text-slate-500, text-sm')}>
                        Hello, Orlando. Please see the project status in the pdf I attached. The project looks good, and
                        we are confident that we will complete it on time. Also we have provided completed Hi-fi design.
                        Do you have any feedbacks or comments more? If not, then we can make up and finish everything.
                        Let us know as soon as possible. Thanks in advance. Regards, Andrew Cano.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default MessageBox;
