export type ChecklistType = "Daily" | "Weekly" | "Monthly";

export interface ChecklistItem {
  task: string;
  status: boolean;
  remarks: string;
}

export interface ChecklistSection {
  title: string;
  items: ChecklistItem[];
}
