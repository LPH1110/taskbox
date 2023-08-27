import React from 'react';

import { Button, Spinner } from '~/components';

function UserInfoForm({ loading, formik, user, setToast }) {
    return (
        <div className="w-1/2">
            <section className="flex flex-col mb-2">
                <label className="text-slate-600 font-semibold" htmlFor="displayName">
                    Display Name
                </label>
                <input
                    className="my-2 border border-slate-200 p-2 ring ring-transparent focus:ring-blue-500 outline-none rounded-md ease duration-200"
                    name="displayName"
                    id="displayName"
                    type="text"
                    value={formik.values.displayName}
                    onChange={formik.handleChange}
                    placeholder="Your profile display name"
                />
                {formik.touched.displayName && formik.errors.displayName ? (
                    <span className="text-red-400">{formik.errors.displayName}</span>
                ) : null}
            </section>
            <section className="flex flex-col mb-2">
                <label className="text-slate-600 font-semibold" htmlFor="bio">
                    Bio
                </label>
                <textarea
                    className="my-2 border border-slate-200 p-2 ring ring-transparent focus:ring-blue-500 outline-none rounded-md ease duration-200"
                    name="bio"
                    id="bio"
                    type="text"
                    value={formik.values.bio}
                    onChange={formik.handleChange}
                    placeholder="Say something about you..."
                />
                {formik.touched.bio && formik.errors.bio ? (
                    <span className="text-red-400">{formik.errors.bio}</span>
                ) : null}
            </section>
            <Button
                type="submit"
                size="large"
                leftIcon={loading && <Spinner className="w-5 h-5" />}
                className="w-full bg-blue-600 text-slate-100 hover:bg-blue-500 ease-in-out duration-200 font-semibold"
            >
                Save
            </Button>
        </div>
    );
}

export default UserInfoForm;
