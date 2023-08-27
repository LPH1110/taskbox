import React from 'react';
import { format } from 'date-fns';
import classNames from 'classnames/bind';
import styles from './Profile.module.scss';

const cx = classNames.bind(styles);

function Action({ key, user, data }) {
    const formatDateTime = (date) => {
        return format(date, 'MMM dd, yyyy') + ' at ' + format(date, 'HH:mm');
    };

    return (
        <div key={key} className={cx('activity', 'flex items-center w-full py-2')}>
            <div className="avatar">
                <div className="w-8 rounded-full">
                    <img src={user?.photoURL} alt={user?.displayName} />
                </div>
            </div>
            <div className="px-2 w-full text-sm">
                <div className="flex items-center">
                    <h1 className="font-semibold">{user?.displayName}</h1>
                    <span className="mx-1">{data.action}</span>
                    {data.action === 'renamed' ? (
                        <p>
                            <span className="underline mr-1">{data.message}</span>
                            (from {data.previous})
                        </p>
                    ) : (
                        <p className="underline">{data.message}</p>
                    )}
                </div>
                <p className="text-slate-500">{formatDateTime(data.date.toDate())}</p>
            </div>
        </div>
    );
}

export default Action;
