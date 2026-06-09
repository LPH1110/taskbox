import { useAppSelector } from "@/store/hooks";
import { ChecklistGroup } from "./checklist-group";
import { AnimatePresence, motion } from "motion/react";

export function ChecklistSection({ taskId }: { taskId: string }) {
  const checklists = useAppSelector((state) => state.boardDetail.checklists[taskId] || []);

  if (checklists.length === 0) return null;

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {checklists.map((checklist) => (
          <motion.div
            key={checklist.id}
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, height: 0, overflow: "hidden" }}
            transition={{ duration: 0.2, layout: { duration: 0.2 } }}
          >
            <ChecklistGroup checklist={checklist} taskId={taskId} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
