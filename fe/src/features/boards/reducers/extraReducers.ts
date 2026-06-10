import type { ActionReducerMapBuilder } from "@reduxjs/toolkit";
import type { BoardDetailState, Task, Column, Label, Checklist } from "../types/board-detail";
import * as thunks from "../thunks";

export function addExtraReducers(builder: ActionReducerMapBuilder<BoardDetailState>) {
    // --- Handle Fetch Board Details ---
    builder
      .addCase(thunks.fetchBoardDetails.pending, (state) => {
        if (!state.currentBoard) {
          state.isLoading = true;
        }
      })
      .addCase(thunks.fetchBoardDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        const { labels, board, columns, tasks, taskLabels, taskAssignees, members, checklists, checklistItems } =
          action.payload;

        state.currentBoard = board;
        const newTasks: Record<string, Task> = {};
        const newColumns: Record<string, Column> = {};
        const newLabels: Record<string, Label> = {};
        const taskLabelMap: Record<string, string[]> = {};
        const taskAssigneeMap: Record<string, string[]> = {};
        const newColumnOrder: string[] = [];

        // Normalize labels
        labels.forEach((l: Label) => {
          newLabels[l.id] = l;
        });
        state.labels = newLabels;

        // Map Task Labels
        // taskId -> [labelId1, labelId2]
        taskLabels.forEach((tl: any) => {
          if (!taskLabelMap[tl.task_id]) taskLabelMap[tl.task_id] = [];
          taskLabelMap[tl.task_id].push(tl.label_id);
        });

        // Map Task Assignees
        if (taskAssignees) {
          taskAssignees.forEach((ta: any) => {
            if (!taskAssigneeMap[ta.task_id]) taskAssigneeMap[ta.task_id] = [];
            taskAssigneeMap[ta.task_id].push(ta.user_id);
          });
        }

        // Process Columns
        columns.forEach((col: Column) => {
          newColumns[col.id] = {
            id: col.id,
            board_id: col.board_id,
            title: col.title,
            position: col.position,
            category: col.category,
            taskIds: [],
          };
          newColumnOrder.push(col.id);
        });

        // Process Tasks and link to Columns
        tasks.forEach((task: Task) => {
          newTasks[task.id] = {
            id: task.id,
            content: task.content,
            column_id: task.column_id,
            priority: task.priority,
            description: task.description,
            position: task.position,
            labelIds: taskLabelMap[task.id] || [],
            assigneeIds: taskAssigneeMap[task.id] || [],
            due_date: task.due_date,
          };

          if (newColumns[task.column_id]) {
            newColumns[task.column_id].taskIds.push(task.id);
          }
        });

        state.tasks = newTasks;
        state.columns = newColumns;
        state.columnOrder = newColumnOrder;
        state.members = members || [];

        // Process Checklists
        const newChecklists: Record<string, Checklist[]> = {};
        if (checklists) {
          checklists.forEach((c: any) => {
            if (!newChecklists[c.task_id]) newChecklists[c.task_id] = [];
            newChecklists[c.task_id].push({ ...c, items: [] });
          });
        }
        if (checklistItems) {
          checklistItems.forEach((item: any) => {
            const checklistId = item.checklist_id;
            const taskChecklistList = Object.values(newChecklists).find(list => list.some(c => c.id === checklistId));
            if (taskChecklistList) {
              const checklist = taskChecklistList.find(c => c.id === checklistId);
              if (checklist) {
                checklist.items.push(item);
              }
            }
          });
        }
        state.checklists = newChecklists;
      });

    // --- Handle Add Member
    builder.addCase(thunks.addMember.fulfilled, (state, action) => {
      if (!state.members.find((m) => m.user_id === action.payload.user_id)) {
        state.members.push(action.payload);
      }
    });

    // --- Handle Update Board Details ---
    builder.addCase(thunks.updateBoardDetails.fulfilled, (state, action) => {
      if (state.currentBoard && state.currentBoard.id === action.payload.id) {
        state.currentBoard = { ...state.currentBoard, ...action.payload };
      }
    });

    // --- Handle Remove Member ---
    builder.addCase(thunks.removeMember.fulfilled, (state, action) => {
      const removedUserId = action.payload;
      // Filter out the removed member from the list
      state.members = state.members.filter((m) => m.user_id !== removedUserId);
    });

    // --- Handle Create Label
    builder.addCase(thunks.createLabel.fulfilled, (state, action) => {
      const label = action.payload;
      state.labels[label.id] = label;
    });

    // --- Handle Update Label ---
    builder.addCase(thunks.updateLabel.fulfilled, (state, action) => {
      const updatedLabel = action.payload;
      if (state.labels[updatedLabel.id]) {
        state.labels[updatedLabel.id] = updatedLabel;
      }
    });

    // --- Handle Delete Label ---
    builder.addCase(thunks.deleteLabel.fulfilled, (state, action) => {
      const labelId = action.payload;

      delete state.labels[labelId];

      Object.values(state.tasks).forEach((task) => {
        if (task.labelIds && task.labelIds.includes(labelId)) {
          task.labelIds = task.labelIds.filter((id) => id !== labelId);
        }
      });
    });

    // Handle Toggle Task Label
    builder.addCase(thunks.toggleTaskLabel.fulfilled, (state, action) => {
      const { taskId, labelId, isAdding } = action.payload;
      const task = state.tasks[taskId];
      if (task) {
        if (isAdding) {
          if (!task.labelIds.includes(labelId)) task.labelIds.push(labelId);
        } else {
          task.labelIds = task.labelIds.filter((id) => id !== labelId);
        }
      }
    });

    // Handle Toggle Task Assignee
    builder.addCase(thunks.toggleTaskAssignee.fulfilled, (state, action) => {
      const { taskId, userId, isAdding } = action.payload;
      const task = state.tasks[taskId];
      if (task) {
        if (isAdding) {
          if (!task.assigneeIds.includes(userId)) task.assigneeIds.push(userId);
        } else {
          task.assigneeIds = task.assigneeIds.filter((id) => id !== userId);
        }
      }
    });

    // --- Handle Create Column --
    builder.addCase(thunks.createColumn.fulfilled, (state, action) => {
      const column = action.payload;
      state.columns[column.id] = { ...column, taskIds: [] };
      if (!state.columnOrder.includes(column.id)) {
        state.columnOrder.push(column.id);
      }
    });

    // --- Handle Update Column --
    builder.addCase(thunks.updateColumn.fulfilled, (state, action) => {
      const updatedColumn = action.payload;
      if (state.columns[updatedColumn.id]) {
        state.columns[updatedColumn.id].title = updatedColumn.title;
      }
    });

    // --- Handle Copy Column ---
    builder.addCase(thunks.copyColumn.fulfilled, (state, action) => {
      const { newColumn, newTasks, originalColumnId } = action.payload;
      state.columns[newColumn.id] = {
        ...newColumn,
        taskIds: newTasks.map((t: any) => t.id),
      };
      newTasks.forEach((task: any) => {
        state.tasks[task.id] = { ...task, labelIds: [] };
      });

      if (!state.columnOrder.includes(newColumn.id)) {
        const index = state.columnOrder.indexOf(originalColumnId);
        if (index !== -1) {
          state.columnOrder.splice(index + 1, 0, newColumn.id);
        } else {
          state.columnOrder.push(newColumn.id);
        }
      }
    });

    // --- Handle Move Column
    builder.addCase(thunks.moveColumnToDifferentBoard.fulfilled, (state, action) => {
      const removedColumnId = action.payload;

      // 1. Remove from columns object
      delete state.columns[removedColumnId];

      // 2. Remove from columnOrder array
      state.columnOrder = state.columnOrder.filter(
        (id) => id !== removedColumnId
      );
    });

    // --- Handle Delete Column ---
    builder.addCase(thunks.deleteColumn.fulfilled, (state, action) => {
      const columnId = action.payload;

      // Remove tasks associated with this column from state
      if (state.columns[columnId]) {
        const taskIdsToRemove = state.columns[columnId].taskIds;
        taskIdsToRemove.forEach((taskId) => {
          delete state.tasks[taskId];
        });
      }

      // Remove column from dictionary
      delete state.columns[columnId];

      // Remove from order array
      state.columnOrder = state.columnOrder.filter((id) => id !== columnId);
    });

    // --- Handle Create Task ---
    builder.addCase(thunks.createTask.fulfilled, (state, action) => {
      const task = action.payload;
      state.tasks[task.id] = {
        ...task,
        labelIds: [],
        assigneeIds: [],
        position: task.position ?? 99999,
      };
      const col = state.columns[task.column_id];
      if (col && !col.taskIds.includes(task.id)) {
        col.taskIds.push(task.id);
      }
    });
    // --- Handle Update Task ---
    builder.addCase(thunks.updateTask.fulfilled, (state, action) => {
      const updatedTask = action.payload;
      if (state.tasks[updatedTask.id]) {
        state.tasks[updatedTask.id] = {
          ...state.tasks[updatedTask.id],
          ...updatedTask,
        };
      }
    });

    // --- Handle Delete Task ---
    builder.addCase(thunks.deleteTask.fulfilled, (state, action) => {
      const { taskId, columnId } = action.payload;

      // 1. Remove from tasks object
      delete state.tasks[taskId];

      // 2. Remove from column's taskIds array
      if (state.columns[columnId]) {
        state.columns[columnId].taskIds = state.columns[
          columnId
        ].taskIds.filter((id) => id !== taskId);
      }

      // 3. Close the modal if open
      state.selectedTaskId = null;
    });

    // --- Handle Move All Tasks
    builder.addCase(thunks.moveAllTasks.fulfilled, (state, action) => {
      const { sourceColumnId, targetColumnId, movedTasks } = action.payload;

      if (!movedTasks || movedTasks.length === 0) return;

      const sourceColumn = state.columns[sourceColumnId];
      const targetColumn = state.columns[targetColumnId];

      if (!sourceColumn || !targetColumn) return;

      // 1. Move Task IDs in local state
      // Extract IDs that are being moved
      const movedTaskIds = movedTasks.map((t: Task) => t.id);

      // Remove from Source
      state.columns[sourceColumnId].taskIds = []; // Empty the source

      // Append to Target
      state.columns[targetColumnId].taskIds.push(...movedTaskIds);

      // 2. Update Task Objects
      movedTasks.forEach((task: Task) => {
        if (state.tasks[task.id]) {
          state.tasks[task.id].column_id = targetColumnId;
          state.tasks[task.id].position = task.position;
        }
      });
    });

    // --- Comments ---
    builder.addCase(thunks.fetchComments.fulfilled, (state, action) => {
      state.comments[action.payload.taskId] = action.payload.comments;
    });
    builder.addCase(thunks.createComment.fulfilled, (state, action) => {
      const { taskId, comment } = action.payload;
      if (!state.comments[taskId]) state.comments[taskId] = [];
      if (!state.comments[taskId].find(c => c.id === comment.id)) {
        state.comments[taskId].push(comment);
      }
    });

    // --- Handle Checklists
    builder.addCase(thunks.createChecklist.fulfilled, (state, action) => {
      const { taskId, checklist } = action.payload;
      if (!state.checklists[taskId]) state.checklists[taskId] = [];
      if (!state.checklists[taskId].find(c => c.id === checklist.id)) {
        state.checklists[taskId].push({ ...checklist, items: [] });
      }
    });

    builder.addCase(thunks.updateChecklist.fulfilled, (state, action) => {
      const checklist = action.payload;
      const taskId = checklist.task_id;
      if (state.checklists[taskId]) {
        const idx = state.checklists[taskId].findIndex(c => c.id === checklist.id);
        if (idx !== -1) {
          state.checklists[taskId][idx] = { ...state.checklists[taskId][idx], ...checklist };
        }
      }
    });

    builder.addCase(thunks.deleteChecklist.fulfilled, (state, action) => {
      const { taskId, checklistId } = action.payload;
      if (state.checklists[taskId]) {
        state.checklists[taskId] = state.checklists[taskId].filter(c => c.id !== checklistId);
      }
    });

    builder.addCase(thunks.createChecklistItem.fulfilled, (state, action) => {
      const item = action.payload;
      // We need taskId. We can find the checklist.
      for (const taskId in state.checklists) {
        const checklist = state.checklists[taskId].find(c => c.id === item.checklist_id);
        if (checklist && !checklist.items.find(i => i.id === item.id)) {
          checklist.items.push(item);
          break;
        }
      }
    });

    builder.addCase(thunks.updateChecklistItem.fulfilled, (state, action) => {
      const item = action.payload;
      for (const taskId in state.checklists) {
        const checklist = state.checklists[taskId].find(c => c.id === item.checklist_id);
        if (checklist) {
          const idx = checklist.items.findIndex(i => i.id === item.id);
          if (idx !== -1) {
            checklist.items[idx] = item;
            break;
          }
        }
      }
    });

    builder.addCase(thunks.deleteChecklistItem.fulfilled, (state, action) => {
      const { itemId } = action.payload;
      for (const taskId in state.checklists) {
        let found = false;
        for (const checklist of state.checklists[taskId]) {
          const idx = checklist.items.findIndex(i => i.id === itemId);
          if (idx !== -1) {
            checklist.items.splice(idx, 1);
            found = true;
            break;
          }
        }
        if (found) break;
      }
    });
    builder.addCase(thunks.updateComment.fulfilled, (state, action) => {
      const { taskId, comment } = action.payload;
      if (state.comments[taskId]) {
        const idx = state.comments[taskId].findIndex(c => c.id === comment.id);
        if (idx !== -1) state.comments[taskId][idx] = comment;
      }
    });
    builder.addCase(thunks.deleteComment.fulfilled, (state, action) => {
      const { taskId, commentId } = action.payload;
      if (state.comments[taskId]) {
        state.comments[taskId] = state.comments[taskId].filter(c => c.id !== commentId && c.parent_id !== commentId);
      }
    });

    // --- Attachments ---
    builder.addCase(thunks.fetchAttachments.fulfilled, (state, action) => {
      state.attachments[action.payload.taskId] = action.payload.attachments;
    });
    builder.addCase(thunks.uploadAttachment.fulfilled, (state, action) => {
      const { taskId, attachment } = action.payload;
      if (!state.attachments[taskId]) state.attachments[taskId] = [];
      if (!state.attachments[taskId].find(a => a.id === attachment.id)) {
        state.attachments[taskId].unshift(attachment);
      }
    });
    builder.addCase(thunks.deleteAttachment.fulfilled, (state, action) => {
      const { taskId, attachmentId } = action.payload;
      if (state.attachments[taskId]) {
        state.attachments[taskId] = state.attachments[taskId].filter(a => a.id !== attachmentId);
      }
    });
}
