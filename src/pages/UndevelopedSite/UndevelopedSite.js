import React from 'react';
const thumb = require('~/assets/imgs/under_dev.png');

const UndevelopedSite = () => {
    return (
        <div className="h-full flexCenter">
            <div className="text-center text-2xl text-description">
                <img src={thumb} alt="under_dev" />
            </div>
        </div>
    );
};

export default UndevelopedSite;
