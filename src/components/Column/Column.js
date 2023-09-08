import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Task from '../Task/Task';

const Column = ({ column, tasks }) => {
    console.log(tasks);
    return (
        <div className="space-y-2 w-[17rem] border border-slate-300 flex flex-col p-4">
            <h1 className="font-semibold">{column.title}</h1>
            <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
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
                )}
            </Droppable>
        </div>
    );
};

export default Column;
