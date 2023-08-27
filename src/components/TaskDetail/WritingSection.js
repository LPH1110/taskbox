import React, { useState } from 'react';
import classNames from 'classnames/bind';
import Button from '../Button';
import styles from './TaskDetail.module.scss';
import { useStore, actions } from '~/store';

const cx = classNames.bind(styles);

function WritingSection() {
    const [state, dispatch] = useStore();
    const { userSession } = state;
    const [showActions, setShowActions] = useState(false);
    const [content, setContent] = useState('');

    const handleComment = () => {
        if (content !== '') {
            console.log(content);
            dispatch(
                actions.addNewCommentToTask({
                    userId: userSession.id,
                    userName: '@LPH1110',
                    content,
                    userThumbnail:
                        'https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar2_fssdbw.jpg',
                }),
            );
            setContent('');
        }
    };

    const handleCancel = () => {
        setContent('');
        setShowActions(false);
    };

    return (
        <section className="mb-4">
            <div className="flex mb-4">
                <div className="avatar">
                    <div className="w-12 h-12 rounded-full">
                        <img src="https://res.cloudinary.com/dzzv49yec/image/upload/v1670050964/taskbox-assets/avatar1_ilyzbz.jpg" />
                    </div>
                </div>
                <textarea
                    onFocus={() => setShowActions(true)}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    id="task-description"
                    className={cx(
                        'writing-section',
                        'ml-6 caret-blue-500 p-2 resize-none w-full outline-none border border-slate-200 rounded-lg',
                    )}
                    rows={3}
                    placeholder="Say something..."
                ></textarea>
            </div>
            {showActions && (
                <div className="flex justify-end items-center">
                    <Button
                        onClick={handleCancel}
                        size="medium"
                        type="button"
                        className="rounded-lg hover:bg-slate-100 text-slate-700 ease-in-out duration-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleComment}
                        size="medium"
                        type="button"
                        className="bg-blue-100/50 hover:bg-blue-100/30 hover:text-blue-300 ease-in-out duration-200 text-blue-400 font-semibold rounded-lg"
                    >
                        Comment
                    </Button>
                </div>
            )}
        </section>
    );
}

export default WritingSection;
