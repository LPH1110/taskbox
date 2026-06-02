export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  owner_id: string;
  created_at: string;
  _count?: {
    boards: number;
  };
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ActivityLog {
  id: string;
  workspace_id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: {
    actor_name?: string;
    actor_email?: string;
    target_name?: string;
    target_email?: string;
    role?: string;
    board_title?: string;
    [key: string]: any;
  } | null;
  created_at: string;
  actor?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  role: "admin" | "member";
  token: string;
  invited_by: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "expired";
  expires_at: string;
  created_at: string;
}


