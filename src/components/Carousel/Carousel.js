import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

import classNames from 'classnames/bind';
import styles from './Carousel.module.scss';

const cx = classNames.bind(styles);

function PrevArrow({ className, style, onClick }) {
    return (
        <div
            className={cx(
                'prevArrow',
                className,
                `z-10 rounded-full hover:opacity-80 shadow-[0_5px_12px_0_rgba(56,189,248,0.8)] ease duration-200`,
            )}
            style={{ ...style }}
            onClick={onClick}
        >
            <ChevronRightIcon className="w-5 h-5" />
        </div>
    );
}

function NextArrow({ className, style, onClick }) {
    return (
        <div
            className={cx(
                'nextArrow',
                className,
                'z-10 rounded-full hover:opacity-80 shadow-[0_5px_12px_0_rgba(56,189,248,0.8)] ease duration-200',
            )}
            style={{ ...style }}
            onClick={onClick}
        >
            <ChevronLeftIcon className="w-5 h-5" />
        </div>
    );
}

function Carousel({ settings, children, autoplay }) {
    const config = {
        ...settings,
        autoplay,
    };

    return (
        <Slider className="" autoplaySpeed={3000} {...config}>
            {children}
        </Slider>
    );
}

export default Carousel;
