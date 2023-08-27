import Context from './Context';
import { useContext, useState, useEffect } from 'react';

export const useStore = () => {
    const [state, dispatch] = useContext(Context);
    return [state, dispatch];
};

export const useDebounce = (value, delay) => {
    const [delayedValue, setDelayedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDelayedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value]);

    return delayedValue;
};
