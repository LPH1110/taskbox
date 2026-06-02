import { getIO } from "../config/socket";

export const socketEmitter = {
  toBoardRoom(boardId: string, event: string, payload: any) {
    try {
      const io = getIO();
      io.to(`board:${boardId}`).emit(event, payload);
    } catch (err) {
      console.warn("⚠️ Failed to emit socket event (socket.io might not be running yet):", err);
    }
  },
};
