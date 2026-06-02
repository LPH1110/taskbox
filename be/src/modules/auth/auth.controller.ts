import { NextFunction, Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import { prisma } from "../../lib/prisma";
import { signToken } from "../../utils/jwt";
import { sendSuccess, sendError } from "../../utils/api-response";
import { validate } from "../../middleware/validate";
import { loginSchema, registerSchema } from "./auth.schema";
import { requireAuth } from "../../middleware/auth";
import { env } from "../../config/env";

const router = Router();

// POST /api/auth/register
router.post("/register", validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, fullName } = req.body;

  try {
    const existing = await prisma.profile.findUnique({ where: { email } });
    if (existing) {
      return sendError(res, "Email already registered", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const profile = await prisma.profile.create({
      data: {
        email,
        password: hashedPassword,
        full_name: fullName,
        provider: "email",
      },
    });

    const token = signToken({ id: profile.id, email: profile.email });

    return sendSuccess(res, {
      token,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
      },
    }, 201);
  } catch (error) {
    return next(error);
  }
});

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const profile = await prisma.profile.findUnique({ where: { email } });
    if (!profile || !profile.password) {
      return sendError(res, "Invalid email or password", 400);
    }

    const match = await bcrypt.compare(password, profile.password);
    if (!match) {
      return sendError(res, "Invalid email or password", 400);
    }

    const token = signToken({ id: profile.id, email: profile.email });

    return sendSuccess(res, {
      token,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const user = req.user as any;
  return sendSuccess(res, {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    avatarUrl: user.avatar_url,
  });
});

// GET /api/auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

// GET /api/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${env.CLIENT_URL}/login` }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    const token = signToken({ id: user.id, email: user.email });

    // Send JWT token as a query parameter back to client dashboard/auth page
    return res.redirect(`${env.CLIENT_URL}/login?token=${token}`);
  }
);

export default router;
