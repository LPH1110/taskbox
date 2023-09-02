import { ClockIcon, PlusIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';

import { Button } from '~/components';
import { ActivityAuth } from '~/contexts/ActivityContext';
import { UserAuth } from '~/contexts/AuthContext';
import { actions, useStore } from '~/store';
import ClosedBoards from './ClosedBoards';
import styles from './Workspaces.module.scss';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getDocs, collection, query, where, setDoc } from 'firebase/firestore';
import { db } from '~/firebase-config';
import CreateBoardMenu from '~/components/CreateBoardMenu/CreateBoardMenu';

const cx = classNames.bind(styles);

function Workspaces() {
    const [state, dispatch] = useStore();
    const { user } = UserAuth();
    const { saveAction } = ActivityAuth();
    const [boards, setBoards] = useState([]);
    console.log(boards);
    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const q = query(collection(db, 'boards'), where('userId', '==', user.uid));
                const res = await getDocs(q);
                const result = res.docs.reduce((acc, data) => [...acc, data.data()], []);
                setBoards(result);
            } catch (error) {
                console.log(error);
            }
        };

        fetchBoards();
    }, []);

    return (
        <section className="p-6">
            <div>
                <h1 className="text-lg font-semibold text-slate-600 flex items-center gap-2 justify-start">
                    <ClockIcon className="w-5 h-5" /> Recently viewed
                </h1>
                <section className="py-4 flex flex-wrap gap-8">
                    {/* Boards */}
                    {boards.map((board) => (
                        <Link
                            key={board?.id}
                            to={`/boards/${board?.id}`}
                            style={{ backgroundImage: `url(${board?.thumbnail})` }}
                            className={cx('board_thumb')}
                        >
                            <div className={cx('board_thumb-overlay')}></div>
                            <div className={cx('board_thumb-body')}>
                                <h1>{board?.title}</h1>
                            </div>
                        </Link>
                    ))}

                    {/* Create Boards Button */}
                    <CreateBoardMenu />
                </section>
            </div>
            <section className="mt-6">
                <ClosedBoards />
            </section>
        </section>
    );
}

export default Workspaces;
