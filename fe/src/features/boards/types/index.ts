export interface Board {
  id: string;
  title: string;
  workspace_id: string;
  type: "public" | "private" | string;
  background_image: string | null;
  is_favorite: boolean;
  created_at: string;
  owner_id?: string;
  columnOrder?: string[];
  role?: "admin" | "member" | "viewer";
  github_repo_full_name?: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface BoardMember {
  board_id: string;
  user_id: string;
  role: "admin" | "member" | "viewer";
  joined_at: string;
  profiles?: UserProfile;
}

export interface BoardState {
  boards: Board[];
  isLoading: boolean;
  error: string | null;
}
