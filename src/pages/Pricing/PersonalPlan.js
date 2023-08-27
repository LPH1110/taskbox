import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

import { Button } from '~/components';

function PersonalPlan() {
    return (
        <div className="h-full px-4 py-8 shadow-lg rounded-xl">
            <div className="">
                <h4 className="font-semibold text-lg">Personal</h4>
                <p className="text-slate-500">Perfect plan for Starters</p>
            </div>
            <div className="pt-4">
                <h2 className="font-bold text-3xl">Free</h2>
                <p className="text-slate-500">For a life time</p>
            </div>
            <Button
                className="rounded-md mt-4 text-slate-500 hover:text-blue-500 hover:border-blue-500 ease-in-out duration-200 w-full border border-slate-200"
                size="large"
                type="button"
            >
                Current Plan
            </Button>
            <ul className="pt-4">
                <li className="flex items-center py-1">
                    <span className="text-emerald-500 mr-2">
                        <CheckIcon className="w-4 h-4" />
                    </span>
                    Unlimited Projects
                </li>
                <li className="flex items-center py-1">
                    <span className="text-emerald-500 mr-2">
                        <CheckIcon className="w-4 h-4" />
                    </span>
                    Share with 5 team members
                </li>
                <li className="flex items-center py-1">
                    <span className="text-emerald-500 mr-2">
                        <CheckIcon className="w-4 h-4" />
                    </span>
                    Sync across devices
                </li>
            </ul>
        </div>
    );
}

export default PersonalPlan;
