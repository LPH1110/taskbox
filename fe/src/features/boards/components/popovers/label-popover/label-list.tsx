import { Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Label } from "@/features/boards/types/board-detail";
import { useTranslation } from "react-i18next";

interface LabelListProps {
  search: string;
  setSearch: (val: string) => void;
  filteredLabels: Label[];
  taskLabelIds: string[];
  handleToggle: (id: string) => void;
  startEdit: (label: Label) => void;
  startCreate: () => void;
}

export function LabelList({
  search,
  setSearch,
  filteredLabels,
  taskLabelIds,
  handleToggle,
  startEdit,
  startCreate
}: LabelListProps) {
  const { t } = useTranslation(["boards"]);
  return (
    <>
      <Input
        placeholder={t("search_labels_placeholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-8 mb-3"
        autoFocus
      />

      <div className="space-y-1 max-h-64 overflow-y-auto mb-3">
        <span className="text-xs font-semibold text-muted-foreground block mb-2">
          {t("label_popover_title")}
        </span>
        {filteredLabels.map((label) => {
          const isActive = taskLabelIds.includes(label.id);
          return (
            <div
              key={label.id}
              className="flex items-center gap-2 group"
            >
              <div
                className="flex-1 h-8 rounded text-white text-sm font-medium px-3 flex items-center cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: label.color }}
                onClick={() => handleToggle(label.id)}
              >
                <span className="truncate">{label.title}</span>
                {isActive && (
                  <Check className="ml-auto h-4 w-4 shrink-0" />
                )}
              </div>
              {/* Edit Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(label);
                }}
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button
        variant="secondary"
        className="w-full h-8 text-sm bg-muted/50 hover:bg-muted"
        onClick={startCreate}
      >
        {t("create_new_label")}
      </Button>
    </>
  );
}
