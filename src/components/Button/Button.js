import React from 'react';
import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Button.module.scss';

const cx = classNames.bind(styles);

const Button = forwardRef(
    ({ onClick, to, type, href, size, children, disabled, rightIcon, leftIcon, className, ...restProps }, ref) => {
        let Component = 'button';
        const props = {
            onClick,
        };

        if (href) {
            props.href = href;
            Component = 'a';
        } else if (to) {
            props.to = to;
            Component = NavLink;
        } else if (disabled) {
            Object.keys(props).forEach((key) => {
                if (key.startsWith('on') && typeof props[key] === 'function') {
                    delete props[key];
                }
            });
        } else {
            props.type = type | 'button';
        }

        const classes = cx(
            'wrapper',
            {
                [size]: size,
                [className]: className,
                disabled,
            },
            'rounded-md',
        );

        return (
            <Component ref={ref} {...props} className={classes} {...restProps}>
                {leftIcon && <span className={cx('leftIcon')}>{leftIcon}</span>}
                <span className={cx('title')}>{children}</span>
                {rightIcon && <span className={cx('rightIcon')}>{rightIcon}</span>}
            </Component>
        );
    },
);

export default Button;
