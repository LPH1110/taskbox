import React, { useState, useEffect } from 'react';
import {
    ClockIcon,
    MapPinIcon,
    ArrowTopRightOnSquareIcon,
    XMarkIcon,
    QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import styles from './MeetingCard.module.scss';
import { Button } from '~/components';

const cx = classNames.bind(styles);

function MeetingCard() {
    return (
        <div className={cx('card', 'relative p-5 grid grid-cols-4 gap-x-6')}>
            <div className="flex flex-col justify-between">
                <h4 className="font-semibold text-slate-600 mb-1">Design Start-up</h4>
                <p className="flex items-center text-slate-400">
                    <span className="mr-1">
                        <ClockIcon className="w-5 h-5" />
                    </span>
                    11:45 PM
                </p>
            </div>
            <div>
                {/* Avatar Group */}
                <Button type="button" className="">
                    <div className="avatar-group -space-x-4">
                        <div className="avatar">
                            <div className="w-6">
                                <img src="https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar4_n1nbbs.jpg" />
                            </div>
                        </div>
                        <div className="avatar">
                            <div className="w-6">
                                <img src="https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar2_fssdbw.jpg" />
                            </div>
                        </div>
                        <div className="avatar">
                            <div className="w-6">
                                <img src="https://res.cloudinary.com/dzzv49yec/image/upload/v1670092118/taskbox-assets/avatar3_clufwp.jpg" />
                            </div>
                        </div>
                        <div className="avatar placeholder">
                            <div className="w-6 bg-blue-100 text-blue-600 font-semibold">
                                <span>+99</span>
                            </div>
                        </div>
                    </div>
                </Button>
                <div className="mt-1 flex items-center text-sm font-semibold">
                    <p className="text-blue-400 mr-2">9 Going</p>
                    <p className="text-red-400">2 Not joining</p>
                    <p></p>
                </div>
            </div>
            <div className="flex flex-col justify-between">
                <h4 className="font-semibold text-slate-600">5 September</h4>
                <p className="flex items-center text-slate-400">
                    <span className="mr-1">
                        <MapPinIcon className="w-4 h-4" />
                    </span>
                    Grand Palace, USA
                </p>
            </div>
            <div className="flex items-center justify-end">
                <Button type="button" className="text-slate-400 hover:text-slate-600 ease duration-200">
                    <span>
                        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                    </span>
                </Button>
                <Button type="button" className="text-slate-400 hover:text-slate-600 ease duration-200">
                    <span>
                        <QuestionMarkCircleIcon className="w-5 h-5" />
                    </span>
                </Button>
                <Button type="button" className="text-slate-400 hover:text-slate-600 ease duration-200">
                    <span>
                        <XMarkIcon className="w-5 h-5" />
                    </span>
                </Button>
            </div>
        </div>
    );
}

export default MeetingCard;
