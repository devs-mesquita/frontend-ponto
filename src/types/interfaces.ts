export interface AppDialog {
  isOpen: boolean;
  message: string;
  accept: () => void;
  reject: () => void;
}
