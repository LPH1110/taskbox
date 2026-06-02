import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBoards } from "@/features/boards/boardsSlice";
import { useDebounce } from "@/hooks/use-debounce";
import { Link } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export function HeaderSearch() {
  const dispatch = useAppDispatch();
  const { items: boards, isLoading } = useAppSelector((state) => state.boards);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 250);

  // Load boards on input focus if they haven't been loaded yet
  const handleFocus = () => {
    setIsOpen(true);
    dispatch(fetchBoards());
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBoards = debouncedQuery.trim()
    ? boards.filter((board) =>
      board.title.toLowerCase().includes(debouncedQuery.toLowerCase())
    )
    : [];

  const starredBoards = boards.filter((board) => board.is_favorite);
  const showDropdown = isOpen && (query.trim() || starredBoards.length > 0);

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative flex items-center border rounded-md bg-card text-card-foreground shadow-sm transition-all focus-within:border-foreground/40 focus-within:ring-1 focus-within:ring-foreground/20">
        <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          name="searchInput"
          placeholder="Search boards..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          className="h-9 w-full bg-transparent pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground/60"
        />
        {isLoading && (
          <Loader2 className="absolute right-2.5 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 z-50 mt-1 w-full border bg-card p-1 shadow-lg max-h-60 overflow-y-auto custom-scrollbar"
          >
            {query.trim() ? (
              filteredBoards.length > 0 ? (
                <div className="space-y-0.5">
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Search Results
                  </div>
                  {filteredBoards.map((board) => (
                    <Link
                      key={board.id}
                      to={`/boards/${board.id}`}
                      onClick={() => {
                        setIsOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="font-medium truncate">{board.title}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {board.type}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No boards found matching "{query}"
                </div>
              )
            ) : starredBoards.length > 0 ? (
              <div className="space-y-0.5">
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Starred Boards
                </div>
                {starredBoards.map((board) => (
                  <Link
                    key={board.id}
                    to={`/boards/${board.id}`}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <span className="font-medium truncate">{board.title}</span>
                    <span className="text-xs text-yellow-500">★</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
