import { Button } from "@/components/ui/button";
import { useSmoothHorizontalScroll } from "@/hooks/use-smooth-horizontal-scroll";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { DragDropContext, type DropResult, Droppable } from "@hello-pangea/dnd";
import { Check, ChevronDown, Filter, Globe, Lock, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useParams, useLocation } from "react-router-dom";
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
  realtimeCommentEvent,
  realtimeAttachmentEvent,
  updateBoardDetails,
  updateColumnOrder,
  updateTaskOrder,
  openTaskDetail,
} from "../boardDetailSlide";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/context/ToastContext";
import { AddColumnForm } from "../components/add-column-form";
import { BoardColumn } from "../components/board-column";
import { BoardSkeleton } from "../components/board-skeleton";
import { MemberPopover } from "../components/popovers/member-popover";
import { MembersDialog } from "../components/dialogs";
import { TaskDetailModal } from "../components";
import { socket } from "@/lib/socket";
import type { Board, BoardMember } from "../types";
import type { Column, Label, Task, Comment, Attachment } from "../types/board-detail";

export default function BoardDetailPage() {
  const { boardId } = useParams();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const { tasks, columns, columnOrder, isLoading, currentBoard, members } =
    useAppSelector((state) => state.boardDetail);
  const { user } = useAppSelector((state) => state.auth);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const { containerRef, onWheel } = useSmoothHorizontalScroll();

  // Check if current user is owner or admin
  const isOwner = currentBoard?.owner_id === user?.id;
  const isBoardAdmin = members.some((m) => m.user_id === user?.id && m.role === "admin");
  const canModifyVisibility = isOwner || isBoardAdmin;

  const handleVisibilityChange = async (newType: "public" | "private") => {
    if (!currentBoard) return;
    try {
      await dispatch(
        updateBoardDetails({
          boardId: currentBoard.id,
          updates: { type: newType },
        })
      ).unwrap();
      addToast(`Board is now ${newType}`, "success");
    } catch (error: any) {
      addToast(error || "Failed to update visibility", "error");
    }
  };

  const handleTitleSubmit = async () => {
    setIsEditingTitle(false);
    if (!currentBoard) return;
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== currentBoard.title) {
      try {
        await dispatch(
          updateBoardDetails({
            boardId: currentBoard.id,
            updates: { title: trimmed },
          })
        ).unwrap();
        addToast("Board title updated", "success");
      } catch (error: any) {
        addToast(error || "Failed to update title", "error");
      }
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleSubmit();
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
    }
  };

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

  // Handle auto-opening task via navigation state (from planner deep-link)
  useEffect(() => {
    const openTaskId = (location.state as { openTaskId?: string })?.openTaskId;
    if (openTaskId && !isLoading && Object.keys(tasks).length > 0) {
      if (tasks[openTaskId]) {
        dispatch(openTaskDetail(openTaskId));
      } else {
        addToast("Task not found on this board", "error");
      }
      // Clear location state so back-navigation doesn't re-open
      window.history.replaceState({}, "");
    }
  }, [location.state, isLoading, tasks, dispatch, addToast]);

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

    socket.on("comment:event", (data: { type: "INSERT" | "UPDATE" | "DELETE"; comment?: Comment; commentId?: string; taskId: string }) => {
      dispatch(realtimeCommentEvent(data));
    });

    socket.on("attachment:event", (data: { type: "INSERT" | "DELETE"; attachment?: Attachment; attachmentId?: string; taskId: string }) => {
      dispatch(realtimeAttachmentEvent(data));
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
      socket.off("comment:event");
      socket.off("attachment:event");
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
        <div className="flex items-center gap-3">
          <div className="relative flex items-center h-8">
            <AnimatePresence mode="popLayout">
              {isEditingTitle ? (
                <motion.input
                  key="input"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  autoFocus
                  className="text-xl font-bold tracking-tight text-white bg-white/20 border-0 rounded px-2 py-0.5 -ml-2 outline-none focus:ring-2 focus:ring-white/50 h-8 w-auto min-w-[150px] max-w-[200px] md:max-w-[400px]"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleTitleKeyDown}
                />
              ) : (
                <motion.h1
                  key="h1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`text-xl font-bold tracking-tight text-white drop-shadow-sm px-2 py-0.5 -ml-2 rounded transition-colors whitespace-nowrap ${canModifyVisibility ? "cursor-pointer hover:bg-white/20" : ""
                    }`}
                  onClick={() => {
                    if (canModifyVisibility) {
                      setTitleInput(currentBoard?.title || "");
                      setIsEditingTitle(true);
                    }
                  }}
                >
                  {currentBoard?.title || "Board"}
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

          {currentBoard && (
            <div className="flex items-center gap-2">
              {canModifyVisibility ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm gap-1.5 px-2.5 cursor-pointer"
                    >
                      {currentBoard.type === "public" ? (
                        <>
                          <Globe className="h-3.5 w-3.5" />
                          <span>Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          <span>Private</span>
                        </>
                      )}
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    <DropdownMenuItem
                      onClick={() => handleVisibilityChange("private")}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-left">
                        <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Private</p>
                          <p className="text-[10px] text-muted-foreground">Only added members access</p>
                        </div>
                      </div>
                      {currentBoard.type === "private" && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleVisibilityChange("public")}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-left">
                        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Public</p>
                          <p className="text-[10px] text-muted-foreground">All workspace members access</p>
                        </div>
                      </div>
                      {currentBoard.type === "public" && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white/20 text-white/90 rounded-md backdrop-blur-sm">
                  {currentBoard.type === "public" ? (
                    <>
                      <Globe className="h-3.5 w-3.5" />
                      <span>Public</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>Private</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

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
