import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/api-response";
import { validate } from "../../middleware/validate";
import { requireAuth, requireBoardMember } from "../../middleware/auth";
import { socketEmitter } from "../../lib/socket-emitter";
import multer from "multer";
import { uploadFile, deleteFile } from "../../lib/s3";
import { deleteAttachmentSchema } from "./attachments.schema";

const router = Router();
router.use(requireAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

async function getBoardIdForTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { board_id: true },
  });
  return task?.board_id;
}

// GET /api/tasks/:taskId/attachments
router.get("/tasks/:taskId/attachments", async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;

  try {
    const boardId = await getBoardIdForTask(taskId);
    if (!boardId) return sendError(res, "Task not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      try {
        const attachments = await prisma.attachment.findMany({
          where: { task_id: taskId },
          include: {
            uploader: {
              select: {
                id: true,
                full_name: true,
                avatar_url: true,
                email: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        });

        return sendSuccess(res, attachments);
      } catch (e) {
        return next(e);
      }
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/tasks/:taskId/attachments
router.post("/tasks/:taskId/attachments", upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;
  const userId = (req.user as any).id;
  const file = req.file;

  if (!file) {
    return sendError(res, "No file uploaded", 400);
  }

  try {
    const boardId = await getBoardIdForTask(taskId);
    if (!boardId) return sendError(res, "Task not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      try {
        // Upload to S3
        const { url } = await uploadFile(file, boardId, taskId);

        // Save to DB
        const attachment = await prisma.attachment.create({
          data: {
            task_id: taskId,
            uploader_id: userId,
            file_name: file.originalname,
            file_url: url,
            file_size: file.size,
            mime_type: file.mimetype,
          },
          include: {
            uploader: {
              select: {
                id: true,
                full_name: true,
                avatar_url: true,
                email: true,
              },
            },
          },
        });

        socketEmitter.toBoardRoom(boardId, "attachment:create", { attachment });

        return sendSuccess(res, attachment, 201);
      } catch (e: any) {
        if (e.message === "AWS S3 is not configured") {
          return sendError(res, "Server is not configured for file uploads", 503);
        }
        return next(e);
      }
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/attachments/:attachmentId
router.delete("/attachments/:attachmentId", validate(deleteAttachmentSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { attachmentId } = req.params;
  const userId = (req.user as any).id;

  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { task: { select: { board_id: true, id: true } } },
    });

    if (!attachment) return sendError(res, "Attachment not found", 404);

    let isAuthorized = attachment.uploader_id === userId;

    if (!isAuthorized) {
      const membership = await prisma.boardMember.findUnique({
        where: { board_id_user_id: { board_id: attachment.task.board_id, user_id: userId } },
      });
      if (membership?.role === "admin") {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) return sendError(res, "Only the uploader or a board admin can delete this attachment", 403);

    try {
      const urlObj = new URL(attachment.file_url);
      const key = urlObj.pathname.substring(1);

      await deleteFile(key);
    } catch (e: any) {
      console.error("Failed to delete file from S3:", e);
    }

    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    socketEmitter.toBoardRoom(attachment.task.board_id, "attachment:delete", {
      attachmentId,
      taskId: attachment.task.id
    });

    return sendSuccess(res, { attachmentId, taskId: attachment.task.id });
  } catch (error) {
    return next(error);
  }
});

export default router;
