import {
    BellIcon,
    ChatBubbleBottomCenterIcon,
    MagnifyingGlassIcon,
    QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import styles from './Inbox.module.scss';

import { Bars3Icon } from '@heroicons/react/24/solid';
import { MobileHeadBar, SearchInput, UserAvatar, UserMenu } from '~/components';
import { UserAuth } from '~/contexts/AuthContext';
import { fetchConversations } from '~/lib';
import { convertObjFromArray } from '~/lib/helpers';
import ChatRoom from './ChatRoom';
import MessageBox from './MessageBox';

const cx = classNames.bind(styles);

const Inboxes = ({ inboxes, handleEnterChat }) => {
    return (
        <div className="h-full bg-white rounded-lg lg:w-1/4 w-full">
            <div className="h-full" style={{ overflow: 'overlay' }}>
                {Object.keys(inboxes).length > 0 ? (
                    Object.entries(inboxes).map(([id, inbox]) => (
                        <MessageBox onClick={handleEnterChat} data={inbox} key={inbox?.id} />
                    ))
                ) : (
                    <div className="h-full flex-1 flexCenter flex-col gap-4 p-4">
                        <img
                            className="w-16 h-16"
                            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                            alt="msg_not_found"
                        />
                        <p className="text-center text-description text-lg">
                            Message empty? <br />
                            Let's start a conversation...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

function Inbox() {
    const { user } = UserAuth();
    const [searchKeys, setSearchKeys] = useState('');
    const [enteredChat, setEnteredChat] = useState(false);
    const [currentRoom, setCurrentRoom] = useState();
    const [inboxes, setInboxes] = useState({});

    const handleEnterChat = (inbox) => {
        setEnteredChat(true);
        setCurrentRoom(inbox);
    };

    useEffect(() => {
        if (user?.email) {
            const getConversations = async () => {
                const res = await fetchConversations({ email: user?.email });
                const converted = convertObjFromArray(res);
                console.log(converted);

                setInboxes(converted);
            };
            getConversations();
        }
    }, [user]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="header bg-white px-6">
                <SearchInput
                    className="hidden md:flex items-center"
                    value={searchKeys}
                    setValue={setSearchKeys}
                    placeholder="Search a message..."
                />
                <MobileHeadBar />

                <div className="hidden md:flex items-center justify-between gap-5">
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
            <div style={{ height: 'calc(100vh - 80px)' }} className="p-6 flexBetween gap-6 flex-1 overflow-hidden">
                {!enteredChat ? (
                    <Inboxes inboxes={inboxes} handleEnterChat={handleEnterChat} />
                ) : (
                    <ChatRoom
                        currentRoom={currentRoom}
                        setInboxes={setInboxes}
                        setCurrentRoom={setCurrentRoom}
                        setEnteredChat={setEnteredChat}
                        messages={currentRoom?.messages}
                    />
                )}
            </div>
        </div>
    );
}

export default Inbox;
