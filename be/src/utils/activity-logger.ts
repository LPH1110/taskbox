import { prisma } from "../lib/prisma";

interface LogActivityParams {
  workspaceId: string;
  actorId: string;
  action: string; // e.g., "member.invited" | "member.removed" | "member.role_changed" | "board.created" | "board.deleted"
  targetType: "member" | "board" | "invitation";
  targetId?: string;
  metadata?: any;
}

export async function logActivity({
  workspaceId,
  actorId,
  action,
  targetType,
  targetId,
  metadata = {},
}: LogActivityParams) {
  try {
    // Fetch actor details for denormalization
    const actor = await prisma.profile.findUnique({
      where: { id: actorId },
      select: { full_name: true, email: true },
    });

    const denormalizedMetadata = {
      ...metadata,
      actor_name: actor?.full_name || "Unknown User",
      actor_email: actor?.email || "",
    };

    const log = await prisma.activityLog.create({
      data: {
        workspace_id: workspaceId,
        actor_id: actorId,
        action,
        target_type: targetType,
        target_id: targetId,
        metadata: denormalizedMetadata,
      },
    });

    return log;
  } catch (error) {
    console.error("Failed to log activity:", error);
    return null;
  }
}

