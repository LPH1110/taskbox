import React from 'react';

function IconButton({ children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="text-slate-600 p-2 rounded-full hover:bg-slate-100 ease-in-out duration-200"
        >
            {children}
        </button>
    );
}

export default IconButton;
