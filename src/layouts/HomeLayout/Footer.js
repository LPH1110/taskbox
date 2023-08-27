import React from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Button } from '~/components';
import images from '~/assets';

const footNavigations = [
    {
        id: uuidv4(),
        title: 'Product',
        items: [
            {
                id: uuidv4(),
                name: 'Product Overview',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'App & Intergrations',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'Templates',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'Box for Designer',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'Box for Developer',
                to: '/',
            },
        ],
    },
    {
        id: uuidv4(),
        title: 'Solutions',
        items: [
            {
                id: uuidv4(),
                name: 'Flowchart',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'Ideation',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'Agile Workflows',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'Research and Design',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'Concept Map',
                to: '/',
            },
        ],
    },
    {
        id: uuidv4(),
        title: 'Resources',
        items: [
            {
                id: uuidv4(),
                name: 'Help Center',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'Blog',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'Status',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'Taskbox Community',
                to: '/',
            },
        ],
    },
    {
        id: uuidv4(),
        title: 'Company',
        items: [
            {
                id: uuidv4(),
                name: 'About us',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'Careers',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'Customer Stories',
                to: '/',
            },
        ],
    },
    {
        id: uuidv4(),
        title: 'Plans and Pricing',
        items: [
            {
                id: uuidv4(),
                name: 'Personal',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'Business',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'Enterprise',
                to: '/',
            },
            {
                id: uuidv4(),
                name: 'Education',
                to: '/',
            },
        ],
    },
];

function Footer() {
    return (
        <section className="px-12 col-span-12">
            {/* Navigations */}
            <div className="grid grid-cols-6 gap-x-6 py-12 mb-12">
                <div>
                    <Button size="small" href="/" className="flex mr-2 justify-start">
                        <span className="font-semibold text-4xl text-blue-600">T</span>
                        <p className="text-xl">askbox</p>
                    </Button>
                </div>
                {footNavigations.map((nav) => (
                    <div key={nav.id}>
                        <h4 className="mb-2 text-lg font-semibold">{nav.title}</h4>
                        <ul>
                            {nav.items.map((item) => (
                                <li
                                    className="py-1 text-slate-500 hover:text-blue-500 ease duration-200 hover:pl-1"
                                    key={item.id}
                                >
                                    <Link to={item.to}>{item.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            {/* Copyright */}
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center">
                    <Button
                        size="small"
                        className="font-semibold text-slate-700 hover:text-slate-500 ease duration-200"
                        leftIcon={<GlobeAltIcon className="w-4 h-4" />}
                        rightIcon={<ChevronDownIcon className="w-4 h-4" />}
                    >
                        English
                    </Button>
                    <p className="text-slate-400">@Taskbox 2022. All right reserved.</p>
                </div>
                {/* Socials */}
                <div className="flex items-center">
                    <Button
                        type="button"
                        size="small"
                        className="p-2 rounded-full hover:bg-slate-200 ease-in-out duration-200"
                    >
                        <a href="https://twitter.com" className="w-5 h-5">
                            <img src={images.twitterIcon} alt="twitter" />
                        </a>
                    </Button>
                    <Button
                        type="button"
                        size="small"
                        className="p-2 rounded-full hover:bg-slate-200 ease-in-out duration-200"
                    >
                        <a href="https://facebook.com" className="w-5 h-5">
                            <img src={images.facebookIcon} alt="facebook" />
                        </a>
                    </Button>
                    <Button
                        type="button"
                        size="small"
                        className="p-2 rounded-full hover:bg-slate-200 ease-in-out duration-200"
                    >
                        <a href="https://instagram.com" className="w-5 h-5">
                            <img src={images.instagramIcon} alt="instagram" />
                        </a>
                    </Button>
                </div>
            </div>
        </section>
    );
}

export default Footer;
