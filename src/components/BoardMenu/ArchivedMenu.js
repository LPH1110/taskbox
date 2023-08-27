import React from 'react';
import { useState } from 'react';

const Lists = (lists) => {
    return lists.length > 0 ? (
        <div>Lists</div>
    ) : (
        <div className="h-24 rounded-md flex bg-slate-100 justify-center items-center">
            <h4 className="text-sm text-no-result">No archived lists</h4>
        </div>
    );
};

const Cards = (cards) => {
    return cards.length > 0 ? (
        <div>Cards</div>
    ) : (
        <div className="h-24 rounded-md flex bg-slate-100 justify-center items-center">
            <h4 className="text-sm text-no-result">No archived cards</h4>
        </div>
    );
};

const ArchivedMenu = () => {
    const [searchValue, setSearchValue] = useState('');
    const [toggle, setToggle] = useState(false);
    const [lists, setLists] = useState([]);

    return (
        <div className="flex flex-col justify-start gap-4 w-full">
            <div className="w-full flex items-center justify-between gap-2">
                <input
                    placeholder="Search archive..."
                    className="flex-1 text-sm outline-none p-2 ring-2 ring-slate-100 focus:ring-blue-500 ease duration-100 rounded-sm"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
                <button
                    className="h-full bg-slate-100 hover:bg-slate-200 ease duration-100 rounded-sm py-2 px-3 text-sm"
                    type="button"
                    onClick={() => setToggle((prev) => !prev)}
                >
                    {toggle ? 'Switch to lists' : 'Switch to cards'}
                </button>
            </div>
            {toggle ? <Cards /> : <Lists />}
        </div>
    );
};

export default ArchivedMenu;
