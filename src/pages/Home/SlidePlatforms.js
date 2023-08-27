import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Carousel } from '~/components';
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames/bind';
import styles from './Home.module.scss';

const cx = classNames.bind(styles);

const platforms = [
    {
        id: uuidv4(),
        name: 'Google Drive',
        description: 'Store, share, and work on files and folders together from your phone, tablet or computer.',
        thumbnail:
            'https://res.cloudinary.com/dzzv49yec/image/upload/v1671324012/taskbox-assets/google-drive_axtgr6.png',
    },
    {
        id: uuidv4(),
        name: 'Trello',
        description: 'Collaborate, manage projects, and reach new productivity peaks',
        thumbnail: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1671324012/taskbox-assets/trello_pqvjym.png',
    },
    {
        id: uuidv4(),
        name: 'Zapier',
        description: 'Zapier empowers you to automate your work across 5,000+ apps.',
        thumbnail: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1671324012/taskbox-assets/zapier_duiaw1.png',
    },
    {
        id: uuidv4(),
        name: 'Mailchimp',
        description: 'Mailchimp will help you focus on your most loyal and valuable customers.',
        thumbnail: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1671324012/taskbox-assets/mailchimp_cczrzp.png',
    },
    {
        id: uuidv4(),
        name: 'Microsoft Teams',
        description: 'Make amazing things happen together at home, work, and school.',
        thumbnail:
            'https://res.cloudinary.com/dzzv49yec/image/upload/v1671324012/taskbox-assets/microsoft-team_hft7he.png',
    },
    {
        id: uuidv4(),
        name: 'Notion',
        description: "We're more than a doc. Or a table. Customize Notion at work the way you do.",
        thumbnail: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1671324012/taskbox-assets/notion_gb8jpj.png',
    },
    {
        id: uuidv4(),
        name: 'Zendesk',
        description: 'Build software to meet customer needs, set your team, and keep your business in sync.',
        thumbnail: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1671324012/taskbox-assets/zendesk_o1cb8i.png',
    },
    {
        id: uuidv4(),
        name: 'Dropbox',
        description: 'Dropbox is the choice for storing and sharing your most important files.',
        thumbnail: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1671324012/taskbox-assets/dropbox_q4x4be.png',
    },
    {
        id: uuidv4(),
        name: 'Asana',
        description: 'Asana organizes work so teams know what to do, why it matters, and how to get it done.',
        thumbnail: 'https://res.cloudinary.com/dzzv49yec/image/upload/v1671519755/taskbox-assets/asana_cvx9z2.png',
    },
    {
        id: uuidv4(),
        name: 'Google Calendar',
        description: 'Time-management and scheduling calendar service developed by Google',
        thumbnail:
            'https://res.cloudinary.com/dzzv49yec/image/upload/v1671324012/taskbox-assets/google-calendar_hrmxyp.png',
    },
];

function SlidePlatforms({ className }) {
    const carouselSettings1 = {
        infinite: true,
        speed: 3000,
        lazyLoad: true,
        slidesToShow: 5,
        slidesToScroll: 1,
        arrows: false,
    };
    const carouselSettings2 = {
        infinite: true,
        speed: 3000,
        lazyLoad: true,
        slidesToShow: 5,
        slidesToScroll: 1,
        rtl: true,
        arrows: false,
    };
    return (
        <section className={className}>
            <div className="grid grid-cols-2 mb-6">
                <h1 className="py-12 px-36 text-3xl font-semibold">
                    Connect all your favorite tools, just in one platform
                </h1>
                <p className="text-slate-500 py-12 pr-72">
                    Stop switching between apps to get work done. Keep into flowing in and out of Taskbox and reduce
                    overhead with our integrations
                </p>
            </div>
            <div className="mb-6">
                <Carousel autoplay settings={carouselSettings1}>
                    {platforms.map((app) => (
                        <div key={app.id} className="">
                            <div className="mx-4 bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 p-2 border border-slate-300/50 rounded-lg">
                                        <img src={app.thumbnail} />
                                    </div>
                                    <Button className="hover:bg-slate-100 ease-in-out duration-200 p-3 font-semibold border border-slate-200/50 rounded-full">
                                        <span>
                                            <ArrowUpRightIcon className="w-3 h-3" />
                                        </span>
                                    </Button>
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-slate-700 font-semibold text-lg">{app.name}</h4>
                                    <p className={cx('slide-platform-description', 'text-slate-500')}>
                                        {app.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>
            <div>
                <Carousel autoplay settings={carouselSettings2}>
                    {platforms.map((app) => (
                        <div key={app.id + '1'} className="">
                            <div className="mx-4 bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 p-2 border border-slate-300/50 rounded-lg">
                                        <img src={app.thumbnail} />
                                    </div>
                                    <Button className="hover:bg-slate-100 ease-in-out duration-200 p-3 border border-slate-200/50 rounded-full">
                                        <span>
                                            <ArrowUpRightIcon className="w-3 h-3" />
                                        </span>
                                    </Button>
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-slate-700 font-semibold text-lg">{app.name}</h4>
                                    <p className={cx('slide-platform-description', 'text-slate-500')}>
                                        {app.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>
        </section>
    );
}

export default SlidePlatforms;
