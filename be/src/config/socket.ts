import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { env } from "./env";

let io: SocketServer | null = null;

export function initSocket(server: HttpServer): SocketServer {
  io = new SocketServer(server, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Join a specific board room
    socket.on("join:board", (boardId: string) => {
      socket.join(`board:${boardId}`);
      console.log(`🔌 Socket ${socket.id} joined room board:${boardId}`);
    });

    // Leave a board room
    socket.on("leave:board", (boardId: string) => {
      socket.leave(`board:${boardId}`);
      console.log(`🔌 Socket ${socket.id} left room board:${boardId}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }
  return io;
}
