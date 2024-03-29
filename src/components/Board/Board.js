import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames/bind';
import { useEffect, useRef, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { UserAuth } from '~/contexts/AuthContext';
import { convertObjFromArray } from '~/lib/helpers';
import { actions, useStore } from '~/store';
import Column from '../Column/Column';
import styles from './Board.module.scss';
import { createColumn, saveColumn } from '~/lib/api/columns';
import { fetchColumns, saveBoard } from '~/lib/api/boards';
import { fetchTasks } from '~/lib/api/tasks';
import { fetchComments } from '~/lib/api/comments';

const cx = classNames.bind(styles);

const CreateListBtn = ({ direction, boardId, setBoard, setToast, dispatch }) => {
    const [openCreateListForm, setOpenCreateListForm] = useState(false);
    const inputRef = useRef();
    const [listTitle, setListTitle] = useState('');

    useEffect(() => {
        inputRef?.current?.focus();
    }, []);

    const handleCreateList = () => {
        if (listTitle !== '') {
            console.log('Created: ', listTitle);
            const data = {
                id: uuidv4(),
                title: listTitle,
                reference: boardId,
                taskIds: [],
            };
            createColumn(data);
            setBoard((prev) => {
                const newOrder = [...prev.columnOrder, data.id];
                const newBoard = {
                    ...prev,
                    columnOrder: newOrder,
                };

                const savingBoard = async () => await saveBoard(boardId, newBoard);

                savingBoard();

                return newBoard;
            });
            dispatch(actions.updateColumnById(data));

            setListTitle('');
            setOpenCreateListForm(false);
        }
    };

    const handleOnChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setListTitle(e.target.value);
    };

    return (
        <div className="relative">
            <button
                className={direction === 'horizontal' ? cx('create_col-stack') : cx('create_col-list')}
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenCreateListForm((prev) => !prev);
                }}
            >
                Create a list
            </button>
            <Transition
                className="absolute inset-0 top-0"
                show={openCreateListForm}
                enter="transition-opacity duration-75"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="w-[24rem] bg-slate-600 rounded-xl border border-nav-border p-2 space-y-2">
                    <input
                        ref={inputRef}
                        value={listTitle}
                        onChange={handleOnChange}
                        className="p-2 w-full ring-2 ring-transparent focus:ring-blue-500 rounded"
                        placeholder="Enter a title"
                    />
                    <div className="flexStart gap-3">
                        <button
                            type="button"
                            onClick={handleCreateList}
                            className="py-2 px-3 bg-blue-500 hover:bg-blue-500/70 ease duration-100 text-slate-100 rounded-md"
                        >
                            Add list
                        </button>
                        <button
                            onClick={() => setOpenCreateListForm(false)}
                            type="button"
                            className="text-slate-100 hover:text-slate-300 ease duration-100"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </Transition>
        </div>
    );
};

const Board = ({ setOpenTaskModal, direction = 'horizontal', board, setBoard, columnOrder = [], setToast }) => {
    const [state, dispatch] = useStore();
    const { tasks, columns } = state;
    const { user } = UserAuth();
    const [timeoutId, setTimeoutId] = useState(null);

    const onDragEnd = (result) => {
        const { destination, type, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        switch (type) {
            case 'TASK':
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
                break;
            case 'COLUMN':
                if (source.index !== destination.index) {
                    const newOrder = columnOrder;
                    newOrder.splice(source.index, 1);
                    newOrder.splice(destination.index, 0, draggableId);
                    setBoard((prev) => {
                        const newBoard = {
                            ...prev,
                            columnOrder: newOrder,
                        };

                        const savingBoard = async () => await saveBoard(board.id, newBoard);

                        savingBoard();

                        return newBoard;
                    });
                }
                break;
            default:
                console.error('No such droppable type!');
        }
    };

    useEffect(() => {
        if (user) {
            const getData = async () => {
                const columnsResult = await fetchColumns(board?.id);
                const tasksResult = await fetchTasks(board?.id);
                const commentsResult = await fetchComments(board?.id);

                const columnData = convertObjFromArray(columnsResult);
                const taskData = convertObjFromArray(tasksResult);
                const commentData = convertObjFromArray(commentsResult);

                dispatch(actions.updateComments(commentData || {}));
                dispatch(actions.updateColumns(columnData));
                dispatch(actions.updateTasks(taskData));
            };

            getData();
        }

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div className="h-full relative">
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable key={board?.id} direction={direction} droppableId={board?.id} type="COLUMN">
                    {(provided) => {
                        return (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={
                                    direction === 'horizontal'
                                        ? cx('board_container-stack')
                                        : cx('board_container-list')
                                }
                            >
                                {columnOrder.map((columnId, index) => {
                                    const column = columns[columnId];
                                    const taskList = column?.taskIds?.map((taskId) => tasks[taskId]);

                                    return (
                                        <div className={`${direction === 'vertical' ? 'w-full' : 'h-full'}`}>
                                            <Column
                                                setOpenTaskModal={setOpenTaskModal}
                                                setToast={setToast}
                                                direction={direction}
                                                boardId={board?.id}
                                                index={index}
                                                column={column}
                                                tasks={taskList}
                                            />
                                        </div>
                                    );
                                })}

                                {provided.placeholder}
                                <CreateListBtn
                                    direction={direction}
                                    dispatch={dispatch}
                                    boardId={board?.id}
                                    setBoard={setBoard}
                                    setToast={setToast}
                                />
                            </div>
                        );
                    }}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default Board;
