import React from 'react';
import classNames from 'classnames/bind';
import styles from './Issues.module.scss';
import {
    CreditCardIcon,
    ChatBubbleLeftRightIcon,
    DocumentMagnifyingGlassIcon,
    ChartPieIcon,
} from '@heroicons/react/24/outline';
import { Button } from '~/components';

const cx = classNames.bind(styles);

function Issues() {
    return (
        <section className={cx('wrapper', 'h-screen')}>
            {/* Header */}
            <section className="px-4">
                <section className="min-h-[5rem] py-4 flex items-center justify-between">
                    <h1 className="text-slate-600 text-2xl font-semibold">Support Center</h1>
                </section>
            </section>
            <section className="bg-slate-100/50 h-full">
                <section className="grid grid-cols-2 gap-8 p-8">
                    {/* Documentation */}
                    <div className="flex select-none shadow-md items-start bg-white p-3 rounded-xl">
                        <div className="mr-4 p-3 rounded-full bg-orange-100/70">
                            <span className="text-orange-500 font-bold">
                                <DocumentMagnifyingGlassIcon className="w-6 h-6" />
                            </span>
                        </div>
                        <div>
                            <h4 className="text-2xl font-semibold text-slate-600">Documentation</h4>
                            <p className="text-slate-500 text-md">Get help using and administering products</p>
                            <Button
                                className="rounded-md bg-orange-100 mt-4 text-orange-500 hover:bg-orange-100/70 ease-in-out duration-200 font-semibold"
                                type="button"
                                size="medium"
                            >
                                View documentation
                            </Button>
                        </div>
                    </div>
                    {/* Community */}
                    <div className="flex select-none shadow-md items-start bg-white p-3 rounded-xl">
                        <div className="mr-4 p-3 rounded-full bg-blue-100/70">
                            <span className="text-blue-500 font-bold">
                                <ChatBubbleLeftRightIcon className="w-6 h-6" />
                            </span>
                        </div>
                        <div>
                            <h4 className="text-2xl font-semibold text-slate-600">Community</h4>
                            <p className="text-slate-500 text-md">
                                Find answers, support, and inspiration from other taskboxers
                            </p>
                            <Button
                                className="rounded-md bg-blue-100 mt-4 text-blue-500 hover:bg-blue-100/70 ease-in-out duration-200 font-semibold"
                                type="button"
                                size="medium"
                            >
                                View the community
                            </Button>
                        </div>
                    </div>
                    {/* System */}
                    <div className="flex select-none shadow-md items-start bg-white p-3 rounded-xl">
                        <div className="mr-4 p-3 rounded-full bg-sky-100/70">
                            <span className="text-sky-500 font-bold">
                                <ChartPieIcon className="w-6 h-6" />
                            </span>
                        </div>
                        <div>
                            <h4 className="text-2xl font-semibold text-slate-600">System status</h4>
                            <p className="text-slate-500 text-md">
                                Check the health of our cloud services and products
                            </p>
                            <Button
                                className="rounded-md bg-sky-100 mt-4 text-sky-500 hover:bg-sky-100/70 ease-in-out duration-200 font-semibold"
                                type="button"
                                size="medium"
                            >
                                View system status
                            </Button>
                        </div>
                    </div>
                    {/* Billing */}
                    <div className="flex select-none shadow-md items-start bg-white p-3 rounded-xl">
                        <div className="mr-4 p-3 rounded-full bg-emerald-100/70">
                            <span className="text-emerald-500 font-bold">
                                <CreditCardIcon className="w-6 h-6" />
                            </span>
                        </div>
                        <div>
                            <h4 className="text-2xl font-semibold text-slate-600">Billing & licensing</h4>
                            <p className="text-slate-500 text-md">See FAQs about billing and licensing</p>
                            <Button
                                className="rounded-md bg-emerald-100 mt-4 text-emerald-500 hover:bg-emerald-100/70 ease-in-out duration-200 font-semibold"
                                type="button"
                                size="medium"
                            >
                                View FAQs
                            </Button>
                        </div>
                    </div>
                </section>
            </section>
        </section>
    );
}

export default Issues;
