import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import emailjs from '@emailjs/browser';
import axios from 'axios';

import { Button, Spinner, Toast } from '~/components';
import { useStore, actions } from '~/store';
import NewPassword from './NewPassword';
import { UserAuth } from '~/contexts/AuthContext';

const emailjs_service_id = 'service_7h1hbr1';
const emailjs_template_id = 'template_qpkmuxc';
const emailjs_public_key = 'A3Uj8TuJqV8IVObAM'; // EMAILJS API KEY

function ForgotPassword() {
    const { resetPassword } = UserAuth();
    const [state, dispatch] = useStore();
    const navigate = useNavigate();
    const [showSpinner, setShowSpinner] = useState(false);
    const [forward, setForward] = useState(false);
    const [typedEmail, setTypedEmail] = useState();
    const [toast, setToast] = useState({
        onShow: false,
        body: {
            message: '',
            status: '',
        },
    });
    const [timeout, setTimeOut] = useState('');

    useEffect(() => {
        return () => clearTimeout(timeout);
    }, []);

    const sendOTP = async (data) => {
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        dispatch(actions.setOTPcode(otpCode));
        setTimeOut(setTimeout(() => dispatch(actions.setOTPcode('')), 300000));

        // try {
        //     const res = await emailjs.send(
        //         emailjs_service_id,
        //         emailjs_template_id,
        //         {
        //             from_name: 'Taskbox Team',
        //             to_email: data.email,
        //             to_name: 'taskboxer',
        //             message: otpCode,
        //         },
        //         emailjs_public_key,
        //     );
        //     console.log('SENT SUCCESS!', res.status, res.text);
        // } catch (e) {
        //     console.log('SENT FAILED...', e);
        // }
    };

    const formik = useFormik({
        initialValues: {
            email: '',
        },

        validationSchema: Yup.object().shape({
            email: Yup.string().email('Invalid email address').required('Required field'),
        }),

        onSubmit(data) {
            setShowSpinner(true);

            sendOTP(data);
            setShowSpinner(false);
            setTypedEmail(data.email);
            setForward(true);
        },
    });
    return (
        <section className="h-screen grid grid-cols-2">
            <section className="flex items-center justify-center">
                <section className="w-[60%] flex flex-col items-start justify-between">
                    {forward ? (
                        <NewPassword setToast={setToast} typedEmail={typedEmail} />
                    ) : (
                        <div className="w-full mt-8">
                            <div className="py-4 mb-4">
                                <h1 className="mb-1 text-slate-700 font-semibold text-3xl">Forgot Password</h1>
                                <p className="text-slate-500">We will send a verification code to your typed email</p>
                            </div>
                            <form onSubmit={formik.handleSubmit}>
                                <section className="flex flex-col mb-2">
                                    <label className="text-slate-600 font-semibold" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        className={`my-2 border border-slate-200 p-2 ring ring-transparent ${
                                            formik.errors.email ? 'ring-red-400' : 'focus:ring-blue-500'
                                        } outline-none rounded-md ease duration-200`}
                                        name="email"
                                        id="email"
                                        type="text"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        placeholder="Enter your email"
                                    />
                                    {formik.touched.email && formik.errors.email ? (
                                        <span className="text-red-400">{formik.errors.email}</span>
                                    ) : null}
                                </section>

                                <Button
                                    size="large"
                                    className="mt-4 w-full font-semibold bg-blue-500 text-white hover:bg-blue-400 ease-in-out duration-200"
                                    type="submit"
                                    leftIcon={showSpinner ? <Spinner className="w-5 h-5" /> : null}
                                >
                                    Verify email
                                </Button>
                                <p className="text-left py-4">
                                    Already have a password?
                                    <button
                                        type="button"
                                        onClick={() => navigate('/signin')}
                                        className="hover:underline ml-2 text-blue-500 hover:text-blue-400 ease duration-200"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            </form>
                        </div>
                    )}
                </section>
            </section>
            <section className="bg-blue-500"></section>
            {toast.onShow && <Toast placement="bottom-end" message={toast.body.message} status={toast.body.status} />}
        </section>
    );
}

export default ForgotPassword;
