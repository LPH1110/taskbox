import { prisma } from "../../lib/prisma";
import { socketEmitter } from "../../lib/socket-emitter";
import { invalidateBoardCache } from "../../utils/redis";
import nodemailer from "nodemailer";
import { AutomationActionConfig } from "./automation.types";

const smtpHost = process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io";
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || "noreply@taskbox.dev";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

export const ActionHandlers = {
  async executeMoveToColumn(action: AutomationActionConfig, payload: any, boardId: string) {
    const taskId = payload.taskId;
    const columnId = action.columnId;
    if (!taskId || !columnId) throw new Error("Missing taskId or columnId");

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (task && task.column_id !== columnId) {
      const lastTask = await prisma.task.findFirst({
        where: { column_id: columnId },
        orderBy: { position: 'desc' }
      });
      const position = lastTask ? lastTask.position + 65536 : 65536;

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { column_id: columnId, position }
      });

      socketEmitter.toBoardRoom(boardId, "task:upsert", updatedTask);
      await invalidateBoardCache(boardId);
    }
  },

  async executeAssignUser(action: AutomationActionConfig, payload: any, boardId: string) {
    const taskId = payload.taskId;
    const userId = action.userId;
    if (!taskId || !userId) throw new Error("Missing taskId or userId");

    const existing = await prisma.taskAssignee.findUnique({
      where: { task_id_user_id: { task_id: taskId, user_id: userId } }
    });

    if (!existing) {
      await prisma.taskAssignee.create({ data: { task_id: taskId, user_id: userId } });
      socketEmitter.toBoardRoom(boardId, "taskAssignee:event", { task_id: taskId, user_id: userId, type: "INSERT" });
      await invalidateBoardCache(boardId);
    }
  },

  async executeAddLabel(action: AutomationActionConfig, payload: any, boardId: string) {
    const taskId = payload.taskId;
    const labelId = action.labelId;
    if (!taskId || !labelId) throw new Error("Missing taskId or labelId");

    const existing = await prisma.taskLabel.findUnique({
      where: { task_id_label_id: { task_id: taskId, label_id: labelId } }
    });

    if (!existing) {
      await prisma.taskLabel.create({ data: { task_id: taskId, label_id: labelId } });
      socketEmitter.toBoardRoom(boardId, "taskLabel:event", { task_id: taskId, label_id: labelId, type: "INSERT" });
      await invalidateBoardCache(boardId);
    }
  },

  async executeRemoveLabel(action: AutomationActionConfig, payload: any, boardId: string) {
    const taskId = payload.taskId;
    const labelId = action.labelId;
    if (!taskId || !labelId) throw new Error("Missing taskId or labelId");

    try {
      await prisma.taskLabel.delete({
        where: { task_id_label_id: { task_id: taskId, label_id: labelId } }
      });
      socketEmitter.toBoardRoom(boardId, "taskLabel:event", { task_id: taskId, label_id: labelId, type: "DELETE" });
      await invalidateBoardCache(boardId);
    } catch (e) {
      // Ignore if not found
    }
  },

  async executeSetDueDate(action: AutomationActionConfig, payload: any, boardId: string) {
    const taskId = payload.taskId;
    const formula = action.formula; // e.g. "now + 3 days"
    if (!taskId || !formula) throw new Error("Missing taskId or formula");

    let newDate = new Date();
    if (formula.includes("now +")) {
      const days = parseInt(formula.replace(/[^0-9]/g, ""), 10) || 0;
      newDate.setDate(newDate.getDate() + days);
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { due_date: newDate }
    });

    socketEmitter.toBoardRoom(boardId, "task:upsert", updatedTask);
    await invalidateBoardCache(boardId);
  },

  async executeSendEmailNotification(action: AutomationActionConfig, payload: any, _boardId: string) {
    const taskId = payload.taskId;
    const target = action.target; // "assignees" or "owner"
    const message = action.message || "An automated action was triggered on your task.";

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignees: { include: { profile: true } },
        column: { include: { board: { include: { owner: true } } } }
      }
    });
    if (!task) return;

    let emails: string[] = [];
    if (target === "owner" && task.column.board.owner?.email) {
      emails.push(task.column.board.owner.email);
    } else if (target === "assignees") {
      emails = task.assignees.map(a => a.profile.email).filter(Boolean);
    }

    if (emails.length === 0) return;

    await transporter.sendMail({
      from: `"Taskbox Automation" <${smtpFrom}>`,
      to: emails.join(", "),
      subject: `Taskbox Alert: ${task.content}`,
      html: `<p>${message}</p>`,
    });
  },

  async executePostComment(action: AutomationActionConfig, payload: any, boardId: string) {
    const taskId = payload.taskId;
    const text = action.text;
    if (!taskId || !text) throw new Error("Missing taskId or text");

    // Use board owner as the bot if system user doesn't exist, or a designated ID
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) return;

    const comment = await prisma.comment.create({
      data: {
        content: `🤖 Automation Bot: ${text}`,
        task_id: taskId,
        author_id: board.owner_id, // Fallback to owner ID for the bot
      }
    });

    socketEmitter.toBoardRoom(boardId, "comment:event", { taskId, comment, type: "INSERT" });
    await invalidateBoardCache(boardId);
  },

  async executeAddChecklistTemplate(action: AutomationActionConfig, payload: any, boardId: string) {
    const taskId = payload.taskId;
    const template = action.template; // { title: string, items: string[] }
    if (!taskId || !template) throw new Error("Missing taskId or template");

    const checklist = await prisma.checklist.create({
      data: {
        title: template.title || "Automation Checklist",
        task_id: taskId,
        items: {
          create: (template.items || []).map((text: string) => ({ content: text, is_completed: false }))
        }
      },
      include: { items: true }
    });

    socketEmitter.toBoardRoom(boardId, "checklist:create", checklist);
    await invalidateBoardCache(boardId);
  }
};
