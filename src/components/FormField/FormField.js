import React from 'react';

const FormField = ({ name, value, handleChange, touched, errors, label, placeholder = '', required = false }) => {
    return (
        <section className="flex flex-col mb-2">
            {label && (
                <label className="text-slate-600 font-semibold" htmlFor="email">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                className="my-2 border border-slate-200 p-2 ring ring-transparent focus:ring-blue-500 outline-none rounded-md ease duration-200"
                name={name}
                id={name}
                autoComplete="off"
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
            />
            {touched && errors ? <span className="text-red-400">{errors}</span> : null}
        </section>
    );
};

export default FormField;
