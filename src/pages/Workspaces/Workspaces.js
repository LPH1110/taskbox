import { ClockIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { Toast } from '~/components';
import CreateBoardMenu from '~/components/CreateBoardMenu/CreateBoardMenu';
import { UserAuth } from '~/contexts/AuthContext';
import { fetchBoards } from '~/lib/actions';
import ClosedBoards from './ClosedBoards';
import styles from './Workspaces.module.scss';

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
        const getBoards = async () => {
            try {
                const result = await fetchBoards(user?.uid);
                setBoards(result);
            } catch (error) {
                console.log(error);
            }
        };

        getBoards();
    }, [user?.uid]);

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
                            style={{ backgroundImage: `url(${board?.thumbnailURL})` }}
                            className={cx('board_thumb')}
                            async
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
            </div>
            <section className="mt-6">
                <ClosedBoards />
            </section>
            {toast.show && <Toast placement="bottom-end" message={toast.body.message} status={toast.body.status} />}
        </section>
    );
}

export default Workspaces;
