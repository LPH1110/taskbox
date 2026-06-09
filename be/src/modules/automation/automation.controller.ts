import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess } from "../../utils/api-response";
import { validate } from "../../middleware/validate";
import { createAutomationRuleSchema } from "./automation.schema";
import { requireAuth, requireBoardMember } from "../../middleware/auth";

const router = Router({ mergeParams: true });

router.use(requireAuth);

// GET /api/boards/:boardId/automations
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  return requireBoardMember(req, res, async (err) => {
    if (err) return next(err);
    try {
      const rules = await prisma.automationRule.findMany({
        where: { board_id: req.params.boardId },
        orderBy: { created_at: "desc" },
      });
      return sendSuccess(res, rules);
    } catch (error) {
      return next(error);
    }
  });
});

// POST /api/boards/:boardId/automations
router.post("/", validate(createAutomationRuleSchema), async (req: Request, res: Response, next: NextFunction) => {
  return requireBoardMember(req, res, async (err) => {
    if (err) return next(err);
    try {
      const { title, trigger, condition, action, is_active } = req.body;
      const rule = await prisma.automationRule.create({
        data: {
          board_id: req.params.boardId,
          title,
          trigger,
          condition: condition || null,
          action,
          is_active: is_active ?? true,
        },
      });
      return sendSuccess(res, rule, 201);
    } catch (error) {
      return next(error);
    }
  });
});

// DELETE /api/boards/:boardId/automations/:ruleId
router.delete("/:ruleId", async (req: Request, res: Response, next: NextFunction) => {
  return requireBoardMember(req, res, async (err) => {
    if (err) return next(err);
    try {
      await prisma.automationRule.delete({
        where: { id: req.params.ruleId, board_id: req.params.boardId },
      });
      return sendSuccess(res, { deletedId: req.params.ruleId });
    } catch (error) {
      return next(error);
    }
  });
});

export default router;
