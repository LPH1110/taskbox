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
import { supabase } from "@/lib/supabase";
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

  // Realtime updates
  useEffect(() => {
    if (!boardId || !user) return;

    const channel = supabase
      .channel(`board:${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "boards",
          filter: `id=eq.${boardId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE")
            dispatch(realtimeBoardUpdate(payload.new as Board));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "columns",
          filter: `board_id=eq.${boardId}`,
        },
        (p) => {
          if (p.eventType === "DELETE")
            dispatch(realtimeColumnDelete(p.old.id));
          else dispatch(realtimeColumnUpsert(p.new as Column));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `board_id=eq.${boardId}`,
        },
        (p) => {
          if (p.eventType === "DELETE") {
            const taskId = p.old.id;
            const taskInState = stateRef.current.tasks[taskId];
            if (taskInState)
              dispatch(
                realtimeTaskDelete({
                  id: taskId,
                  column_id: taskInState.column_id,
                })
              );
          } else {
            dispatch(realtimeTaskUpsert(p.new as Task));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "labels",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE")
            dispatch(realtimeLabelDelete(payload.old.id));
          else dispatch(realtimeLabelUpsert(payload.new as Label));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task_labels" },
        (payload) => {
          const data: any =
            payload.eventType === "DELETE" ? payload.old : payload.new;
          if (tasks[data.task_id]) {
            dispatch(
              realtimeTaskLabelEvent({
                task_id: data.task_id,
                label_id: data.label_id,
                type: payload.eventType as "INSERT" | "DELETE",
              })
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "board_members",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          dispatch(
            realtimeMemberEvent({
              member: (payload.eventType === "DELETE"
                ? payload.old
                : payload.new) as BoardMember,
              type: payload.eventType === "INSERT" ? "INSERT" : "DELETE",
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
    <div className={`flex h-[calc(100vh-80px)] flex-col gap-4 transition`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 shrink-0">
        <h1 className="text-2xl font-bold text-white drop-shadow-md">
          {currentBoard?.title || "Board"}
        </h1>

        <div className="flex items-center gap-2">
          {/* Small Facepile */}
          <div className="flex -space-x-2 mr-2">
            {members.slice(0, 3).map((m) => (
              <MemberPopover key={m.user_id} member={m} boardId={boardId!} />
            ))}
            {members.length > 3 && (
              <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium z-10">
                +{members.length - 3}
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="opacity-90 hover:opacity-100"
          >
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>

          <Button
            size="sm"
            className="cursor-pointer opacity-90 hover:opacity-100"
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
      <MembersDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
