import { updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { ActivityAuth } from '~/contexts/ActivityContext';
import { UserAuth } from '~/contexts/AuthContext';
import { storage } from '~/firebase-config';

import { Toast } from '~/components';
import UserTab from './UserTab';

function Profile() {
    const { user } = UserAuth();
    const { saveAction } = ActivityAuth();
    const [loading, setLoading] = useState(false);

    const [avatar, setAvatar] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState();
    const [skeleton, setSkeleton] = useState(true);
    const [toast, setToast] = useState({
        onShow: false,
        body: {
            message: '',
            status: '',
        },
    });

    useEffect(() => {
        if (user) setSkeleton(false);
    }, [user]);

    const formik = useFormik({
        initialValues: {
            displayName: '',
            bio: '',
        },
        validationSchema: Yup.object().shape({
            displayName: Yup.string().min(1),
            bio: Yup.string().min(1),
        }),

        onSubmit(data) {
            setLoading(true);
            saveProfile(data);
            saveAction({
                userId: user.uid,
                action: 'updated',
                message: 'Profile and Visibility',
                date: new Date(),
            });
            setLoading(false);
        },
    });

    const getImageURL = async () => {
        if (avatar) {
            const imageRef = ref(storage, 'image');
            try {
                await uploadBytes(imageRef, avatar);
                return getDownloadURL(imageRef);
            } catch (e) {
                console.error(e.message, "error getting image's url");
            }
        } else {
            return null;
        }
    };

    const saveProfile = async (data) => {
        try {
            const imageURL = await getImageURL();
            await updateProfile(user, {
                displayName: data.displayName || user.displayName,
                photoURL: imageURL || user.photoURL,
            });
            setToast({
                onShow: true,
                body: {
                    message: 'Saved data successfully',
                    status: 'success',
                },
            });
        } catch (e) {
            setToast({
                onShow: true,
                body: {
                    message: 'Error saving profile',
                    status: 'error',
                },
            });
            console.error(e.message, 'error saving profile');
        }
        setTimeout(() => {
            setToast((prev) => ({ ...prev, onShow: false }));
        }, 3000);
    };

    const handlePreviewAvatar = (e) => {
        const file = e.target.files[0];
        if (file) {
            file.preview = URL.createObjectURL(file);
            setPreviewAvatar(file);
            setAvatar(file);
        }
    };

    return (
        <form onSubmit={formik.handleSubmit} className="px-12 py-6 grid grid-cols-4">
            <section className="flex items-start justify-center p-3">
                <div className="avatar">
                    {skeleton ? (
                        <div className="w-32 rounded-full animate-pulse relative bg-slate-300"></div>
                    ) : (
                        <div className="w-32 rounded-full relative">
                            <input
                                onChange={handlePreviewAvatar}
                                className="absolute opacity-0"
                                name="avatar"
                                id="avatar"
                                type="file"
                            />
                            <label htmlFor="avatar" className="cursor-pointer hover:opacity-70 ease duration-200">
                                <img src={previewAvatar?.preview || user?.photoURL} alt={user?.displayName} />
                            </label>
                        </div>
                    )}
                </div>
            </section>
            <section className="col-span-3 p-3">
                {skeleton ? (
                    <h1 className="rounded-md py-3 bg-slate-300 animate-pulse text-slate-300 w-1/2">something</h1>
                ) : (
                    <h1 className="py-3 font-semibold text-3xl text-slate-600">{user?.displayName}</h1>
                )}
                <div>
                    <UserTab loading={loading} formik={formik} user={user} setToast={setToast} />
                </div>
            </section>
            {toast.onShow && <Toast placement="bottom-end" message={toast.body.message} status={toast.body.status} />}
        </form>
    );
}

export default Profile;
