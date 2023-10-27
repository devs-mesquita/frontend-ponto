import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { notificationAtom } from "@/store";
import { useAtom } from "jotai";
import TopNotification from "@/components/TopNotification";

export default function Layout() {
  const notification = useAtom(notificationAtom)[0];
  return (
    <>
      <div id="notifications" />
      <div id="modal" />
      <Navbar />
      <Outlet />
      {notification.message && <TopNotification />}
    </>
  );
}
