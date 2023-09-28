import { Transition } from '@headlessui/react';
import { EllipsisVerticalIcon, XMarkIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames/bind';
import { useEffect, useRef, useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { createTask, saveColumn } from '~/lib/actions';
import { actions, useStore } from '~/store';
import Task from '../Task/Task';
import TaskListItem from '../TaskListItem/TaskListItem';
import styles from './Column.module.scss';

const cx = classNames.bind(styles);

const CreateTaskBtn = ({ direction, boardId, column }) => {
    const [openForm, setOpenForm] = useState(false);
    const [state, dispatch] = useStore();
    const inputRef = useRef();
    const [taskTitle, setTaskTitle] = useState('');

    useEffect(() => {
        inputRef?.current?.focus();
    }, []);

    const handleCreateTask = () => {
        const taskId = uuidv4();
        const newTask = {
            id: taskId,
            title: taskTitle,
            description: "<p>Click to edit this task's description</p>",
            boardId: boardId,
            reference: column.title,
        };
        const newColumn = {
            ...column,
            taskIds: [...column.taskIds, taskId],
        };

        createTask(newTask);
        saveColumn(newColumn);
        dispatch(actions.updateTaskById(newTask));
        dispatch(actions.updateColumnById(newColumn));
        setTaskTitle('');
        setOpenForm(false);
    };

    const handleOnChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setTaskTitle(e.target.value);
    };

    return !openForm ? (
        <div className="w-full">
            <button
                type="button"
                onClick={() => setOpenForm((prev) => !prev)}
                className={direction === 'horizontal' ? cx('add_task-stack') : cx('add_task-list')}
            >
                Add a task
            </button>
        </div>
    ) : (
        <Transition
            show={openForm}
            enter="transition-opacity duration-75"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div className={direction === 'horizontal' ? cx('create_task_form-stack') : cx('create_task_form-list')}>
                <input
                    ref={inputRef}
                    value={taskTitle}
                    onChange={handleOnChange}
                    className="p-2 w-full ring-2 ring-transparent focus:ring-blue-500 rounded"
                    placeholder="Enter a task title"
                />
                <div className="flexStart gap-3">
                    <button
                        type="button"
                        onClick={handleCreateTask}
                        className="py-2 px-3 bg-blue-500 hover:bg-blue-500/70 ease duration-100 text-slate-100 rounded-md"
                    >
                        Add task
                    </button>
                    <button
                        onClick={() => setOpenForm(false)}
                        type="button"
                        className="text-slate-100 hover:text-slate-300 ease duration-100"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </Transition>
    );
};

const Column = ({ setOpenTaskModal, setToast, direction, boardId, column, tasks = [], index }) => {
    return (
        <Draggable key={column?.id} draggableId={column?.id} index={index}>
            {(provided) => {
                return (
                    <div
                        {...provided.dragHandleProps}
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        className={direction === 'horizontal' ? cx('column-stack') : cx('column-list')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="h-full w-3 rounded-sm bg-purple-300 text-transparent">something</span>
                                <h1 className="font-semibold text-lg">{column?.title}</h1>
                            </div>
                            <button type="button">
                                <EllipsisVerticalIcon className="w-5 h-5" />
                            </button>
                        </div>
                        {direction === 'horizontal' ? (
                            <Droppable direction="vertical" droppableId={column?.id} type="TASK">
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`${
                                            snapshot.isDraggingOver ? 'bg-blue-100' : 'bg-transparent'
                                        } space-y-4 rounded-md ease duration-100 p-2 -mx-2 mb-4 overflow-y-auto`}
                                    >
                                        {tasks.map((task, index) => (
                                            <Task
                                                onClick={() =>
                                                    setOpenTaskModal({
                                                        show: true,
                                                        task: task,
                                                    })
                                                }
                                                task={task}
                                                index={index}
                                            />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ) : (
                            <Droppable direction="vertical" droppableId={column?.id} type="TASK">
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`${
                                            snapshot.isDraggingOver ? 'bg-blue-100' : 'bg-transparent'
                                        } space-y-4 rounded-md ease duration-100 mb-4 overflow-y-auto`}
                                    >
                                        {tasks.map((task, index) => (
                                            <TaskListItem
                                                onClick={() =>
                                                    setOpenTaskModal({
                                                        show: true,
                                                        task: task,
                                                    })
                                                }
                                                task={task}
                                                index={index}
                                            />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        )}
                        <CreateTaskBtn direction={direction} boardId={boardId} column={column} />
                    </div>
                );
            }}
        </Draggable>
    );
};

export default Column;
