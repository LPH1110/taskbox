import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '~/contexts/AuthContext';

import { Button, Spinner } from '~/components';
import updateActiveStatus from '~/lib/api/updateActiveStatus';

function GoogleSignInBtn({ setToast }) {
    const navigate = useNavigate();
    const [showSpinner, setShowSpinner] = useState(false);
    const { googleSignIn, user } = UserAuth();

    useEffect(() => {
        if (user != null) {
            setShowSpinner(false);
            updateActiveStatus({ email: user?.email, online: true });
            navigate('/');
        }
    }, [user]);

    const handleGoogleSignIn = async () => {
        setShowSpinner(true);
        try {
            await googleSignIn();
        } catch (e) {
            console.error(e);
            setToast({
                onShow: true,
                body: {
                    message: 'Failed to authenticate your google account',
                    status: 'error',
                },
            });
            setTimeout(() => {
                setToast((prev) => ({ ...prev, onShow: false }));
            }, 3000);
            setShowSpinner(false);
        }
    };
    return (
        <div>
            <Button
                onClick={handleGoogleSignIn}
                size="large"
                leftIcon={
                    <img
                        className="w-5 h-5"
                        src="https://res.cloudinary.com/dzzv49yec/image/upload/v1671615696/taskbox-assets/google_f8flbm.png"
                        alt="Google"
                    />
                }
                className="mx-0 mt-4 w-full text-slate-600 hover:bg-slate-100 border boder-slate-200 ease-in-out duration-200"
                type="button"
            >
                {showSpinner ? <Spinner className="w-5 h-5" /> : 'Sign in with Google'}
            </Button>
        </div>
    );
}

export default GoogleSignInBtn;
