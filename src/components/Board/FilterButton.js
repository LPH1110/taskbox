import React from 'react';

const FilterButton = ({ onClick, title, leftIcon, rightIcon }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="text-slate-500 hover:text-slate-700 py-2 px-3 flex items-center gap-2 bg-white rounded-md hover:bg-blue-100/50 ease duration-100"
        >
            {leftIcon && <span className="w-5 h-5">{leftIcon}</span>}
            {title}
            {rightIcon && <span className="w-5 h-5">{rightIcon}</span>}
        </button>
    );
};

export default FilterButton;
