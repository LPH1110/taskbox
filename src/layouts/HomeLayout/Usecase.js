import React from 'react';
import { ArrowSmallRightIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames/bind';
import styles from './HomeLayout.module.scss';

import { Button } from '~/components';

const cx = classNames.bind(styles);

function Usecase({ data }) {
    const { title, desc, href } = data;

    return (
        <a href={href} className={cx('usecase', 'px-3.5 pt-3.5 block')}>
            <h4 className="flex items-center font-semibold text-md text-slate-600 pb-1">
                Use case: {title}
                <Button className="ease duration-200" size="small" type="button">
                    <span className="text-indigo-500 font-bold">
                        <ArrowSmallRightIcon className="w-6 h-6" />
                    </span>
                </Button>
            </h4>
            <p className="text-slate-500 text-sm">{desc}</p>
        </a>
    );
}

export default Usecase;
