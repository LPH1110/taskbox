import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/api-response";
import { validate } from "../../middleware/validate";
import { createWorkspaceSchema, updateWorkspaceSchema, workspaceIdParamSchema } from "./workspaces.schema";
import { requireAuth } from "../../middleware/auth";

const router = Router();

// Protect all workspace routes
router.use(requireAuth);

// GET /api/workspaces (Fetch user's workspaces)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any).id;

  try {
    const workspaces = await prisma.workspace.findMany({
      where: { owner_id: userId },
      orderBy: { created_at: "desc" },
    });

    return sendSuccess(res, workspaces);
  } catch (error) {
    return next(error);
  }
});

// POST /api/workspaces (Create Workspace)
router.post("/", validate(createWorkspaceSchema), async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any).id;
  const { name, description, logoUrl } = req.body;

  try {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug: uniqueSlug,
        description,
        logo_url: logoUrl,
        owner_id: userId,
      },
    });

    return sendSuccess(res, workspace, 201);
  } catch (error) {
    return next(error);
  }
});

// GET /api/workspaces/:id (Get Workspace Detail + Board count)
router.get("/:id", validate(workspaceIdParamSchema), async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any).id;
  const { id } = req.params;

  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id,
        owner_id: userId,
      },
      include: {
        _count: {
          select: { boards: true },
        },
      },
    });

    if (!workspace) {
      return sendError(res, "Workspace not found", 404);
    }

    return sendSuccess(res, workspace);
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/workspaces/:id (Update Workspace)
router.patch("/:id", validate(updateWorkspaceSchema), async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any).id;
  const { id } = req.params;
  const { name, description, logoUrl } = req.body;

  try {
    // Verify ownership
    const existing = await prisma.workspace.findFirst({
      where: { id, owner_id: userId },
    });

    if (!existing) {
      return sendError(res, "Workspace not found", 404);
    }

    const updated = await prisma.workspace.update({
      where: { id },
      data: {
        name,
        description,
        logo_url: logoUrl,
      },
    });

    return sendSuccess(res, updated);
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/workspaces/:id (Delete Workspace)
router.delete("/:id", validate(workspaceIdParamSchema), async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any).id;
  const { id } = req.params;

  try {
    const existing = await prisma.workspace.findFirst({
      where: { id, owner_id: userId },
    });

    if (!existing) {
      return sendError(res, "Workspace not found", 404);
    }

    await prisma.workspace.delete({
      where: { id },
    });

    return sendSuccess(res, { message: "Workspace deleted successfully" });
  } catch (error) {
    return next(error);
  }
});

export default router;
