import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchWorkspaces, setActiveWorkspaceId } from "@/features/workspaces/workspacesSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Plus, Briefcase } from "lucide-react";
import { CreateWorkspaceDialog } from "@/features/workspaces/components/create-workspace-dialog";
import { useNavigate } from "react-router-dom";

export function WorkspaceSwitcher() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: workspaces, activeWorkspaceId } = useAppSelector((state) => state.workspaces);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  const handleSelect = (id: string) => {
    dispatch(setActiveWorkspaceId(id));
    navigate(`/workspaces/${id}`);
  };

  return (
    <div className="px-4 py-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full border justify-between px-3 py-6 text-left font-medium hover:bg-muted"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 font-bold text-xs text-primary">
                {activeWorkspace ? activeWorkspace.name.charAt(0).toUpperCase() : <Briefcase className="h-3 w-3" />}
              </div>
              <span className="truncate">
                {activeWorkspace ? activeWorkspace.name : "Select Workspace"}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]" align="start">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Workspaces
          </div>
          {workspaces.map((w) => (
            <DropdownMenuItem
              key={w.id}
              onClick={() => handleSelect(w.id)}
              className="flex items-center gap-2 cursor-pointer font-medium"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                {w.name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">{w.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <CreateWorkspaceDialog
            trigger={
              <button className="flex w-full items-center px-2 py-1.5 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground outline-none cursor-pointer">
                <Plus className="mr-2 h-4 w-4" /> Create Workspace
              </button>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
