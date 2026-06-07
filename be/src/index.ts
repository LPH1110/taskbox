import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import { env } from "./config/env";
import { initSocket } from "./config/socket";
import { errorHandler } from "./middleware/error-handler";

import swaggerUi from "swagger-ui-express";
import { generateOpenApiDocument } from "./config/openapi";

// Passport config
import "./config/passport";

// Routers
import authRouter from "./modules/auth/auth.controller";
import boardsRouter from "./modules/boards/boards.controller";
import columnsRouter from "./modules/columns/columns.controller";
import tasksRouter from "./modules/tasks/tasks.controller";
import labelsRouter from "./modules/labels/labels.controller";
import membersRouter from "./modules/members/members.controller";
import workspacesRouter from "./modules/workspaces/workspaces.controller";
import invitationsRouter from "./modules/invitations/invitations.controller";
import commentsRouter from "./modules/comments/comments.controller";
import attachmentsRouter from "./modules/attachments/attachments.controller";

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Global Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow loading local background images
}));
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Health Check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP", time: new Date() });
});

// Swagger Documentation dynamically generated
const swaggerDocument = generateOpenApiDocument();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/boards", boardsRouter);
app.use("/api/workspaces", workspacesRouter);
app.use("/api/invitations", invitationsRouter);
app.use("/api", columnsRouter);
app.use("/api", tasksRouter);
app.use("/api", labelsRouter);
app.use("/api", membersRouter);
app.use("/api", commentsRouter);
app.use("/api", attachmentsRouter);

// Centralized Error Handling
app.use(errorHandler);

// Start Server
const port = env.PORT;
httpServer.listen(port, () => {
  console.log(`🚀 Taskbox backend listening on port ${port}`);
  console.log(`👉 CORS allowed origin: ${env.CLIENT_URL}`);
});
