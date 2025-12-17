export interface Board {
  id: string;
  title: string;
  type: "public" | "private";
  background_image: string; // URL or hex color
  is_favorite: boolean;
  createdAt: string;
  columnOrder?: string[]; // For keeping track of column positions later
}

export interface BoardState {
  boards: Board[];
  isLoading: boolean;
  error: string | null;
}
