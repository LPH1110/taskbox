export type TriggerType = 
  | "TASK_MOVED" 
  | "LABEL_ADDED" 
  | "LABEL_REMOVED" 
  | "CHECKLIST_COMPLETED" 
  | "DUE_DATE_APPROACHING" 
  | "DUE_DATE_PASSED" 
  | "TASK_CREATED";

export type ActionType = 
  | "MOVE_TO_COLUMN" 
  | "ASSIGN_USER" 
  | "ADD_LABEL" 
  | "REMOVE_LABEL" 
  | "SET_DUE_DATE" 
  | "SEND_EMAIL_NOTIFICATION" 
  | "POST_COMMENT" 
  | "ADD_CHECKLIST_TEMPLATE";

export interface AutomationTriggerPayload {
  boardId: string;
  triggerType: TriggerType;
  payload: Record<string, any>;
  depth?: number;
}

export interface AutomationActionConfig {
  type: ActionType;
  [key: string]: any;
}
