import ReactDOM from "react-dom";
import { useAtom } from "jotai";
import { notificationAtom, notificationInitialState } from "@/store";

export default function TopNotification() {
  const [notification, setNotification] = useAtom(notificationAtom);

  const handleClear = () => {
    setNotification(notificationInitialState);
  };

  return ReactDOM.createPortal(
    <div
      className={`z-20 flex w-full items-center px-4 py-2 text-center font-medium ${
        notification.type === "error"
          ? "bg-red-300 text-red-900"
          : "bg-green-300 text-green-800"
      }`}
    >
      <p className="mx-auto">{notification.message}</p>
      <span className="cursor-pointer hover:text-white" onClick={handleClear}>
        X
      </span>
    </div>,
    document.querySelector("#notifications")!,
  );
}
