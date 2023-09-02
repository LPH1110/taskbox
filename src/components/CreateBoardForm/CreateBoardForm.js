import React, { useState, useEffect } from 'react';
import {
    CommandLineIcon,
    GlobeAsiaAustraliaIcon,
    LockClosedIcon,
    UserGroupIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import FormField from '../FormField';
import ComboboxWrapper from '../ComboboxWrapper';
import { UserAuth } from '~/contexts/AuthContext';
import Button from '../Button';
import axios from 'axios';

const CreateBoardForm = ({ setOpenModal }) => {
    const { user } = UserAuth();

    const [bgThumbnails, setBgThumbnails] = useState([]);
    const [currentThumb, setCurrentThumb] = useState({});
    const [form, setForm] = useState({
        boardTitle: '',
        currentThumb: {},
        visibility: '',
        errors: {
            boardTitle: '',
        },
    });

    const handleChange = (type, value) => {
        if (form.errors.boardTitle) {
            // has error
            setForm((prev) => ({ ...prev, [type]: value, errors: { boardTitle: '' } }));
        } else {
            setForm((prev) => ({ ...prev, [type]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Check errors
        if (!form.errors.boardTitle) {
            console.log(form);
        } else {
            setForm((prev) => ({ ...prev, errors: { boardTitle: 'Board title is required' } }));
        }
    };

    useEffect(() => {
        const fetchBgThumbnails = async () => {
            try {
                const res = await axios.get(
                    `https://api.unsplash.com/photos/?client_id=${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}&per_page=4`,
                );
                setBgThumbnails(res.data);
                setCurrentThumb(res.data[0]);
            } catch (error) {
                console.error('Failed to fetch unsplash api', error);
            }
        };

        fetchBgThumbnails();
    }, []);

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
                    style={{ backgroundImage: `url(${currentThumb?.urls?.small})` }}
                    className="w-full image h-32 rounded-md flex items-center justify-center"
                >
                    <img src="https://trello.com/assets/14cda5dc635d1f13bc48.svg" alt="bgThumbnail" />
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-slate-600 font-semibold">Background</h4>
                <div>
                    <div className="grid grid-cols-4 gap-1">
                        {bgThumbnails.map((thumb) => (
                            <button
                                type="button"
                                onClick={() => setCurrentThumb(thumb)}
                                key={thumb?.id}
                                style={{ backgroundImage: `url(${thumb?.urls?.small})` }}
                                className="image rounded-sm h-12 hover:opacity-80 ease duration-100"
                            ></button>
                        ))}
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
            <ComboboxWrapper label="Visibility" name="visibility" data={visibilities} />
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
