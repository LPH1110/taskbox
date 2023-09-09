import { PlusIcon } from '@heroicons/react/24/solid';
import { Droppable } from 'react-beautiful-dnd';
import Task from '../Task/Task';

const Column = ({ column, tasks = [] }) => {
    const handleCreateTask = () => {};
    return (
        <div className="space-y-2 w-[17rem] border border-slate-300 flex flex-col p-4">
            <h1 className="font-semibold">{column?.title}</h1>
            <Droppable droppableId={column?.id}>
                {(provided, snapshot) => (
                    <>
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`${
                                snapshot.isDraggingOver ? 'bg-blue-100' : 'bg-transparent'
                            } space-y-4 rounded-md ease duration-100 h-full p-2`}
                        >
                            {tasks.map((task, index) => (
                                <Task task={task} index={index} />
                            ))}

                            {provided.placeholder}
                        </div>
                        <button
                            type="button"
                            className="flex items-center p-2 rounded-md w-full justify-start gap-2 border border-nav-border hover:bg-blue-100 ease duration-100"
                        >
                            <span>
                                <PlusIcon className="w-5 h-5" />
                            </span>{' '}
                            Add a card
                        </button>
                    </>
                )}
            </Droppable>
        </div>
    );
};

export default Column;
