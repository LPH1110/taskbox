import { useAppSelector } from "@/store/hooks";
import { ChecklistGroup } from "./checklist-group";

export function ChecklistSection({ taskId }: { taskId: string }) {
  const checklists = useAppSelector((state) => state.boardDetail.checklists[taskId] || []);

  if (checklists.length === 0) return null;

  return (
    <div className="space-y-6">
      {checklists.map((checklist) => (
        <ChecklistGroup key={checklist.id} checklist={checklist} taskId={taskId} />
      ))}
    </div>
  );
}
