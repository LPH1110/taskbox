import { DragDropContext, type DropResult, Droppable } from "@hello-pangea/dnd";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { BoardColumn } from "../components/board-column";
import { Button } from "@/components/ui/button";
import { Filter, UserPlus } from "lucide-react";
import {
  fetchBoardDetails,
  moveColumn,
  moveTask,
  updateColumnOrder,
  updateTaskOrder,
} from "../boardDetailSlide";
import { TaskDetailModal } from "../components/task-detail-modal";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { AddColumnForm } from "../components/add-column-form";
import { BoardSkeleton } from "../components/board-skeleton";
import { useSmoothHorizontalScroll } from "@/hooks/use-smooth-horizontal-scroll";

export default function BoardDetailPage() {
  const { boardId } = useParams();
  const dispatch = useAppDispatch();
  const { tasks, columns, columnOrder, isLoading, currentBoard } =
    useAppSelector((state) => state.boardDetail);

  const { containerRef, onWheel } = useSmoothHorizontalScroll();

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoardDetails(boardId));
    }
  }, [dispatch, boardId]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // --- CASE 1: COLUMN REORDERING ---
    if (type === "column") {
      // 1. Optimistic Update
      dispatch(
        moveColumn({
          sourceIndex: source.index,
          destinationIndex: destination.index,
        })
      );

      // 2. Prepare API updates
      const newColumnOrder = Array.from(columnOrder);
      const [moved] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, moved);

      // Map to format required by Supabase upsert
      const updates = newColumnOrder.map((colId, index) => ({
        id: colId,
        board_id: boardId!,
        position: index,
        title: columns[colId].title,
      }));

      // 3. Dispatch API call
      dispatch(updateColumnOrder(updates));
      return;
    }

    // --- CASE 2: TASK REORDERING ---
    dispatch(moveTask({ source, destination }));

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];
    let updates = [];

    if (source.droppableId === destination.droppableId) {
      const newTaskIds = Array.from(sourceCol.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      updates = newTaskIds.map((taskId, index) => ({
        id: taskId,
        column_id: sourceCol.id,
        position: index,
        content: tasks[taskId].content,
      }));
    } else {
      const startTaskIds = Array.from(sourceCol.taskIds);
      startTaskIds.splice(source.index, 1);

      const finishTaskIds = Array.from(destCol.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);

      const sourceUpdates = startTaskIds.map((taskId, index) => ({
        id: taskId,
        column_id: sourceCol.id,
        position: index,
        content: tasks[taskId].content,
      }));

      const destUpdates = finishTaskIds.map((taskId, index) => ({
        id: taskId,
        column_id: destCol.id,
        position: index,
        content: tasks[taskId].content,
      }));

      updates = [...sourceUpdates, ...destUpdates];
    }

    dispatch(updateTaskOrder(updates));
  };

  if (isLoading) {
    return <BoardSkeleton />;
  }

  return (
    <div className={`flex h-[calc(100vh-80px)] flex-col gap-4 transition`}>
      {/* Board Header (Title & Actions) */}
      <div className="px-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{currentBoard?.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="all-columns"
          direction="horizontal"
          type="column"
        >
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={(el) => {
                provided.innerRef(el);
                containerRef.current = el;
              }}
              onWheel={onWheel}
              className="flex flex-1 gap-4 overflow-x-auto overflow-y-hidden px-4 pb-4 custom-scrollbar items-start"
            >
              {columnOrder.map((columnId, index) => {
                const column = columns[columnId];
                const columnTasks = column.taskIds.map(
                  (taskId) => tasks[taskId]
                );

                return (
                  <BoardColumn
                    key={column.id}
                    column={column}
                    tasks={columnTasks}
                    index={index}
                  />
                );
              })}
              {provided.placeholder}
              <AddColumnForm />
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <TaskDetailModal />
    </div>
  );
}
