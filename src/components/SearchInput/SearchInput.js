import React, { useRef } from 'react';
import Button from '../Button';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';

const SearchInput = ({ value, setValue, placeholder = 'Search something...', className }) => {
    const inputRef = useRef();

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (!value.startsWith(' ')) {
            setValue(value);
        }
    };

    const handleClearSearchKeys = () => {
        setValue('');
        inputRef.current.focus();
    };
    return (
        <div className={className || 'flex items-center'}>
            <div className="mr-2 ease duration-200 focus-within:ring-blue-500 ring ring-slate-100 flex items-center p-1.5 bg-slate-100 rounded-md">
                <Button type="button" className={value.length > 0 ? 'text-slate-600 mr-2' : 'text-slate-400 mr-2'}>
                    <MagnifyingGlassIcon className="w-5 h-5" />
                </Button>
                <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => handleInputChange(e)}
                    placeholder={placeholder}
                    className="text-slate-600 bg-transparent outline-none"
                />
                {value.length > 0 ? (
                    <span onClick={handleClearSearchKeys}>
                        <XMarkIcon className="w-4 h-4 ml-2" />
                    </span>
                ) : (
                    <span className="w-4 h-4 ml-2"></span>
                )}
            </div>
        </div>
    );
};

export default SearchInput;
