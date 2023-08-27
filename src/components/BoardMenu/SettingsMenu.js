import React from 'react';
import Spacer from '../Spacer/Spacer';

const SettingsMenu = () => {
    return (
        <>
            <div className="w-full">
                <h4 className="font-semibold">Workspace</h4>
                <button type="button" className="p-2 w-full text-left hover:bg-slate-100 ease duration-200 rounded-md">
                    Le Phu Hao's workspaces
                </button>
            </div>
            <Spacer />
            <div className="w-full">
                <h4 className="font-semibold">Permissions</h4>
                <button type="button" className="p-2 w-full text-left hover:bg-slate-100 ease duration-200 rounded-md">
                    <h4>Commenting</h4>
                    <p className="text-description text-sm">Members</p>
                </button>
                <button type="button" className="p-2 w-full text-left hover:bg-slate-100 ease duration-200 rounded-md">
                    <h4>Adding and removing members</h4>
                    <p className="text-description text-sm">Members</p>
                </button>
                <button type="button" className="p-2 w-full text-left hover:bg-slate-100 ease duration-200 rounded-md">
                    <h4>Workspace editing</h4>
                    <p className="text-description text-sm">Any Workspace member can edit and join this board.</p>
                </button>
            </div>
            <Spacer />
            <div className="w-full">
                <h4 className="font-semibold">Covers</h4>
                <button type="button" className="p-2 w-full text-left hover:bg-slate-100 ease duration-200 rounded-md">
                    <h4>Card covers enabled</h4>
                    <p className="text-description text-sm">Show image attachments and colors on the front of cards.</p>
                </button>
            </div>
            <Spacer />
            <div className="w-full">
                <h4 className="font-semibold">Collections</h4>
                <div className="flex flex-col items-start justify-between w-full gap-3 bg-blue-100 rounded-sm p-4">
                    <h4 className="font-semibold">Upgrade to organize your boards</h4>
                    <p className="text-sm text-description">
                        Create collections based on team, topic, project or anything else with Taskbox Preium.
                    </p>
                    <div className="flex items-start justify-between">
                        <button type="button" className="underline hover:text-slate-500 ease duration-100">
                            Start free trial
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SettingsMenu;
