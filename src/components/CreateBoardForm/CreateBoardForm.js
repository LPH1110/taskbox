import {
    CommandLineIcon,
    GlobeAsiaAustraliaIcon,
    LockClosedIcon,
    UserGroupIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useFormik } from 'formik';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';
import images from '~/assets';
import { backgroundThumbs, colorThumbnails } from '~/constants';
import { ActivityAuth } from '~/contexts/ActivityContext';
import { UserAuth } from '~/contexts/AuthContext';
import { db } from '~/firebase-config';
import ComboboxWrapper from '../ComboboxWrapper';
import FormField from '../FormField';

const CreateBoardForm = ({ setOpenModal, setBoards, setToast }) => {
    const { user } = UserAuth();
    const { saveAction } = ActivityAuth();
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
    const [selected, setSelected] = useState(visibilities.find((item) => item?.title === 'Workspace'));
    const [currentThumb, setCurrentThumb] = useState(backgroundThumbs[0].thumbnailURL);
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            boardTitle: '',
        },
        validationSchema: Yup.object().shape({
            boardTitle: Yup.string().trim().required('Board title is required'),
        }),
        onSubmit: async (data) => {
            setLoading(true);
            const { title, description } = selected;
            const { boardTitle } = data;
            const doc = {
                uid: uuidv4(),
                title: boardTitle,
                visibility: { title, description },
                thumbnail: currentThumb,
                userId: user.uid,
            };

            try {
                await addDoc(collection(db, 'boards'), doc);
                saveAction({
                    userId: user.uid,
                    action: 'created',
                    message: data?.boardTitle,
                    date: new Date(),
                });
                setToast({
                    show: true,
                    body: {
                        message: `Successfully created (${boardTitle})`,
                        status: 'success',
                    },
                });
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
                setOpenModal(false);
                setTimeout(() => {
                    setToast((prev) => ({ ...prev, show: false }));
                }, 2000);
            }

            // update boards in workplace
            const fetchBoards = async () => {
                try {
                    const q = query(collection(db, 'boards'), where('userId', '==', user.uid));
                    const res = await getDocs(q);
                    const result = res.docs.reduce((acc, data) => [...acc, data.data()], []);
                    setBoards(result);
                } catch (error) {
                    console.log(error);
                }
            };

            fetchBoards();
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} className="flex flex-col mx-auto w-full gap-4">
            <header className="relative">
                <h4 className="font-semibold text-center">Create board</h4>
                <button onClick={() => setOpenModal((prev) => !prev)} className="popper-close" type="button">
                    <XMarkIcon />
                </button>
            </header>

            <div className="flex items-center justify-center px-12">
                <div className="w-full relative image h-32 rounded-md flex items-center justify-center">
                    <img src={currentThumb} alt="bgThumbnail" className="w-full h-full" />
                    <img src={images.boardHolder} alt="bgThumbnail" className="absolute" />
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-slate-600 font-semibold">Background</h4>
                <div className="space-y-1">
                    <div className="grid grid-cols-4 gap-1">
                        {backgroundThumbs.slice(1).map((thumb) => (
                            <button
                                type="button"
                                onClick={() => setCurrentThumb(thumb?.thumbnailURL)}
                                key={thumb?.uid}
                                style={{ backgroundImage: `url(${thumb?.thumbnailURL})` }}
                                className="image rounded-sm h-12 hover:opacity-80 ease duration-100"
                            ></button>
                        ))}
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                        {colorThumbnails.map((thumb) => (
                            <button
                                onClick={() => setCurrentThumb(thumb?.thumbnailURL)}
                                key={thumb?.uid}
                                type="button"
                                className="h-8 rounded-sm hover:opacity-80 ease duration-100"
                            >
                                <img className="h-full" src={thumb.thumbnailURL} alt="bgColor" />
                            </button>
                        ))}
                        <button
                            type="button"
                            className="h-8 rounded-sm flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-500 ease duration-100 hover:text-white"
                        >
                            <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Board Title */}
            <FormField
                name="boardTitle"
                value={formik.values.boardTitle}
                handleChange={formik.handleChange}
                touched={formik.touched}
                errors={formik.errors.boardTitle}
                label="Board title"
                required
            />
            <ComboboxWrapper
                selected={selected}
                setSelected={setSelected}
                label="Visibility"
                name="visibility"
                data={visibilities}
            />
            {/* Description Free trials */}
            <div className="flex flex-col justify-start gap-3">
                <p className="text-description text-sm">
                    This Workspace has 7 boards remaining. Free Workspaces can only have 10 open boards. For unlimited
                    boards, upgrade your Workspace.
                </p>
                <button
                    className="w-full flex items-center justify-center gap-2 text-center p-2 bg-purple-500 hover:bg-purple-500/90 text-white rounded-md  ease duration-100"
                    type="button"
                >
                    <CommandLineIcon className="w-6 h-6" />
                    Start free trial
                </button>
            </div>
            {/* Footer */}
            <div className="flex flex-col items-start gap-3">
                <button
                    className="w-full text-center p-2 bg-blue-500 hover:bg-blue-500/90 text-white rounded-md  ease duration-100"
                    type="submit"
                >
                    {loading ? 'Creating...' : 'Create'}
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
