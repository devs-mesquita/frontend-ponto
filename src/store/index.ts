import { atom } from "jotai";
import { AppNotification } from "@/types/interfaces";

export const notificationAtom = atom<AppNotification>({
  message: "",
  type: "",
});

export const usingDefaultPasswordAtom = atom<boolean | null>(null);

export const notificationInitialState: AppNotification = {
  message: "",
  type: "",
};
