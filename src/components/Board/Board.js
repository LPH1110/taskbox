import { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames/bind';
import styles from './Board.module.scss';
import { actions, useStore } from '~/store';
import Column from '../Column/Column';

const cx = classNames.bind(styles);

const Board = (data) => {
    const [state, dispatch] = useStore();
    const { tasks, columns, columnOrder } = state;
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

            dispatch(actions.updateColumns(newColumn));
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

            dispatch(actions.updateColumns(newStartCol));
            dispatch(actions.updateColumns(newFinishCol));
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={cx('board_container')}>
                {columnOrder.map((columnId) => {
                    const column = columns[columnId];
                    const taskList = column.taskIds.map((taskId) => tasks[taskId]);

                    return (
                        <div>
                            <Column key={columnId} column={column} tasks={taskList} />
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
};

export default Board;
