import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess } from "../../utils/api-response";
import { validate } from "../../middleware/validate";
import { createBoardSchema, boardIdParamSchema } from "./boards.schema";
import { requireAuth, requireBoardMember } from "../../middleware/auth";
import { socketEmitter } from "../../lib/socket-emitter";

const router = Router();

// Protect all board routes
router.use(requireAuth);

// GET /api/boards (Fetch boards owned or co-shared)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any).id;

  try {
    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { owner_id: userId },
          {
            members: {
              some: { user_id: userId },
            },
          },
        ],
      },
      orderBy: { created_at: "desc" },
    });

    return sendSuccess(res, boards);
  } catch (error) {
    return next(error);
  }
});

// POST /api/boards (Create Board)
router.post("/", validate(createBoardSchema), async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any).id;
  const { title, background, type } = req.body;

  try {
    const board = await prisma.board.create({
      data: {
        title,
        background_image: background,
        type,
        owner_id: userId,
      },
    });

    return sendSuccess(res, board, 201);
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/boards/:boardId/favorite (Toggle favorite status)
router.patch("/:boardId/favorite", requireBoardMember, validate(boardIdParamSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { boardId } = req.params;

  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { is_favorite: true },
    });

    const updated = await prisma.board.update({
      where: { id: boardId },
      data: { is_favorite: !board?.is_favorite },
    });

    // Notify other clients about favorite status update
    socketEmitter.toBoardRoom(boardId, "board:update", updated);

    return sendSuccess(res, updated);
  } catch (error) {
    return next(error);
  }
});

// GET /api/boards/:boardId/detail (Get full composite board details: columns, tasks, labels, members, etc.)
router.get("/:boardId/detail", requireBoardMember, validate(boardIdParamSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { boardId } = req.params;

  try {
    // 1. Fetch Board Meta
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    // 2. Fetch Columns (ordered by position)
    const columns = await prisma.column.findMany({
      where: { board_id: boardId },
      orderBy: { position: "asc" },
    });

    // 3. Fetch Labels
    const labels = await prisma.label.findMany({
      where: { board_id: boardId },
    });

    // 4. Fetch Members with Profile Details
    const members = await prisma.boardMember.findMany({
      where: { board_id: boardId },
      include: {
        profile: {
          select: {
            id: true,
            email: true,
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });

    // Adapt to same format as client expects: profiles nested under profiles key or flattened
    const adaptedMembers = members.map((m) => ({
      board_id: m.board_id,
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      profiles: m.profile, // Matches Redux store profiles key
    }));

    // 5. Fetch Tasks for all board's columns
    const columnIds = columns.map((c) => c.id);
    let tasks: any[] = [];
    let taskLabels: any[] = [];

    if (columnIds.length > 0) {
      tasks = await prisma.task.findMany({
        where: { column_id: { in: columnIds } },
        orderBy: { position: "asc" },
      });

      const taskIds = tasks.map((t) => t.id);
      if (taskIds.length > 0) {
        taskLabels = await prisma.taskLabel.findMany({
          where: { task_id: { in: taskIds } },
        });
      }
    }

    return sendSuccess(res, {
      board,
      columns,
      tasks,
      labels,
      members: adaptedMembers,
      taskLabels,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
