import { Dialog, Transition } from '@headlessui/react';
import { LinkIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Fragment, useEffect, useState } from 'react';
import { createAssignee, fetchUserInfo } from '~/lib/actions';
import { actions, useStore } from '~/store';
import LineInput from '../LineInput';
import UserAvatar from '../UserAvatar';

const ShareModal = ({ setToast, board, show, setShow, modalTitle }) => {
    const [memberName, setMemberName] = useState('');
    const [created, setCreated] = useState(false);
    const [timeoutId, setTimeoutId] = useState();

    const [state, dispatch] = useStore();
    const { assignees } = state;
    const handleChange = (name, value) => {
        setMemberName(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // create new assignee
        const info = await fetchUserInfo(memberName);
        if (!info?.error) {
            const newAssignee = {
                user: {
                    email: info?.email,
                    photoURL: info?.photoURL,
                    displayName: info?.displayName,
                },
                boardId: board?.id,
                role: 'member',
            };
            const result = await createAssignee(newAssignee);
            if (!result?.error) {
                const newList = [newAssignee, ...assignees];
                dispatch(actions.updateAssignees(newList));
                setMemberName('');
            }
        } else {
            setToast({
                show: true,
                body: {
                    message: info.error,
                    status: 'error',
                },
            });
            setTimeoutId(
                setTimeout(() => {
                    setToast((prev) => ({
                        show: false,
                        ...prev,
                    }));
                }, 2000),
            );
        }
    };

    const handleCreateLink = () => {
        setCreated(true);
    };

    const handleCopyLink = () => {
        console.log('copied');
    };

    useEffect(() => {
        return () => clearTimeout(timeoutId);
    }, [timeoutId]);

    return (
        <Transition show={show} as={Fragment}>
            <Dialog onClose={() => setShow(false)} as="div" className="relative z-10">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-xl transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all space-y-6">
                                <div className="flexBetween">
                                    <Dialog.Title as="h3" className="modal-label">
                                        {modalTitle}
                                    </Dialog.Title>
                                    <button type="button" onClick={() => setShow(false)}>
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <form className="flexBetween">
                                    <LineInput
                                        name="memberName"
                                        value={memberName}
                                        handleChange={handleChange}
                                        handleSubmit={handleSubmit}
                                        placeholder="Email address or name"
                                    />
                                </form>
                                <div className="flexStart gap-2">
                                    <span className="p-2 rounded-sm bg-blue-100/80 text-blue-500">
                                        <LinkIcon className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <h4>Anyone with the board share link</h4>
                                        {!created ? (
                                            <button
                                                onClick={handleCreateLink}
                                                type="button"
                                                className="text-description hover:underline hover:text-blue-500"
                                            >
                                                Create link
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleCopyLink}
                                                type="button"
                                                className="text-description hover:underline hover:text-blue-500"
                                            >
                                                Copy link
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {assignees.map((assignee) => (
                                        <div key={assignee.id} className="flexBetween">
                                            <div className="flex gap-2">
                                                <UserAvatar photoURL={assignee.user.photoURL} />
                                                <div>
                                                    <h4>{assignee.user.displayName}</h4>
                                                    <p className="text-sm text-description">@phuhaole</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p>{assignee.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ShareModal;
