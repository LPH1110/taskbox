import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

import { Button } from '~/components';

function TeamPlan() {
    return (
        <div className="h-full relative px-4 py-8 shadow-lg rounded-xl bg-blue-400">
            <span className="absolute right-2.5 top-2.5 text-white px-2 bg-blue-300 rounded-md">Recommended</span>

            <div className="text-white">
                <h4 className="font-semibold text-lg">Team </h4>
                <p className="text-slate-100">Your entire team in one place.</p>
            </div>
            <div className="pt-4 text-white">
                <h2 className="font-bold text-3xl">$249</h2>
                <p className="text-slate-100">/year</p>
            </div>
            <Button
                className="rounded-md mt-4 text-slate-700 bg-white hover:bg-slate-100 font-semibold ease-in-out duration-200 w-full"
                size="large"
                type="button"
            >
                Try for Free
            </Button>
            <ul className="pt-4 text-white">
                <li className="flex items-center py-1">
                    <span className="mr-2">
                        <CheckIcon className="w-4 h-4" />
                    </span>
                    Everything in Pro plan
                </li>
                <li className="flex items-center py-1">
                    <span className="mr-2">
                        <CheckIcon className="w-4 h-4" />
                    </span>
                    Unlimited team members
                </li>
                <li className="flex items-center py-1">
                    <span className="mr-2">
                        <CheckIcon className="w-4 h-4" />
                    </span>
                    Collaborative workspace
                </li>
                <li className="flex items-center py-1">
                    <span className="mr-2">
                        <CheckIcon className="w-4 h-4" />
                    </span>
                    Sharing permission
                </li>
                <li className="flex items-center py-1">
                    <span className="mr-2">
                        <CheckIcon className="w-4 h-4" />
                    </span>
                    Admin tools
                </li>
            </ul>
        </div>
    );
}

export default TeamPlan;
