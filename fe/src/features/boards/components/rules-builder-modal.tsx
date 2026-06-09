import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Zap, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Rule {
  id: string;
  title: string;
  trigger: any;
  condition: any;
  action: any;
  is_active: boolean;
}

export function RulesBuilderModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation(["boards"]);
  const board = useAppSelector((state) => state.boardDetail.currentBoard);
  const columns = useAppSelector((state) => Object.values(state.boardDetail.columns));
  const members = useAppSelector((state) => state.boardDetail.members);
  const labels = useAppSelector((state) => Object.values(state.boardDetail.labels));

  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [triggerType, setTriggerType] = useState("TASK_MOVED");
  const [conditionCol, setConditionCol] = useState("");

  const [actionType, setActionType] = useState("MOVE_TO_COLUMN");
  const [actionTargetCol, setActionTargetCol] = useState("");
  const [actionTargetUser, setActionTargetUser] = useState("");
  const [actionTargetLabel, setActionTargetLabel] = useState("");
  const [actionDueDate, setActionDueDate] = useState("now + 3 days");
  const [actionEmailTarget, setActionEmailTarget] = useState("owner");
  const [actionComment, setActionComment] = useState("");
  const [actionChecklist, setActionChecklist] = useState("Review,Sign,Deploy");

  const fetchRules = async () => {
    if (!board?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/boards/${board?.id}/automations`);
      setRules(res.data || []);
    } catch (e) {
      console.error("Failed to fetch rules", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRules();
      setIsCreating(false);
    }
  }, [isOpen, board?.id]);

  const handleCreate = async () => {
    if (!board?.id) return;
    if (!title || (triggerType === "TASK_MOVED" && !conditionCol)) return;

    try {
      const condition = triggerType === "TASK_MOVED" ? { toColumnId: conditionCol } : {};
      const action: any = { type: actionType };

      if (actionType === "MOVE_TO_COLUMN") action.columnId = actionTargetCol;
      if (actionType === "ASSIGN_USER") action.userId = actionTargetUser;
      if (actionType === "ADD_LABEL" || actionType === "REMOVE_LABEL") action.labelId = actionTargetLabel;
      if (actionType === "SET_DUE_DATE") action.formula = actionDueDate;
      if (actionType === "SEND_EMAIL_NOTIFICATION") action.target = actionEmailTarget;
      if (actionType === "POST_COMMENT") action.text = actionComment;
      if (actionType === "ADD_CHECKLIST_TEMPLATE") {
        action.template = { title: "Automated Checklist", items: actionChecklist.split(',') };
      }

      const res = await api.post(`/boards/${board.id}/automations`, {
        title,
        trigger: { type: triggerType },
        condition,
        action,
        is_active: true,
      });

      setRules([res.data, ...rules]);
      setIsCreating(false);

      // Reset form
      setTitle("");
      setConditionCol("");
      setActionTargetCol("");
      setActionTargetUser("");
      setActionTargetLabel("");
      setActionComment("");
    } catch (e) {
      console.error("Failed to create rule", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!board?.id) return;
    try {
      await api.delete(`/boards/${board.id}/automations/${id}`);
      setRules(rules.filter((r) => r.id !== id));
    } catch (e) {
      console.error("Failed to delete rule", e);
    }
  };

  const getColName = (id: string) => columns.find(c => c.id === id)?.title || "Unknown Column";
  const getUserName = (id: string) => members.find(m => m.user_id === id)?.profiles?.full_name || "Unknown User";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl bg-background border-border/40 shadow-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Zap className="h-5 w-5 text-amber-500" />
            {t("automation_rules", "Automation Rules")}
          </DialogTitle>
          <DialogDescription>
            {t("automation_desc", "Automate repetitive tasks by creating trigger-action workflows.")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <AnimatePresence mode="popLayout">
            {!isCreating ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{t("active_rules", "Active Rules")}</h3>
                  <Button onClick={() => setIsCreating(true)} size="sm">
                    {t("create_rule", "Create Rule")}
                  </Button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {loading ? (
                    <div className="text-sm text-muted-foreground">{t("loading", "Loading...")}</div>
                  ) : rules.length === 0 ? (
                    <div className="text-sm text-muted-foreground bg-muted/30 p-8 rounded-lg text-center border border-dashed border-border/50">
                      <Zap className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      {t("no_rules", "No automation rules configured yet.")}
                    </div>
                  ) : (
                    <AnimatePresence>
                      {rules.map((rule) => (
                        <motion.div
                          key={rule.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:border-primary/30 transition-colors shadow-sm gap-4"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="font-medium text-sm flex items-center gap-2">
                              <span className="truncate">{rule.title}</span>
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                              <span className="bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground font-medium">When</span>
                              moved to <strong className="text-foreground truncate max-w-[100px] sm:max-w-[150px] inline-block align-bottom">{getColName(rule.condition?.toColumnId)}</strong>
                              <ArrowRight className="h-3 w-3 mx-1 shrink-0" />
                              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Then</span>
                              {rule.action?.type === "MOVE_TO_COLUMN" && <span>move to <strong className="text-foreground truncate max-w-[100px] sm:max-w-[150px] inline-block align-bottom">{getColName(rule.action.columnId)}</strong></span>}
                              {rule.action?.type === "ASSIGN_USER" && <span>assign to <strong className="text-foreground truncate max-w-[100px] sm:max-w-[150px] inline-block align-bottom">{getUserName(rule.action.userId)}</strong></span>}
                              {rule.action?.type === "ADD_LABEL" && <span>add label</span>}
                              {rule.action?.type === "REMOVE_LABEL" && <span>remove label</span>}
                              {rule.action?.type === "SET_DUE_DATE" && <span>set due date to <strong className="text-foreground truncate max-w-[100px] sm:max-w-[150px] inline-block align-bottom">{rule.action.formula}</strong></span>}
                              {rule.action?.type === "SEND_EMAIL_NOTIFICATION" && <span>email <strong className="text-foreground truncate max-w-[100px] sm:max-w-[150px] inline-block align-bottom">{rule.action.target}</strong></span>}
                              {rule.action?.type === "POST_COMMENT" && <span>post auto-comment</span>}
                              {rule.action?.type === "ADD_CHECKLIST_TEMPLATE" && <span>add checklist</span>}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 bg-muted/20 p-5 rounded-lg border border-border/50"
              >
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("rule_name", "Rule Name")}</label>
                    <Input placeholder="e.g. Set Due Date when in Review" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-background p-3 rounded border border-border/50 shadow-sm min-w-0">
                      <div className="flex items-center gap-2 mb-2 text-sm font-semibold border-b border-border/50 pb-2">
                        <Play className="h-4 w-4 text-indigo-500 shrink-0" /> Trigger
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">When this happens:</div>
                      <Select value={triggerType} onValueChange={setTriggerType}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select trigger..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TASK_MOVED"><span className="truncate block max-w-[200px] md:max-w-[300px]">Task is Moved</span></SelectItem>
                          <SelectItem value="LABEL_ADDED"><span className="truncate block max-w-[200px] md:max-w-[300px]">Label Added</span></SelectItem>
                          <SelectItem value="LABEL_REMOVED"><span className="truncate block max-w-[200px] md:max-w-[300px]">Label Removed</span></SelectItem>
                          <SelectItem value="CHECKLIST_COMPLETED"><span className="truncate block max-w-[200px] md:max-w-[300px]">Checklist Completed</span></SelectItem>
                          <SelectItem value="DUE_DATE_APPROACHING"><span className="truncate block max-w-[200px] md:max-w-[300px]">Due Date Approaching</span></SelectItem>
                          <SelectItem value="DUE_DATE_PASSED"><span className="truncate block max-w-[200px] md:max-w-[300px]">Due Date Passed</span></SelectItem>
                          <SelectItem value="TASK_CREATED"><span className="truncate block max-w-[200px] md:max-w-[300px]">Task Created</span></SelectItem>
                        </SelectContent>
                      </Select>

                      {triggerType === "TASK_MOVED" && (
                        <div className="pt-2">
                          <div className="text-xs text-muted-foreground mb-1">To column:</div>
                          <Select value={conditionCol} onValueChange={setConditionCol}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Select column..." /></SelectTrigger>
                            <SelectContent>
                              {columns.map(c => <SelectItem key={c.id} value={c.id}><span className="truncate block max-w-[200px] md:max-w-[300px]">{c.title}</span></SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 bg-background p-3 rounded border border-border/50 shadow-sm min-w-0">
                      <div className="flex items-center gap-2 mb-2 text-sm font-semibold border-b border-border/50 pb-2">
                        <Zap className="h-4 w-4 text-amber-500 shrink-0" /> Action
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">Do this automatically:</div>
                      <Select value={actionType} onValueChange={setActionType}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select action..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MOVE_TO_COLUMN"><span className="truncate block max-w-[200px] md:max-w-[300px]">Move to Column</span></SelectItem>
                          <SelectItem value="ASSIGN_USER"><span className="truncate block max-w-[200px] md:max-w-[300px]">Assign User</span></SelectItem>
                          <SelectItem value="ADD_LABEL"><span className="truncate block max-w-[200px] md:max-w-[300px]">Add Label</span></SelectItem>
                          <SelectItem value="REMOVE_LABEL"><span className="truncate block max-w-[200px] md:max-w-[300px]">Remove Label</span></SelectItem>
                          <SelectItem value="SET_DUE_DATE"><span className="truncate block max-w-[200px] md:max-w-[300px]">Set Due Date</span></SelectItem>
                          <SelectItem value="SEND_EMAIL_NOTIFICATION"><span className="truncate block max-w-[200px] md:max-w-[300px]">Email Notification</span></SelectItem>
                          <SelectItem value="POST_COMMENT"><span className="truncate block max-w-[200px] md:max-w-[300px]">Post Comment</span></SelectItem>
                          <SelectItem value="ADD_CHECKLIST_TEMPLATE"><span className="truncate block max-w-[200px] md:max-w-[300px]">Add Checklist</span></SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="pt-2">
                        {actionType === "MOVE_TO_COLUMN" && (
                          <Select value={actionTargetCol} onValueChange={setActionTargetCol}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Target column..." /></SelectTrigger>
                            <SelectContent>
                              {columns.map(c => <SelectItem key={c.id} value={c.id}><span className="truncate block max-w-[200px] md:max-w-[300px]">{c.title}</span></SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                        {actionType === "ASSIGN_USER" && (
                          <Select value={actionTargetUser} onValueChange={setActionTargetUser}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Target user..." /></SelectTrigger>
                            <SelectContent>
                              {members.map(m => <SelectItem key={m.user_id} value={m.user_id}><span className="truncate block max-w-[200px] md:max-w-[300px]">{m.profiles?.full_name}</span></SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                        {(actionType === "ADD_LABEL" || actionType === "REMOVE_LABEL") && (
                          <Select value={actionTargetLabel} onValueChange={setActionTargetLabel}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Target label..." /></SelectTrigger>
                            <SelectContent>
                              {labels.map(l => <SelectItem key={l.id} value={l.id}><span className="truncate block max-w-[200px] md:max-w-[300px]">{l.title || "No Title"} ({l.color})</span></SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                        {actionType === "SET_DUE_DATE" && (
                          <Input className="w-full" placeholder="Formula (e.g. now + 3 days)" value={actionDueDate} onChange={(e) => setActionDueDate(e.target.value)} />
                        )}
                        {actionType === "SEND_EMAIL_NOTIFICATION" && (
                          <Select value={actionEmailTarget} onValueChange={setActionEmailTarget}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Target email..." /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owner"><span className="truncate block max-w-[200px] md:max-w-[300px]">Workspace Owner</span></SelectItem>
                              <SelectItem value="assignees"><span className="truncate block max-w-[200px] md:max-w-[300px]">Task Assignees</span></SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        {actionType === "POST_COMMENT" && (
                          <Input className="w-full" placeholder="Bot comment text..." value={actionComment} onChange={(e) => setActionComment(e.target.value)} />
                        )}
                        {actionType === "ADD_CHECKLIST_TEMPLATE" && (
                          <Input className="w-full" placeholder="Items (comma separated)" value={actionChecklist} onChange={(e) => setActionChecklist(e.target.value)} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                  <Button variant="ghost" onClick={() => setIsCreating(false)}>{t("cancel", "Cancel")}</Button>
                  <Button onClick={handleCreate} disabled={!title || (triggerType === "TASK_MOVED" && !conditionCol)}>{t("save_rule", "Save Rule")}</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
