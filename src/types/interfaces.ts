export interface AppDialog {
  isOpen: boolean;
  message: string;
  accept: () => void;
  reject: () => void;
}

export type AppNotification = {
  message: string;
  type: "error" | "success" | "";
};