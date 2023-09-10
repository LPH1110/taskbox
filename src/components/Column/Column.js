import { EllipsisVerticalIcon, PlusIcon } from '@heroicons/react/24/solid';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import Task from '../Task/Task';

const Column = ({ column, tasks = [], index }) => {
    const handleCreateTask = () => {};
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
                        <Droppable droppableId={column?.id} type="TASK">
                            {(provided, snapshot) => (
                                <div>
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
                                    <button
                                        type="button"
                                        className="text-slate-700 font-semibold flex items-center p-2 rounded-md w-full justify-center gap-2 border border-nav-border hover:bg-blue-100 ease duration-100"
                                    >
                                        Add a card
                                    </button>
                                </div>
                            )}
                        </Droppable>
                    </div>
                );
            }}
        </Draggable>
    );
};

export default Column;
