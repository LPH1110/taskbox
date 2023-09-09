import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { fetchColumns, fetchTasks, saveColumn } from '~/lib/actions';
import { convertArrayFromObj, convertObjFromArray } from '~/lib/helpers';
import { actions, useStore } from '~/store';
import Column from '../Column/Column';
import styles from './Board.module.scss';

const cx = classNames.bind(styles);

const Board = ({ boardId, columnOrder = [], setToast }) => {
    const [state, dispatch] = useStore();
    const { tasks, columns } = state;
    const [timeoutId, setTimeoutId] = useState(null);

    const onDragStart = (start) => {
        console.log(start);
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const startColumn = columns[source.droppableId];
        const finishColumn = columns[destination.droppableId];

        if (startColumn === finishColumn) {
            const newTaskIds = Array.from(startColumn.taskIds);

            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            const newColumn = {
                ...startColumn,
                taskIds: newTaskIds,
            };

            dispatch(actions.updateColumnById(newColumn));
            saveColumn(newColumn);
        } else {
            // Update start col
            const startTaskIds = Array.from(startColumn.taskIds);
            startTaskIds.splice(source.index, 1);
            const newStartCol = {
                ...startColumn,
                taskIds: startTaskIds,
            };

            // Update finish col
            const finishTaskIds = Array.from(finishColumn.taskIds);
            finishTaskIds.splice(destination.index, 0, draggableId);
            const newFinishCol = {
                ...finishColumn,
                taskIds: finishTaskIds,
            };

            dispatch(actions.updateColumnById(newStartCol));
            dispatch(actions.updateColumnById(newFinishCol));
            saveColumn(newStartCol);
            saveColumn(newFinishCol);
        }
        setToast({
            show: true,
            body: {
                message: 'Saving board...',
                status: 'success',
            },
        });

        setTimeoutId(
            setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
            }, 3000),
        );
    };

    console.log(columns);
    useEffect(() => {
        const getData = async () => {
            const columnsResult = await fetchColumns(boardId);
            const tasksResult = await fetchTasks(boardId);

            const columnData = convertObjFromArray(columnsResult);
            const taskData = convertObjFromArray(tasksResult);

            dispatch(actions.updateColumns(columnData));
            dispatch(actions.updateTasks(taskData));
        };

        getData();

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className={cx('board_container')}>
                {columnOrder.length > 0 ? (
                    columnOrder.map((columnId) => {
                        const column = columns[columnId];
                        const taskList = column?.taskIds?.map((taskId) => tasks[taskId]);

                        return (
                            <div>
                                <Column key={columnId} column={column} tasks={taskList} />
                            </div>
                        );
                    })
                ) : (
                    <div>Create a list</div>
                )}
            </div>
        </DragDropContext>
    );
};

export default Board;
