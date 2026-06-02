export interface Board {
  id: string;
  title: string;
  type: "public" | "private" | string;
  background_image: string | null;
  is_favorite: boolean;
  created_at: string;
  owner_id?: string;
  columnOrder?: string[];
  role?: "admin" | "member" | "viewer";
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
