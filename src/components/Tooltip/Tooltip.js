import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

function Tooltip({ placement = 'bottom-start', message, children }) {
    return (
        <Tippy placement={placement} content={<span className="text-md">{message}</span>}>
            {children}
        </Tippy>
    );
}

export default Tooltip;
