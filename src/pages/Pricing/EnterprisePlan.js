import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

import { Button } from '~/components';

function EnterprisePlan() {
    return (
        <div className="h-full px-4 py-8 shadow-lg rounded-xl">
            <div className="">
                <h4 className="font-semibold text-lg">Enterprise</h4>
                <p className="text-slate-500">Run your company on your terms.</p>
            </div>
            <div className="pt-4">
                <h2 className="font-bold text-3xl">Custom</h2>
                <p className="text-slate-500">Reach out for a quote</p>
            </div>
            <Button
                className="rounded-md mt-4 text-white bg-blue-500 hover:bg-blue-400 font-semibold ease-in-out duration-200 w-full"
                size="large"
                type="button"
            >
                Contact us
            </Button>
            <ul className="pt-4">
                <li className="flex items-center py-1">
                    <span className="text-emerald-500 mr-2">
                        <CheckIcon className="w-4 h-4" />
                    </span>
                    Everything in Team plan
                </li>
                <li className="flex items-center py-1">
                    <span className="text-emerald-500 mr-2">
                        <CheckIcon className="w-4 h-4" />
                    </span>
                    Advanced Security
                </li>
                <li className="flex items-center py-1">
                    <span className="text-emerald-500 mr-2">
                        <CheckIcon className="w-4 h-4" />
                    </span>
                    Custom contact
                </li>
                <li className="flex items-center py-1">
                    <span className="text-emerald-500 mr-2">
                        <CheckIcon className="w-4 h-4" />
                    </span>
                    User provisioning (SCIM)
                </li>
                <li className="flex items-center py-1">
                    <span className="text-emerald-500 mr-2">
                        <CheckIcon className="w-4 h-4" />
                    </span>
                    SAML SSO
                </li>
            </ul>
        </div>
    );
}

export default EnterprisePlan;
