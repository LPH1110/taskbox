import React from 'react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import Button from '../Button';
import classNames from 'classnames/bind';
import styles from './TaskDetail.module.scss';
import { useStore } from '~/store';

const cx = classNames.bind(styles);

function Comments({ data }) {
    const [state, dispatch] = useStore();
    const { userSession } = state;

    return (
        <div className="overflow-y-auto">
            {Object.entries(data).map(([id, comment]) => (
                <div key={id} className={cx('comment', 'flex')}>
                    <div className="avatar">
                        <div className="w-12 h-12 rounded-full">
                            <img src={comment.userThumbnail} alt="user avatar" />
                        </div>
                    </div>
                    <div className="ml-6 w-full">
                        <div className="p-2 w-full outline-none bg-blue-100/50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold mb-2">{comment.userName}</h4>
                            <p className="">{comment.content}</p>
                        </div>
                        <div className="flex justify-start items-center py-2">
                            <Button className="px-1">Like</Button>
                            <Button className="px-1">Reply</Button>
                            {userSession.id === comment.userId ? (
                                <Button className="px-1">
                                    <span>
                                        <EllipsisHorizontalIcon className="w-5 h-5" />
                                    </span>
                                </Button>
                            ) : (
                                <Button className="px-1">
                                    <span>
                                        <EllipsisHorizontalIcon className="w-5 h-5" />
                                    </span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Comments;
