import { BellIcon, ChatBubbleBottomCenterIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import { useState } from 'react';
import styles from './Inbox.module.scss';

import { SearchInput, UserAvatar, UserMenu } from '~/components';
import MessageBox from './MessageBox';

const cx = classNames.bind(styles);

function Inbox() {
    const [searchKeys, setSearchKeys] = useState('');
    const [enteredChat, setEnteredChat] = useState(false);
    const [inboxes, setInboxes] = useState([]);

    const handleEnterChat = () => {
        setEnteredChat(true);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="header bg-white px-6">
                <SearchInput value={searchKeys} setValue={setSearchKeys} placeholder="Search a message..." />
                <div className="flexBetween gap-5">
                    <button type="button" className={cx('header_action')}>
                        <BellIcon className="w-6 h-6" />
                    </button>
                    <button type="button" className={cx('header_action')}>
                        <ChatBubbleBottomCenterIcon className="w-6 h-6" />
                    </button>
                    <button type="button" className={cx('header_action')}>
                        <QuestionMarkCircleIcon className="w-6 h-6" />
                    </button>
                    {/* Avatar menu */}
                    <UserMenu>
                        <div className="hover:bg-slate-100 p-1 ease-in-out duration-200 rounded-full flex items-center">
                            <UserAvatar width="w-9" />
                        </div>
                    </UserMenu>
                </div>
            </header>
            <div className="p-6 flexBetween gap-6 flex-1">
                {/* Left */}
                <div className="h-full bg-white rounded-lg w-1/4">
                    <div style={{ overflow: 'overlay' }} className="h-[38rem]">
                        {inboxes.map((inbox) => (
                            <MessageBox data={inbox} key={inbox?.id} />
                        ))}
                        <MessageBox onClick={handleEnterChat} />
                    </div>
                </div>
                {/* Right */}
                {enteredChat ? (
                    <div className={`h-full flex-1 ${inboxes.length > 0 ? 'bg-white' : ''} rounded-lg`}>Messages</div>
                ) : (
                    <div className="h-full flex-1 flexCenter flex-col gap-4">
                        <img
                            className="w-48 h-48"
                            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                            alt="msg_not_found"
                        />
                        <p className="text-center text-description text-lg">
                            Message empty? Let's start a conversation...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Inbox;
