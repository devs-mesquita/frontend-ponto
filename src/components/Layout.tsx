import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <div id="notifications" />
      <div id="modal" />
      <Navbar />
      <Outlet />
    </>
  );
}
