import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '~/components';
import { StarsCircleIcon, RobotIcon, RocketIcon, TemplateIcon, IntegrationIcon } from '~/components/Icons';

const features = [
    {
        id: uuidv4(),
        title: 'Views',
        href: '/views',
        icon: <StarsCircleIcon />,
        desc: "View your team's project from every angle.",
    },
    {
        id: uuidv4(),
        title: 'Automation',
        href: '/automation',
        icon: <RobotIcon />,
        desc: 'Automate tasks and workflows with Butler automation.',
    },
    {
        id: uuidv4(),
        title: 'Power-Ups',
        href: '/power-ups',
        icon: <RocketIcon />,
        desc: 'Power up your team by linking their favorite tools with Taskbox plugins.',
    },
    {
        id: uuidv4(),
        title: 'Teamplates',
        href: '/templates',
        icon: <TemplateIcon />,
        desc: 'Give your team a blueprint for success with easy-to-use templates from industry leaders and the Taskbox commnunity.',
    },
    {
        id: uuidv4(),
        title: 'Integrations',
        href: '/integrations',
        icon: <IntegrationIcon />,
        desc: 'Find the apps your team is already using or discover new ways to get work done in Taskbox.',
    },
];

const Feature = ({ data }) => {
    const classes = `rounded-md p-3.5 hover:bg-indigo-100/50 ease-in-out duration-100`;

    return (
        <a className={classes} href={data.href}>
            <h4 className="pb-2 flex items-center font-semibold text-slate-600">
                <span className="mr-2.5 w-5 h-5">{data.icon}</span>
                {data.title}
            </h4>
            <p className="text-slate-500 text-sm">{data.desc}</p>
        </a>
    );
};

function FeaturesTab() {
    return (
        <div className="grid grid-cols-3 h-full select-none">
            {/* Left board */}
            <div className="p-7 col-span-2 bg-inherit flex items-start justify-center">
                <div className="inline-block">
                    <h4 className="pb-3 mx-3.5 mb-2 border-b border-slate-300 font-semibold text-lg text-slate-600">
                        Explore the features that help your team succeed
                    </h4>
                    {/* List of resources */}
                    <div className="grid grid-cols-3 gap-3">
                        {features.map((resource) => (
                            <Feature key={resource.id} data={resource} />
                        ))}
                    </div>
                </div>
            </div>
            {/* Right board */}
            <div className="bg-indigo-50 p-7 flex items-start justify-start">
                <div className="mx-3.5 inline-block">
                    <h4 className="mb-3.5 pb-3 border-b border-indigo-500 font-semibold text-lg text-slate-600">
                        Meet Taskbox Demo
                    </h4>
                    {/* List of usecases */}
                    <p className="text-slate-500">
                        Taskbox makes it easy for your team to get work done. No matter the project, workflow, or type
                        of team, Taskbox can help keep things organized. It’s simple – sign-up, create a board, and
                        you’re off! Productivity awaits.
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

export default FeaturesTab;
