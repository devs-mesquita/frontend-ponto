import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <div id="modal"></div>
      <Navbar />
      <Outlet />
    </>
  );
}
