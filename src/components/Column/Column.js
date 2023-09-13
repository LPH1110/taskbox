import { EllipsisVerticalIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import Task from '../Task/Task';
import { Transition } from '@headlessui/react';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createTask, saveColumn } from '~/lib/actions';
import { actions, useStore } from '~/store';

const CreateTaskBtn = ({ boardId, column }) => {
    const [openForm, setOpenForm] = useState(false);
    const [, dispatch] = useStore();
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
            description: "Click to edit this task's description",
            boarId: boardId,
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
        <button
            type="button"
            onClick={() => setOpenForm((prev) => !prev)}
            className="text-slate-700 font-semibold flex items-center p-2 rounded-md w-full justify-center gap-2 border border-nav-border hover:bg-blue-100 ease duration-100"
        >
            Add a task
        </button>
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
            <div className="bg-slate-600 rounded-md border border-nav-border p-2 space-y-2">
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

const Column = ({ boardId, column, tasks = [], index }) => {
    return (
        <Draggable key={column?.id} draggableId={column?.id} index={index}>
            {(provided) => {
                return (
                    <div
                        {...provided.dragHandleProps}
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        className="space-y-2 w-[24rem] flex flex-col p-4 bg-white rounded-xl"
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
                        <Droppable direction="vertical" droppableId={column?.id} type="TASK">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`${
                                        snapshot.isDraggingOver ? 'bg-blue-100' : 'bg-transparent'
                                    } space-y-4 rounded-md ease duration-100 h-full p-2 mb-4`}
                                >
                                    {tasks.map((task, index) => (
                                        <Task task={task} index={index} />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                        <CreateTaskBtn boardId={boardId} column={column} />
                    </div>
                );
            }}
        </Draggable>
    );
};

export default Column;
