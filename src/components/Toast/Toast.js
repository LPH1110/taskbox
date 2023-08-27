import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import './Toast-overrides.scss';

function Toast({ placement, message, status }) {
    const toastClasses = () => {
        switch (placement) {
            case 'bottom-end':
                return `toast toast-end ${status}`;
            default:
                return `toast toast-top toast-end ${status}`;
        }
    };

    const Icon = () => {
        switch (status) {
            case 'success':
                return (
                    <span className="toast-icon text-green-400">
                        <CheckCircleIcon className="w-6 h-6" />
                    </span>
                );
            case 'error':
                return (
                    <span className="toast-icon text-red-400">
                        <XCircleIcon className="w-6 h-6" />
                    </span>
                );
            default:
                break;
        }
    };

    return (
        <div className={toastClasses()}>
            <div className="alert bg-green-100">
                <div>
                    <Icon />
                    <p className="toast-message">{message}</p>
                </div>
            </div>
        </div>
    );
}

export default Toast;
