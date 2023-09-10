import { GlobeAsiaAustraliaIcon, LockClosedIcon, UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { colorThumbnails } from '~/constants';
import { UserAuth } from '~/contexts/AuthContext';
import { fetchBoards, createBoard } from '~/lib/actions';
import ComboboxWrapper from '../ComboboxWrapper';
import FormField from '../FormField';

const CreateBoardForm = ({ setBoards, setOpenModal, setToast }) => {
    const { user } = UserAuth();
    const [visibilities] = useState([
        {
            id: uuidv4(),
            title: 'Private',
            description: 'Only members can see and edit this board.',
            icon: <LockClosedIcon />,
        },
        {
            id: uuidv4(),
            title: 'Workspace',
            description: `All members of the ${user.displayName}'s workspace can see and edit this board.`,
            icon: <UserGroupIcon />,
        },
        {
            id: uuidv4(),
            title: 'Public',
            description: 'Anyone on the internet can see this board. Only board members can edit.',
            icon: <GlobeAsiaAustraliaIcon />,
        },
    ]);
    const [bgThumbnails, setBgThumbnails] = useState([]);
    const [currentThumb, setCurrentThumb] = useState({});
    const [visibility, setVisibility] = useState(visibilities.find((item) => item?.title === 'Workspace'));
    const [form, setForm] = useState({
        boardTitle: '',
        errors: {
            boardTitle: '',
        },
    });

    const handleChange = (type, value) => {
        // Remove error msg when user typing
        if (form.errors.boardTitle !== '') {
            setForm((prev) => ({ ...prev, [type]: value, errors: { boardTitle: '' } }));
        } else {
            setForm((prev) => ({ ...prev, [type]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // If board title is empty string then set error msg
        if (form.boardTitle === '') {
            setForm((prev) => ({ ...prev, errors: { boardTitle: 'Board title is required' } }));
        } else {
            const data = {
                creatorId: user?.uid,
                title: form.boardTitle,
                visibility: {
                    title: visibility.title,
                    description: visibility.description,
                },
                thumbnailURL: currentThumb?.urls?.full || currentThumb.thumbnailURL,
            };
            const result = await createBoard(data);
            if (result?.status === 200) {
                setToast({
                    show: true,
                    body: {
                        message: result.message,
                        status: 'success',
                    },
                });
                const boards = await fetchBoards(user?.uid);
                setBoards(boards);
                setOpenModal(false);
            } else {
                setToast({
                    show: true,
                    body: {
                        message: result.message,
                        status: 'error',
                    },
                });
            }

            setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
            }, 3000);
        }
    };

    useEffect(() => {
        const fetchBgThumbnails = async () => {
            try {
                const res1 = await axios.get(
                    `https://api.unsplash.com/photos/?client_id=${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}&per_page=4`,
                );
                setBgThumbnails(res1.data);
                setCurrentThumb(res1.data[0]);
            } catch (error) {
                console.error('Failed to fetch unsplash api', error);
            }
        };

        fetchBgThumbnails();
    }, []);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col mx-auto w-full gap-4">
            <header className="relative">
                <h4 className="font-semibold text-center">Create board</h4>
                <button onClick={() => setOpenModal((prev) => !prev)} className="popper-close" type="button">
                    <XMarkIcon />
                </button>
            </header>

            <div className="flex items-center justify-center px-12">
                <div
                    async
                    style={{
                        backgroundImage: `url(${
                            currentThumb?.urls ? currentThumb.urls.small : currentThumb.thumbnailURL
                        })`,
                    }}
                    className="w-full image h-32 rounded-md flex items-center justify-center"
                >
                    <img async src="https://trello.com/assets/14cda5dc635d1f13bc48.svg" alt="bgThumbnail" />
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-slate-600 font-semibold">Background</h4>
                <div className="space-y-1">
                    <div className="grid grid-cols-4 gap-1">
                        {bgThumbnails.map((thumb) => (
                            <button
                                async
                                type="button"
                                onClick={() => setCurrentThumb(thumb)}
                                key={thumb?.id}
                                style={{ backgroundImage: `url(${thumb?.urls?.small})` }}
                                className={`flexCenter ring-2 ${
                                    currentThumb?.id === thumb?.id ? 'ring-blue-500' : 'ring-transparent'
                                } image rounded-sm h-12 hover:opacity-80 ease duration-100`}
                            ></button>
                        ))}
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                        {colorThumbnails.map((thumb) => (
                            <button
                                async
                                type="button"
                                onClick={() => setCurrentThumb(thumb)}
                                key={thumb?.uid}
                                style={{ backgroundImage: `url(${thumb.thumbnailURL})` }}
                                className={`ring-2 ${
                                    currentThumb?.uid === thumb?.uid ? 'ring-blue-500' : 'ring-transparent'
                                } image rounded-sm h-8 hover:opacity-80 ease duration-100`}
                            ></button>
                        ))}
                        <button
                            type="button"
                            className="h-8 bg-slate-200 hover:bg-slate-500 ease duration-100 text-white flex items-center justify-center"
                        >
                            <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Board Title */}
            <FormField
                name="boardTitle"
                value={form.boardTitle}
                handleChange={handleChange}
                errors={form.errors.boardTitle}
                label="Board title"
                required
            />
            <ComboboxWrapper
                selected={visibility}
                setSelected={setVisibility}
                label="Visibility"
                name="visibility"
                data={visibilities}
            />
            {/* Footer */}
            <div className="flex flex-col items-start gap-3">
                <button
                    className="w-full text-center p-2 bg-blue-500 hover:bg-blue-500/90 text-white rounded-md  ease duration-100"
                    type="submit"
                >
                    Create
                </button>
                <div className="flex m-auto">
                    <p
                        onClick={() => {
                            console.log('Start with a template');
                        }}
                        className="text-description text-center hover:underline hover:text-blue-500 ease duration-100 cursor-pointer"
                    >
                        Start with a template
                    </p>
                </div>

                <p className="text-description text-sm">
                    By using images from Unsplash you agree to their license and Terms of Service
                </p>
            </div>
        </form>
    );
};

export default CreateBoardForm;
