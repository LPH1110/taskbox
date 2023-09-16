import { getDocs, orderBy, query, where } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import Spacer from '../Spacer/Spacer';
import { ActivityAuth } from '~/contexts/ActivityContext';
import { UserAuth } from '~/contexts/AuthContext';
import Action from '~/pages/Profile/Action';

const Activities = ({ data, user }) => {
    return (
        <>
            {data.reverse().map((activity) => (
                <Action user={user} key={activity.uid} data={activity} />
            ))}
        </>
    );
};

const Comments = ({ data, user }) => {
    return (
        <>
            {data.length > 0 ? (
                <div>Comment list</div>
            ) : (
                <div className="text-no-result text-sm">Comments not found...</div>
            )}
        </>
    );
};

const ActivityMenu = () => {
    const [activities, setActivities] = useState([]);
    const [comments, setComments] = useState([]);
    const [toggle, setToggle] = useState(false);
    const { activityRef } = ActivityAuth();
    const { user } = UserAuth();

    console.log(activities);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const q = query(activityRef, orderBy('date', 'asc'), where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const result = querySnapshot.docs.map((doc) => doc.data());
                setActivities(result);
            } catch (e) {
                console.error(e.message, 'Error getting activities');
            }
        };

        fetchActivities();
    }, [activityRef, user.uid]);

    return (
        <div style={{ overflow: 'overlay' }} className="flex flex-col justify-start w-full gap-2 max-h-full">
            <div className="flex items-center justify-between w-full gap-2">
                <button
                    type="button"
                    className="w-full rounded-sm bg-blue-400 hover:bg-blue-300 ease duration-100 py-1.5"
                    onClick={() => setToggle((prev) => !prev)}
                >
                    All
                </button>
                <button
                    type="button"
                    className="w-full rounded-sm bg-slate-100 hover:bg-slate-200 ease duration-100 py-1.5"
                    onClick={() => setToggle((prev) => !prev)}
                >
                    Comments
                </button>
            </div>
            <Spacer />
            <div className="my-2 overflow-y-auto">
                {!toggle ? <Activities data={activities} user={user} /> : <Comments data={comments} user={user} />}
            </div>
        </div>
    );
};

export default ActivityMenu;
