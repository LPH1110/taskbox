import React, { useEffect } from 'react';
import { CommandLineIcon } from '@heroicons/react/24/solid';
import { v4 as uuidv4 } from 'uuid';
import Usecase from './Usecase';

import { Button } from '~/components';

const colors = ['orange', 'yellow', 'blue', 'sky', 'green'];

const solutions = [
    {
        id: uuidv4(),
        title: 'Marketing teams',
        href: '/teams/marketing',
        icon: <CommandLineIcon className="w-5 h-5" />,
        color: 'orange',
        desc: 'Whether launching a new product, campaign, or creating content, Taskbox will help marketing teams succeed.',
    },
    {
        id: uuidv4(),
        title: 'Product management',
        href: '/teams/product',
        color: 'blue',
        icon: <CommandLineIcon className="w-5 h-5" />,
        desc: "Use Taskbox's management boards and roadmap features to simplify complex projects and processes.",
    },
    {
        id: uuidv4(),
        title: 'Engineering teams',
        href: '/teams/engineering',
        color: 'sky',
        icon: <CommandLineIcon className="w-5 h-5" />,
        desc: 'Ship more code, faster, and give your developers the freedom to be more agile with Taskbox',
    },
    {
        id: uuidv4(),
        title: 'Design teams',
        href: '/teams/design',
        color: 'indigo',
        icon: <CommandLineIcon className="w-5 h-5" />,
        desc: 'Empower your design teams by using Taskbox to streamline creative requests and promote more fluid cross-team collaboration.',
    },
    {
        id: uuidv4(),
        title: 'Startups',
        href: '/teams/startups',
        color: 'violet',
        icon: <CommandLineIcon className="w-5 h-5" />,
        desc: 'From hitting revenue goals to managing workflows, small businesses thrive with Taskbox.',
    },
    {
        id: uuidv4(),
        title: 'Remote teams',
        href: '/teams/remote',
        color: 'emerald',
        icon: <CommandLineIcon className="w-5 h-5" />,
        desc: "Keep your remote team connected and motivated, no matter where they're located around the world.",
    },
];

const usecases = [
    {
        id: uuidv4(),
        title: 'Project management',
        href: '/use-cases/project-management',
        desc: 'Keep tasks in order, deadlines on track, and team members aligned with Taskbox.',
    },
    {
        id: uuidv4(),
        title: 'Brainstorming',
        href: '/use-cases/brainstorming',
        desc: "Unleash your team' creativity and keep ideas visible, collaborative, and actionable.",
    },
    {
        id: uuidv4(),
        title: 'Meetings',
        href: '/use-cases/project-management',
        desc: 'Empower your team meetings to be more productive, empowering, and dare we say-fun.',
    },
];

const Solution = ({ data }) => {
    const classes = `rounded-md p-3.5 hover:bg-indigo-100/50 ease-in-out duration-100`;

    return (
        <a className={classes} href={data.href}>
            <h4 className="pb-2 flex items-center font-semibold text-slate-600">
                <span className="mr-2.5">{data.icon}</span>
                {data.title}
            </h4>
            <p className="text-slate-500 text-sm">{data.desc}</p>
        </a>
    );
};

function SolutionsTab() {
    return (
        <div className="grid grid-cols-3 h-full select-none">
            {/* Left board */}
            <div className="p-7 col-span-2 bg-inherit flex items-start justify-center">
                <div className="inline-block">
                    <h4 className="pb-3 mx-3.5 mb-2 border-b border-slate-300 font-semibold text-lg text-slate-600">
                        Take a page out of these pre-built Taskbox playbooks designed for all teams
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                        {solutions.map((solution) => (
                            <Solution key={solution.id} data={solution} />
                        ))}
                    </div>
                </div>
            </div>
            {/* Right board */}
            <div className="bg-indigo-50 p-7 flex items-start justify-start">
                <div className="inline-block">
                    <h4 className="pb-3 mx-3.5 border-b border-indigo-500 font-semibold text-lg text-slate-600">
                        Our product in action
                    </h4>
                    {/* List of usecases */}
                    <div>
                        {usecases.map((usecase) => (
                            <Usecase key={usecase.id} data={usecase} />
                        ))}
                    </div>
                    <Button
                        size="large"
                        type="button"
                        className="rounded-md bg-white mx-3.5 mt-3.5 border border-indigo-500 text-slate-700 hover:bg-indigo-100 ease-in-out duration-200"
                    >
                        See all use cases
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default SolutionsTab;
