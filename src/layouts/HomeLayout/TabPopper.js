import React, { Fragment, forwardRef, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import SolutionsTab from './SolutionsTab';
import FeaturesTab from './FeaturesTab';
import ResourcesTab from './ResourcesTab';

const tabs = {
    features: FeaturesTab,
    solutions: SolutionsTab,
    resources: ResourcesTab,
};

const TabPopper = forwardRef(({ currentTab }, ref) => {
    const Component = tabs[currentTab];

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => (document.body.style.overflow = 'overlay');
    }, []);

    return (
        <div
            ref={ref}
            className="top-full z-[100] border-t border-slate-200 w-full bg-white shadow-xl rounded-sm absolute inset-x-0"
        >
            <Component />
        </div>
    );
});

export default TabPopper;
