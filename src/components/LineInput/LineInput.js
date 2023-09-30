import React from 'react';
import Button from '../Button';

const LineInput = ({
    name,
    value,
    handleChange,
    handleSubmit,
    touched,
    errors,
    label,
    placeholder = '',
    required = false,
}) => {
    return (
        <section className="flex flex-col w-full">
            {label && (
                <label className="text-slate-600 font-semibold" htmlFor="email">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="flexBetween gap-2">
                <input
                    className="w-full border border-slate-200 p-2 ring ring-transparent focus:ring-blue-500 outline-none rounded-sm ease duration-200"
                    name={name}
                    id={name}
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(name, e.target.value)}
                    placeholder={placeholder}
                />
                <Button
                    onClick={handleSubmit}
                    size="medium"
                    type="submit"
                    className="bg-blue-500 text-white hover:bg-blue-500/80 ease duration-200 rounded-sm"
                >
                    Share
                </Button>
            </div>
            {errors ? <span className="text-red-400">{errors}</span> : null}
        </section>
    );
};

export default LineInput;
