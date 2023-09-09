import { Draggable } from 'react-beautiful-dnd';
import React from 'react';

const Task = ({ task, index }) => {
    return (
        <Draggable key={task?.id} draggableId={task?.id} index={index}>
            {(provided, snapshot) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    className={`shadow-md p-2 rounded-md border border-nav-border bg-white ease duration-100`}
                >
                    {task?.content}
                </div>
            )}
        </Draggable>
    );
};

export default Task;
