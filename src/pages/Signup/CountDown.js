import React, { useState, useEffect } from 'react';

function CountDown() {
    const [countDown, setCountDown] = useState(59);

    useEffect(() => {
        const interval = setInterval(() => {
            if (countDown >= 0) {
                setCountDown((prev) => prev - 1);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [countDown]);

    return <span className="ml-2 text-red-400">00:{countDown < 10 ? `0${countDown}` : countDown}</span>;
}

export default CountDown;
