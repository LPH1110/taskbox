import { Tab } from '@headlessui/react';
import { Bars3CenterLeftIcon } from '@heroicons/react/24/solid';
import { getDocs, orderBy, query, where } from 'firebase/firestore';
import { Fragment, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '~/components';
import { ActivityAuth } from '~/contexts/ActivityContext';
import Action from './Action';
import UserInfoForm from './UserInfoForm';

const tabs = [
    {
        id: uuidv4(),
        title: 'Profile and Visibility',
    },
    {
        id: uuidv4(),
        title: 'Activity',
    },
    {
        id: uuidv4(),
        title: 'Cards',
    },
    {
        id: uuidv4(),
        title: 'Settings',
    },
];

const ActivityButton = ({ loadMore, minimizeActivities, loadMoreActivities }) => {
    if (loadMore) {
        return (
            <Button
                size="medium"
                type="button"
                onClick={loadMoreActivities}
                className="hover:bg-slate-100 ease-in-out duration-200 text-blue-600 font-semibold"
            >
                Load more
            </Button>
        );
    } else {
        return (
            <Button
                size="medium"
                type="button"
                onClick={minimizeActivities}
                className="hover:bg-slate-100 ease-in-out duration-200 text-blue-600 font-semibold"
            >
                Minimize
            </Button>
        );
    }
};

function UserTab({ loading, formik, user, setToast }) {
    const { activityRef } = ActivityAuth();
    const [activities, setActivities] = useState([]);
    const [numOfActions, setNumOfActions] = useState(5);
    const [loadMore, setLoadMore] = useState(true);

    const getActivities = async () => {
        try {
            const q = query(activityRef, orderBy('date', 'asc'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const result = querySnapshot.docs.map((doc) => doc.data());
            setActivities(result);
        } catch (e) {
            console.error(e.message, 'Error getting activities');
        }
    };

    const minimizeActivities = () => {
        setNumOfActions(5);
        setLoadMore(true);
    };

    const loadMoreActivities = () => {
        setNumOfActions((prev) => {
            const result = prev + prev;
            if (result >= activities.length) setLoadMore(false);
            return result;
        });
    };

    const sliceActivities = () => activities.slice(-numOfActions);

    return (
        <Tab.Group>
            <Tab.List className="flex">
                {tabs.map((tab) => (
                    <Tab as={Fragment} key={tab.id}>
                        {({ selected }) => {
                            return (
                                <Button
                                    type="button"
                                    className={
                                        selected ? 'text-blue-600 shadow-md ease duration-200' : 'text-slate-500'
                                    }
                                    size="medium"
                                    onClick={tab.title.localeCompare('Activity') === 0 && getActivities()}
                                >
                                    {tab.title}
                                </Button>
                            );
                        }}
                    </Tab>
                ))}
            </Tab.List>
            <Tab.Panels className="py-3 mt-3">
                {/* Profile */}
                <Tab.Panel>
                    <h2 className="text-2xl font-semibold text-slate-600 py-2 mb-2">
                        Manage your personal information
                    </h2>
                    <UserInfoForm loading={loading} formik={formik} suser={user} setToast={setToast} />
                </Tab.Panel>
                {/* Activity */}
                <Tab.Panel>
                    <div className="flex items-center font-semibold text-2xl text-slate-600 py-2">
                        <span className="mr-2">
                            <Bars3CenterLeftIcon className="w-6 h-6" />
                        </span>
                        <h4>Your activities</h4>
                    </div>
                    <div className="my-2">
                        {sliceActivities()
                            .reverse()
                            .map((activity) => (
                                <Action user={user} key={activity.uid} data={activity} />
                            ))}
                    </div>
                    {activities.length > 5 && (
                        <ActivityButton
                            loadMore={loadMore}
                            minimizeActivities={minimizeActivities}
                            loadMoreActivities={loadMoreActivities}
                        />
                    )}
                </Tab.Panel>
            </Tab.Panels>
        </Tab.Group>
    );
}

export default UserTab;
