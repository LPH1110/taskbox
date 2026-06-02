import { Button } from "@/components/ui/button";
import { useSmoothHorizontalScroll } from "@/hooks/use-smooth-horizontal-scroll";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { DragDropContext, type DropResult, Droppable } from "@hello-pangea/dnd";
import { Filter, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchBoardDetails,
  moveColumn,
  moveTask,
  realtimeBoardUpdate,
  realtimeColumnDelete,
  realtimeColumnUpsert,
  realtimeLabelDelete,
  realtimeLabelUpsert,
  realtimeMemberEvent,
  realtimeTaskDelete,
  realtimeTaskLabelEvent,
  realtimeTaskUpsert,
  updateColumnOrder,
  updateTaskOrder,
} from "../boardDetailSlide";
import { AddColumnForm } from "../components/add-column-form";
import { BoardColumn } from "../components/board-column";
import { BoardSkeleton } from "../components/board-skeleton";
import { MemberPopover } from "../components/member-popover";
import { MembersDialog } from "../components/members-dialog";
import { TaskDetailModal } from "../components/task-detail-modal";
import { socket } from "@/lib/socket";
import type { Board, BoardMember } from "../types";
import type { Column, Label, Task } from "../types/board-detail";

export default function BoardDetailPage() {
  const { boardId } = useParams();
  const dispatch = useAppDispatch();
  const { tasks, columns, columnOrder, isLoading, currentBoard, members } =
    useAppSelector((state) => state.boardDetail);
  const { user } = useAppSelector((state) => state.auth);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { containerRef, onWheel } = useSmoothHorizontalScroll();

  const stateRef = useRef({ columns, tasks });
  useEffect(() => {
    stateRef.current = { columns, tasks };
  }, [columns, tasks]);

  // Initial fetch
  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoardDetails(boardId));
    }
  }, [dispatch, boardId]);

  // Realtime updates via Socket.IO
  useEffect(() => {
    if (!boardId || !user) return;

    socket.connect();
    socket.emit("join:board", boardId);

    socket.on("board:update", (updatedBoard: Board) => {
      dispatch(realtimeBoardUpdate(updatedBoard));
    });

    socket.on("column:upsert", (column: Column) => {
      dispatch(realtimeColumnUpsert(column));
    });

    socket.on("column:delete", ({ id }: { id: string }) => {
      dispatch(realtimeColumnDelete(id));
    });

    socket.on("task:upsert", (task: Task) => {
      dispatch(realtimeTaskUpsert(task));
    });

    socket.on("task:delete", ({ id, column_id }: { id: string; column_id: string }) => {
      dispatch(realtimeTaskDelete({ id, column_id }));
    });

    socket.on("label:upsert", (label: Label) => {
      dispatch(realtimeLabelUpsert(label));
    });

    socket.on("label:delete", ({ id }: { id: string }) => {
      dispatch(realtimeLabelDelete(id));
    });

    socket.on("taskLabel:event", (data: { task_id: string; label_id: string; type: "INSERT" | "DELETE" }) => {
      dispatch(realtimeTaskLabelEvent(data));
    });

    socket.on("member:event", (data: { member: BoardMember; type: "INSERT" | "DELETE" }) => {
      dispatch(realtimeMemberEvent(data));
    });

    // Re-fetch details on batch reorder events to ensure consistency
    socket.on("column:reorder", () => {
      dispatch(fetchBoardDetails(boardId));
    });

    socket.on("task:reorder", () => {
      dispatch(fetchBoardDetails(boardId));
    });

    socket.on("task:move-all", () => {
      dispatch(fetchBoardDetails(boardId));
    });

    return () => {
      socket.emit("leave:board", boardId);
      socket.off("board:update");
      socket.off("column:upsert");
      socket.off("column:delete");
      socket.off("task:upsert");
      socket.off("task:delete");
      socket.off("label:upsert");
      socket.off("label:delete");
      socket.off("taskLabel:event");
      socket.off("member:event");
      socket.off("column:reorder");
      socket.off("task:reorder");
      socket.off("task:move-all");
      socket.disconnect();
    };
  }, [dispatch, boardId, user]);

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
        board_id: boardId!,
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
        board_id: boardId!,
        content: tasks[taskId].content,
      }));

      const destUpdates = finishTaskIds.map((taskId, index) => ({
        id: taskId,
        column_id: destCol.id,
        position: index,
        board_id: boardId!,
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
    <div 
      className={`flex h-[calc(100vh-3.5rem)] flex-col transition bg-cover bg-center`}
      style={
        currentBoard?.background_image 
          ? {
              backgroundImage: currentBoard.background_image.startsWith("url")
                ? currentBoard.background_image
                : undefined,
              backgroundColor: !currentBoard.background_image.startsWith("url")
                ? currentBoard.background_image
                : undefined,
            }
          : undefined
      }
    >
      {/* Sleek Header */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0 bg-background/30 backdrop-blur-md border-b border-white/10 dark:border-white/5 shadow-sm relative z-10">
        <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">
          {currentBoard?.title || "Board"}
        </h1>

        <div className="flex items-center gap-3">
          {/* Small Facepile */}
          <div className="flex -space-x-2 mr-2">
            {members.slice(0, 3).map((m) => (
              <MemberPopover key={m.user_id} member={m} boardId={boardId!} />
            ))}
            {members.length > 3 && (
              <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium z-10 shadow-sm">
                +{members.length - 3}
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="opacity-95 hover:opacity-100 shadow-sm bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md"
          >
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>

          <Button
            size="sm"
            className="cursor-pointer opacity-95 hover:opacity-100 shadow-sm bg-primary text-primary-foreground"
            onClick={() => setIsShareOpen(true)}
          >
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
              className="flex flex-1 gap-4 overflow-x-auto overflow-y-hidden px-6 pt-6 pb-6 custom-scrollbar items-start relative z-0"
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
      <MembersDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
