import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchColumns } from '~/lib/api/boards';

const BoardItem = ({ board, members }) => {
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        const getColumns = async () => {
            const columnsResult = await fetchColumns(board.id);
            setColumns(columnsResult.reverse());
        };

        getColumns();
    }, [board.id]);

    return (
        <Link className="bg-white rounded-xl p-6 space-y-4" key={board?.id} to={`/boards/${board?.title}`}>
            <div className="flexStart gap-3">
                <div className="text-transparent h-full w-3 rounded-sm bg-purple-400">something</div>
                <h1 className="font-semibold text-lg">{board.title}</h1>
            </div>
            <div className="space-y-1">
                {columns.map((column) => (
                    <div key={column.id} className="flexBetween">
                        <p className="text-slate-700">{column.title}</p>
                        <span className="text-description">{column.taskIds.length}</span>
                    </div>
                ))}
            </div>
            <div className="avatar-group -space-x-3">
                {members.map((mem) => (
                    <div className="avatar" key={mem.id}>
                        <div className="w-8">
                            <img async src={mem.avatarURL} alt="mem-avatar" />
                        </div>
                    </div>
                ))}
            </div>
        </Link>
    );
};

export default BoardItem;
