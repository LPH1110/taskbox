import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useEffect, useRef, useState } from 'react';
import { Button } from '~/components';
import { UserAuth } from '~/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { addMessageToRoom } from '~/lib';
import { db } from '~/firebase-config';
import { doc, onSnapshot } from 'firebase/firestore';
import { FaceSmileIcon, PaperClipIcon } from '@heroicons/react/24/outline';

const ChatRoom = ({ currentRoom, setInboxes, setCurrentRoom, messages = [] }) => {
    const { user } = UserAuth();
    const [text, setText] = useState('');
    const chatRef = useRef();

    const scrollToBottom = () => {
        // scroll to bottom
        const element = chatRef?.current;
        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    };

    const handleSendMessage = () => {
        if (text) {
            const newMessage = {
                createdAt: new Date(),
                id: uuidv4(),
                photoURL: user?.photoURL,
                senderEmail: user?.email,
                text: text,
            };
            const newList = [...messages, newMessage];
            setInboxes((prev) => {
                const newState = {
                    ...prev,
                };
                console.log(prev);
                return prev;
            });
            addMessageToRoom({ roomId: currentRoom?.id, data: newList });
            setText('');
        }
    };

    useEffect(() => {
        scrollToBottom();
        const unsub = onSnapshot(doc(db, 'rooms', currentRoom?.id), (doc) => {
            setCurrentRoom({ id: doc.id, ...doc.data() });
        });

        return () => unsub();
    }, []);

    return (
        <>
            <div
                style={{ scrollBehavior: 'smooth', overflow: 'overlay' }}
                ref={chatRef}
                className="h-full space-y-4 p-4 bg-white rounded-t-lg"
            >
                {messages?.map((message) => {
                    let admin = message?.senderEmail === user?.email;
                    return (
                        <div key={message?.id} className={`flex gap-2 ${admin ? 'justify-end' : 'justify-start'}`}>
                            {!admin && (
                                <div className="inline-block avatar rounded-full cursor-pointer mr-3">
                                    <div className="w-9 rounded-full">
                                        <img src={message?.photoURL} alt="user avatar" />
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <p
                                    className={`px-4 py-2 text-description ${
                                        admin ? 'bg-blue-100' : 'bg-slate-100'
                                    } rounded-md`}
                                >
                                    {message?.text}
                                </p>
                                <p className={`${admin ? 'text-right' : 'text-left'} text-sm text-slate-400`}>
                                    6 hours ago
                                </p>
                            </div>
                            {admin && (
                                <div className="inline-block avatar rounded-full cursor-pointer ml-3">
                                    <div className="w-9 rounded-full">
                                        <img src={message?.photoURL} alt="user avatar" />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="gap-3 ease duration-200 flex items-center p-3 bg-white rounded-b-lg shadow-md border-t border-slate-100">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full text-slate-600 bg-transparent outline-none"
                />
                <div className="flex">
                    <Button
                        onClick={handleSendMessage}
                        className="text-slate-500 hover:text-slate-500/80 ease duration-200"
                    >
                        <PaperClipIcon className="w-5 h-5" />
                    </Button>
                    <Button
                        onClick={handleSendMessage}
                        className="text-slate-500 hover:text-slate-500/80 ease duration-200"
                    >
                        <FaceSmileIcon className="w-5 h-5" />
                    </Button>
                    <Button
                        onClick={handleSendMessage}
                        className="text-blue-500 hover:text-blue-500/80 ease duration-200"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </>
    );
};

export default ChatRoom;
