import { BellIcon, ChatBubbleBottomCenterIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import { Fragment, useEffect, useState } from 'react';
import styles from './Inbox.module.scss';

import { Button, SearchInput, UserAvatar, UserMenu } from '~/components';
import MessageBox from './MessageBox';
import { fetchConversations } from '~/lib';
import { UserAuth } from '~/contexts/AuthContext';
import ChatRoom from './ChatRoom';
import { Transition } from '@headlessui/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '~/firebase-config';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { convertObjFromArray } from '~/lib/helpers';

const cx = classNames.bind(styles);

function Inbox() {
    const { user } = UserAuth();
    const [searchKeys, setSearchKeys] = useState('');
    const [enteredChat, setEnteredChat] = useState(false);
    const [currentRoom, setCurrentRoom] = useState();
    const [inboxes, setInboxes] = useState([]);

    const handleEnterChat = (inbox) => {
        setEnteredChat(true);
        setCurrentRoom(inbox);
    };

    useEffect(() => {
        const getConversations = async () => {
            const res = await fetchConversations({ email: user?.email });
            const converted = convertObjFromArray(res);
            console.log(converted);
            setInboxes(converted);
        };
        getConversations();
    }, [user?.email]);

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
            <div style={{ height: 'calc(100vh - 80px)' }} className="p-6 flexBetween gap-6 flex-1 overflow-hidden">
                {/* Left */}
                <div className="h-full bg-white rounded-lg w-1/4 hidden lg:block">
                    <div style={{ overflow: 'overlay' }}>
                        {inboxes?.length > 0 ? (
                            Object.entries(inboxes).map(([inbox, id]) => (
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
                {/* Right */}
                {enteredChat && (
                    <div className="h-full w-full flex flex-col">
                        <div className="mb-3 bg-transparent rounded-lg flex justify-between items-start ">
                            <div className="flex gap-2">
                                <UserAvatar />
                                <div>
                                    <h4 className="font-semibold">Amber Harly</h4>
                                    <p className="text-sm text-description flexCenter gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>Active now
                                    </p>
                                </div>
                            </div>
                            <button type="button" className="p-2">
                                <EllipsisVerticalIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <ChatRoom
                            currentRoom={currentRoom}
                            setInboxes={setInboxes}
                            setCurrentRoom={setCurrentRoom}
                            messages={currentRoom?.messages}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Inbox;
