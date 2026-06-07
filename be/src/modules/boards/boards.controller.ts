import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/api-response";
import { validate } from "../../middleware/validate";
import { createBoardSchema, boardIdParamSchema, updateBoardSchema } from "./boards.schema";
import { requireAuth, requireBoardMember } from "../../middleware/auth";
import { socketEmitter } from "../../lib/socket-emitter";
import { logActivity } from "../../utils/activity-logger";
import { redis, invalidateBoardCache } from "../../utils/redis";


const router = Router();

// Protect all board routes
router.use(requireAuth);

// GET /api/boards (Fetch boards owned or co-shared)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any).id;
  const workspaceId = req.query.workspaceId as string | undefined;

  try {
    const boards = await prisma.board.findMany({
      where: {
        ...(workspaceId ? { workspace_id: workspaceId } : {}),
        OR: [
          { owner_id: userId },
          {
            members: {
              some: { user_id: userId },
            },
          },
          {
            type: "public",
            workspace: {
              OR: [
                { owner_id: userId },
                { members: { some: { user_id: userId } } },
              ],
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
  const { title, background, type, workspaceId } = req.body;

  try {
    // Verify that workspace belongs to user or user is workspace member
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { owner_id: userId },
          { members: { some: { user_id: userId } } },
        ],
      },
    });
    if (!workspace) {
      return sendError(res, "Workspace not found or unauthorized", 403);
    }

    const board = await prisma.board.create({
      data: {
        title,
        background_image: background,
        type,
        owner_id: userId,
        workspace_id: workspaceId,
      },
    });

    // Log activity
    await logActivity({
      workspaceId,
      actorId: userId,
      action: "board.created",
      targetType: "board",
      targetId: board.id,
      metadata: {
        board_title: board.title,
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
    await invalidateBoardCache(boardId);

    return sendSuccess(res, updated);
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/boards/:boardId (Update board details like title or visibility type)
router.patch("/:boardId", requireBoardMember, validate(updateBoardSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { boardId } = req.params;
  const { title, type } = req.body;
  const userId = (req.user as any).id;

  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { owner_id: true, workspace_id: true },
    });

    if (!board) {
      return sendError(res, "Board not found", 404);
    }

    // Check if user is owner
    let isAuthorized = board.owner_id === userId;

    if (!isAuthorized) {
      // Check if user is board admin
      const membership = await prisma.boardMember.findUnique({
        where: {
          board_id_user_id: {
            board_id: boardId,
            user_id: userId,
          },
        },
        select: { role: true },
      });
      if (membership?.role === "admin") {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return sendError(res, "Forbidden: Only board owners or admins can modify board settings", 403);
    }

    const updated = await prisma.board.update({
      where: { id: boardId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(type !== undefined ? { type } : {}),
      },
    });

    // Notify other clients about update
    socketEmitter.toBoardRoom(boardId, "board:update", updated);
    await invalidateBoardCache(boardId);

    return sendSuccess(res, updated);
  } catch (error) {
    return next(error);
  }
});

// GET /api/boards/:boardId/detail (Get full composite board details: columns, tasks, labels, members, etc.)
router.get("/:boardId/detail", requireBoardMember, validate(boardIdParamSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { boardId } = req.params;
  const cacheKey = `board_detail:${boardId}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return sendSuccess(res, JSON.parse(cached));
    }

    // 1. Fetch Board Meta and Owner
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!board) return sendError(res, "Board not found", 404);

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
    const adaptedMembers = members.map((m: any) => ({
      board_id: m.board_id,
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      profiles: m.profile, // Matches Redux store profiles key
    }));

    // Explicitly add the owner if they aren't already in the list
    if (board && !adaptedMembers.find(m => m.user_id === board.owner_id)) {
      adaptedMembers.unshift({
        board_id: board.id,
        user_id: board.owner_id,
        role: "admin", // Treat owner as admin
        joined_at: board.created_at,
        profiles: board.owner,
      });
    }

    // 5. Fetch Tasks for all board's columns
    const columnIds = columns.map((c: any) => c.id);
    let tasks: any[] = [];
    let taskLabels: any[] = [];
    let taskAssignees: any[] = [];

    if (columnIds.length > 0) {
      tasks = await prisma.task.findMany({
        where: { column_id: { in: columnIds } },
        orderBy: { position: "asc" },
      });

      const taskIds = tasks.map((t: any) => t.id);
      if (taskIds.length > 0) {
        taskLabels = await prisma.taskLabel.findMany({
          where: { task_id: { in: taskIds } },
        });
        taskAssignees = await prisma.taskAssignee.findMany({
          where: { task_id: { in: taskIds } },
        });
      }
    }

    const boardDetail = {
      board,
      columns,
      tasks,
      labels,
      members: adaptedMembers,
      taskLabels,
      taskAssignees,
    };

    await redis.setex(cacheKey, 3600, JSON.stringify(boardDetail));

    return sendSuccess(res, boardDetail);
  } catch (error) {
    return next(error);
  }
});

export default router;
