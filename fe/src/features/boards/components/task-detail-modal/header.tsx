import { Badge } from "@/components/ui/badge";
import { DialogDescription } from "@/components/ui/dialog";
import { InlineEditable } from "@/components/ui/inline-editable";
import { Layout } from "lucide-react";
import { type Column, type Label, type Task } from "../../types/board-detail";
import { useTranslation } from "react-i18next";

interface HeaderProps {
    task: Task;
    column: Column;
    taskLabels: Label[];
    handleRenameTask: (newTitle: string) => void;
}

export function Header({ task, column, taskLabels, handleRenameTask }: HeaderProps) {
    const { t } = useTranslation(["boards"]);
    return <div className="flex gap-4">
        <Layout className="mt-1 h-6 w-6 text-muted-foreground shrink-0" />
        <div className="space-y-1.5 w-full">
            <div className="mr-8">
                <InlineEditable
                    value={task.content}
                    onSave={handleRenameTask}
                    className="text-2xl font-bold leading-tight -ml-2"
                    inputClassName="text-2xl font-bold h-10"
                />
            </div>
            <DialogDescription className="text-sm flex items-center gap-1.5">
                {t("in_list")}{" "}
                <span className="font-semibold underline decoration-muted-foreground/30 underline-offset-4">{column.title}</span>
            </DialogDescription>

            {/* Label Display */}
            {taskLabels.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 animate-in fade-in slide-in-from-top-2">
                    {taskLabels.map(label => (
                        <Badge
                            key={label.id}
                            variant="secondary"
                            className="px-2 py-0.5 text-xs font-medium text-white shadow-sm"
                            style={{ backgroundColor: label.color }}
                        >
                            {label.title}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    </div>
}