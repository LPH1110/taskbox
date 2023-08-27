import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

import { Button } from '~/components';

function ProfessionalPlan() {
    return (
        <div className="h-full px-4 py-8 shadow-lg rounded-xl">
            <div className="">
                <h4 className="font-semibold text-lg">Professional</h4>
                <p className="text-slate-500">For user who want to do more.</p>
            </div>
            <div className="pt-4">
                <h2 className="font-bold text-3xl">$99</h2>
                <p className="text-slate-500">/year</p>
            </div>
            <Button
                className="rounded-md mt-4 text-white bg-blue-500 hover:bg-blue-400 font-semibold ease-in-out duration-200 w-full"
                size="large"
                type="button"
            >
                Try for Free
            </Button>
            <ul className="pt-4">
                <li className="flex items-center py-1">
                    <span className="text-emerald-500 mr-2">
                        <CheckIcon className="w-4 h-4" />
                    </span>
                    Everything in Free plan
                </li>
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
                    30 day version history
                </li>
            </ul>
        </div>
    );
}

export default ProfessionalPlan;
