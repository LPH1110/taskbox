import { ClockIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import CreateBoardMenu from '~/components/CreateBoardMenu/CreateBoardMenu';
import { UserAuth } from '~/contexts/AuthContext';
import { db } from '~/firebase-config';
import ClosedBoards from './ClosedBoards';
import styles from './Workspaces.module.scss';
import { Toast } from '~/components';

const cx = classNames.bind(styles);

function Workspaces() {
    const { user } = UserAuth();
    const [boards, setBoards] = useState([]);
    const [toast, setToast] = useState({
        show: false,
        body: {
            message: '',
            status: '',
        },
    });

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
            <h1 className="text-lg font-semibold text-slate-600 flex items-center gap-2 justify-start">
                <ClockIcon className="w-5 h-5" /> Recently viewed
            </h1>
            <section className="py-4 flex flex-wrap gap-4">
                {/* Boards */}
                {boards.map((board) => (
                    <Link
                        key={board?.uid}
                        to={`/boards/${board?.uid}`}
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
                <CreateBoardMenu setBoards={setBoards} setToast={setToast} />
            </section>
            <section className="mt-6">
                <ClosedBoards />
            </section>
            {toast.show && <Toast placement="bottom-end" message={toast.body.message} status={toast.body.status} />}
        </section>
    );
}

export default Workspaces;
