import { FaceSmileIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, EllipsisVerticalIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, UserAvatar } from '~/components';
import { UserAuth } from '~/contexts/AuthContext';
import { db, storage } from '~/firebase-config';
import { addMessageToRoom } from '~/lib/api/rooms';
import { fetchUserInfo } from '~/lib/api/users';

const ChatRoom = ({ currentRoom, setInboxes, setCurrentRoom, setEnteredChat, messages = [] }) => {
    const { user } = UserAuth();
    const [text, setText] = useState('');
    const chatRef = useRef();
    const [receiver, setReceiver] = useState();

    const { emails } = currentRoom;
    const filteredEmails = emails.filter((email) => email !== user?.email);

    const uploadFile = async (e) => {
        try {
            const file = e.target.files[0];
            if (file) {
                const fileRef = ref(storage, `files/${file.name + uuidv4()}`);
                console.log(fileRef);
                const res = await uploadBytes(fileRef, file);
            }
        } catch (error) {
            console.error('Failed to upload file', error);
        }
    };

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
                type: 'text',
            };
            const newList = [...messages, newMessage];
            setInboxes((prev) => {
                const newState = {
                    ...prev,
                };
                newState[currentRoom.id].messages = newList;
                console.log(newState);
                return newState;
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
        const getReceiverInfo = async () => {
            const res = await fetchUserInfo(filteredEmails[0]);
            if (res.error) {
                console.log(res.error);
            } else {
                setReceiver(res);
            }
        };

        getReceiverInfo();

        return () => unsub();
    }, []);

    return (
        <div className="h-full w-full flex flex-col">
            <div className="mb-3 bg-transparent rounded-lg flex justify-between items-start ">
                <div className="flex gap-2">
                    <button type="button" onClick={() => setEnteredChat(false)}>
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <UserAvatar photoURL={receiver?.photoURL} />
                    <div>
                        <h4 className="font-semibold">{receiver?.displayName}</h4>
                        <p className="text-sm text-description flex items-center gap-2">
                            {receiver?.is_online ? (
                                <>
                                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div> Active now
                                </>
                            ) : (
                                <p>Offline</p>
                            )}
                        </p>
                    </div>
                </div>
                <button type="button" className="p-2">
                    <EllipsisVerticalIcon className="w-6 h-6" />
                </button>
            </div>
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
                <div className="flex gap-2">
                    <label
                        htmlFor="chat_file_upload"
                        className="text-slate-500 hover:text-slate-500/80 ease duration-200"
                    >
                        <PaperClipIcon className="w-6 h-6" />
                    </label>
                    <input
                        className="hidden"
                        name="chat_file_upload"
                        id="chat_file_upload"
                        type="file"
                        onChange={uploadFile}
                    />
                    <Button className="text-slate-500 hover:text-slate-500/80 ease duration-200">
                        <FaceSmileIcon className="w-6 h-6" />
                    </Button>
                    <Button
                        onClick={handleSendMessage}
                        className="text-blue-500 hover:text-blue-500/80 ease duration-200"
                    >
                        <PaperAirplaneIcon className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
