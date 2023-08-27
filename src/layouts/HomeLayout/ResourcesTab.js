import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '~/components';

const resources = [
    {
        id: uuidv4(),
        title: 'Taskbox guide',
        href: '/guide',
        desc: 'Our easy to follow workflow guide will take you from project set-up to Taskbox expert in no time.',
    },
    {
        id: uuidv4(),
        title: 'Remote work guide',
        href: '/remote-work',
        desc: 'The complete guide to setting up your team for remote work success.',
    },
    {
        id: uuidv4(),
        title: 'Webinars',
        href: '/webinars',
        desc: 'Enjoy our Taskbox webinars and become a productivity professional.',
    },
    {
        id: uuidv4(),
        title: 'Customer stories',
        href: '/customers',
        desc: 'See how businesses have adopted Taskbox as a vital part of their workflow.',
    },
    {
        id: uuidv4(),
        title: 'Developers',
        href: '/developers',
        desc: "The sky's the limit in what you can deliver to Taskbox users in your Power-Up! ",
    },
    {
        id: uuidv4(),
        title: 'Help resources',
        href: '/supports',
        desc: 'Need Help? Articles and FAQs to get you unstuck.',
    },
];

const Resource = ({ data }) => {
    const classes = `rounded-md p-3.5 hover:bg-indigo-100/50 ease-in-out duration-100`;

    return (
        <a className={classes} href={data.href}>
            <h4 className="pb-2 font-semibold text-slate-600">{data.title}</h4>
            <p className="text-slate-500 text-sm">{data.desc}</p>
        </a>
    );
};

function ResourcesTab() {
    return (
        <div className="grid grid-cols-3 h-full select-none">
            {/* Left board */}
            <div className="p-7 col-span-2 bg-inherit flex items-start justify-center">
                <div className="inline-block">
                    <h4 className="pb-3 mx-3.5 mb-2 border-b border-slate-300 font-semibold text-lg text-slate-600">
                        Learn & connect
                    </h4>
                    {/* List of resources */}
                    <div className="grid grid-cols-3 gap-3">
                        {resources.map((resource) => (
                            <Resource key={resource.id} data={resource} />
                        ))}
                    </div>
                </div>
            </div>
            {/* Right board */}
            <div className="bg-indigo-50 p-7 flex items-start justify-start">
                <div className="mx-3.5 inline-block">
                    <h4 className="mb-3.5 pb-3 border-b border-indigo-500 font-semibold text-lg text-slate-600">
                        Helping teams work better, together
                    </h4>
                    {/* List of usecases */}
                    <p>
                        Discover Taskbox use cases, productivity tips, best practices for team collaboration, and expert
                        remote work advice.
                    </p>
                    <Button
                        size="large"
                        type="button"
                        className="rounded-md mt-3.5 bg-white border border-indigo-500 text-slate-700 hover:bg-indigo-100 ease-in-out duration-200"
                    >
                        Check out Taskbox blogs
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ResourcesTab;
