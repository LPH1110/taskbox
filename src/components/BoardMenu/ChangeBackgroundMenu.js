import React from 'react';
import { Spacer } from '~/components';
import { PlusIcon } from '@heroicons/react/24/solid';

const ChangeBackgroundMenu = () => {
    return (
        <>
            <div className="flex w-full gap-2">
                <button type="button" className="flex flex-col items-center gap-2 w-full">
                    <div
                        className="image w-full h-24 rounded-md"
                        style={{ backgroundImage: 'url(https://trello.com/assets/8f9c1323c9c16601a9a4.jpg)' }}
                    ></div>
                    <h4>Photos</h4>
                </button>
                <button type="button" className="flex flex-col items-center gap-2 w-full">
                    <div
                        className="image w-full h-24 rounded-md"
                        style={{ backgroundImage: 'url(https://trello.com/assets/97db30fe74a58b7b7a18.png)' }}
                    ></div>
                    <h4>Colors</h4>
                </button>
            </div>
            <Spacer />
            <div className="w-full">
                <h3 className="font-semibold text-lg">Custom</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <button
                        type="button"
                        className="h-24 bg-slate-100 w-full flex items-center justify-center rounded-md hover:bg-slate-200 ease duration-200"
                    >
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChangeBackgroundMenu;
